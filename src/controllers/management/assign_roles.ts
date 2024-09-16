import { HttpRequest, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { errorHandler } from '../../features/error-handler';
import { managementClient } from '../../utils/config';
import { prisma } from '../../../prisma';

export const AssignRoleToUser = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		// Schema validation
		const schema = z.object({
			email: z.string().email(),
			role: z.enum(['ADMIN', 'TEACHER', 'PARENT', 'STUDENT']),
		});

		const requestBody = await request.json();
		const data = schema.parse(requestBody);

		// Check permissions
		const permissions = context?.permissions as string[];
		if (!permissions.includes('full_access')) {
			return {
				status: 401,
				jsonBody: {
					message: 'Unauthorized',
				},
			};
		}

		// Step 1: Find the user in Auth0 by email
		const { data: users } = await managementClient.users.getAll();

		const user = users.find((u) => u.email === data.email);

		console.log('🚀🚀  -> user:', user);

		if (!user) {
			return {
				status: 404,
				jsonBody: {
					message: 'User not found in Auth0.',
				},
			};
		}

		// Step 2: Fetch all roles from Auth0
		const { data: roles } = await managementClient.roles.getAll();

		// Find the IDs of the roles specified for the user
		const roleId = roles.find((r) => r.name === data.role);

		if (!roleId) {
			return {
				status: 400,
				jsonBody: {
					message: 'Role not found in Auth0.',
				},
			};
		}

		// Step 3: Assign roles to the user
		await managementClient.users.assignRoles(
			{ id: user.user_id },
			{ roles: [roleId.id] },
		);

		// Step 4: Update the user's app_metadata with the new roles
		const updatedRoles = [...(user.app_metadata.roles || []), data.role];

		console.log('🚀🚀  -> updatedRoles:', updatedRoles);

		await managementClient.users.update(
			{
				id: user.user_id,
			},
			{
				app_metadata: {
					roles: updatedRoles,
				},
			},
		);

		await prisma.user.update({
			where: {
				email: data.email,
			},
			data: {
				roles: updatedRoles,
			},
		});

		return {
			status: 200,
			jsonBody: {
				message: 'Role assigned successfully.',
				assignedRole: data.role,
			},
		};
	} catch (error) {
		return errorHandler(error);
	}
};
