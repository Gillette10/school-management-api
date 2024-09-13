import { HttpRequest, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { prisma } from '../../../prisma';
import { CreateAuthUser } from '../../utils/create_auth_user';
import { errorHandler } from '../../features/error-handler';

export const CreateStudents = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		const schema = z.object({
			schoolId: z.string(),
			students: z.array(
				z.object({
					email: z.string(),
					name: z.string(),
					phoneNumber: z.string().optional(),
					parentId: z.string().optional(),
				}),
			),
		});

		const requestBody = await request.json();

		const data = schema.parse(requestBody);

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

		// check if the school exists
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

		// check if the parent ids has a role of parent in the database
		const parentIds = data.students.map(
			(student) => student.parentId,
		) as string[];

		console.log('🚀🚀  -> CreateStudents -> parentIds:', parentIds);

		const parents = await prisma.user.findMany({
			where: {
				id: {
					in: parentIds,
				},
				roles: {
					has: 'PARENT',
				},
			},
			select: {
				id: true,
			},
		});

		for (const parentId of parentIds) {
			if (!parents.find((parent) => parent.id === parentId)) {
				return {
					status: 400,
					jsonBody: {
						message: 'Parent not found',
					},
				};
			}
		}

		console.log('🚀🚀  -> CreateStudents -> parents:', parents);

		const createdStudents = await prisma.user.createMany({
			data: data.students.map((student) => ({
				email: student.email,
				name: student.name,
				phoneNumber: student.phoneNumber || null,
				parentId: student.parentId,
				roles: ['STUDENT'],
				schoolId: data.schoolId,
			})),
		});

		console.log('🚀🚀  -> CreateStudents -> createdStudents:', createdStudents);

		await CreateAuthUser({
			users: data.students.map((student) => ({
				email: student.email,
				name: student.name,
				phoneNumber: student.phoneNumber || null,
				role: 'STUDENT',
			})),
			school: school,
		});

		return {
			status: 201,
			jsonBody: {
				message: 'Students created successfully',
				data: createdStudents,
			},
		};
	} catch (error) {
		return errorHandler(error);
	}
};
