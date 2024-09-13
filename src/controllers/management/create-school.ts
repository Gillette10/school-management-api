import { prisma } from '../../../prisma';
import { CreateAuthUser } from '../../utils/create_auth_user';
import { errorHandler } from '../../features/error-handler';
import { InvocationContext, HttpRequest } from '@azure/functions';
import { createSchoolSchema } from '../../validators/management_schema';

export const CreateSchool = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		const requestBody = await request.json();

		const data = createSchoolSchema.parse(requestBody);

		const school = await prisma.school.findFirst({
			where: {
				name: data.name,
			},
		});

		if (school) {
			return {
				status: 400,
				jsonBody: {
					message: 'School already exists',
					// data: school,
				},
			};
		}

		// check for at least one admin
		if (data.users.filter((user) => user.role === 'ADMIN').length === 0) {
			return {
				status: 400,
				jsonBody: {
					message: 'At least one admin is required',
				},
			};
		}

		const createdSchool = await prisma.school.create({
			data: {
				name: data.name,
				address: data.address,
				phoneNumber: data.phoneNumber,
				email: data.email,
				users: {
					create: data.users.map((user) => ({
						email: user.email,
						name: user.name,
						phoneNumber: user.phoneNumber || null,
						roles: [user.role],
					})),
				},
			},
		});

		// Loop through users to create them in Auth0 and assign roles
		await CreateAuthUser({
			users: data.users.map((user) => ({
				email: user.email,
				name: user.name,
				phoneNumber: user.phoneNumber || null,
				role: user.role,
			})),
			school: createdSchool,
		});

		return {
			status: 201,
			jsonBody: {
				message: 'school created successfully',
				data: createdSchool,
			},
		};
	} catch (error) {
		return errorHandler(error);
	}
};
