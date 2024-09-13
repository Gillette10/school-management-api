import { HttpRequest, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { prisma } from '../../../prisma';
import { CreateAuthUser } from '../../utils/create_auth_user';
import { errorHandler } from '../../features/error-handler';

export const CreateUsers = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		const schema = z.object({
			schoolId: z.string(),
			users: z.array(
				z.object({
					email: z.string(),
					name: z.string(),
					phoneNumber: z.string().optional(),
					role: z.enum(['ADMIN', 'TEACHER', 'PARENT']),
				}),
			),
		});

		const requestBody = await request.json();

		const data = schema.parse(requestBody);

		const permissions = context?.permissions as string[];
		console.log('🚀🚀  -> CreateUsers -> permissions:', permissions);
		if (!permissions.includes('full_access')) {
			return {
				status: 401,
				jsonBody: {
					message: 'Unauthorized',
				},
			};
		}

		const school = await prisma.school.findUnique({
			where: { id: data.schoolId },
		});

		if (!school) {
			return {
				status: 404,
				jsonBody: {
					message: 'School not found',
				},
			};
		}

		for (const user of data.users) {
			await prisma.user.create({
				data: {
					roles: [user.role],
					email: user.email,
					name: user.name,
					phoneNumber: user.phoneNumber || null,
					schoolId: data.schoolId,
				},
			});
		}

		await CreateAuthUser({
			users: data.users.map((user) => ({
				email: user.email,
				name: user.name,
				phoneNumber: user.phoneNumber || null,
				role: user.role,
			})),
			school: school,
		});

		return {
			status: 201,
			jsonBody: {
				message: 'Parents created successfully',
				data: data.users,
			},
		};
	} catch (error) {
		return errorHandler(error);
	}
};
