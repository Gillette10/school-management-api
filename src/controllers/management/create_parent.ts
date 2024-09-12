import { HttpRequest, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { prisma } from '../../../prisma';
import { CreateAuthUser } from '../../utils/create_auth_user';
import { errorHandler } from '../../features/error-handler';

export const CreateParents = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		const schema = z.object({
			schoolId: z.string(),
			parents: z.array(
				z.object({
					email: z.string(),
					name: z.string(),
					phoneNumber: z.string().optional(),
				}),
			),
		});

		const permissions = context?.permissions as string[];
		console.log('🚀🚀  -> CreateParents -> permissions:', permissions);
		if (!permissions.includes('full_access')) {
			return {
				status: 401,
				jsonBody: {
					message: 'Unauthorized',
				},
			};
		}

		const requestBody = await request.json();

		const data = schema.parse(requestBody);

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

		const createdParents = await prisma.user.createMany({
			data: data.parents.map((parent) => ({
				email: parent.email,
				name: parent.name,
				phoneNumber: parent.phoneNumber || null,
				role: 'parent',
				schoolId: data.schoolId,
			})),
		});

		console.log('🚀🚀  -> CreateParents -> updatedParent:', createdParents);

		await CreateAuthUser({
			users: data.parents.map((parent) => ({
				email: parent.email,
				name: parent.name,
				phoneNumber: parent.phoneNumber || null,
				role: 'parent',
			})),
			school: school,
		});

		return {
			status: 201,
			jsonBody: {
				message: 'Parents created successfully',
			},
		};
	} catch (error) {
		errorHandler(error);
	}
};
