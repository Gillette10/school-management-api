import { HttpError } from 'http-errors';
import * as z from 'zod';
import { HttpRequest, InvocationContext } from '@azure/functions';
import { managementClient } from '../../utils/config';
import { errorHandler } from '../../features/error-handler';

export const ChangePassword = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		const schema = z.object({
			userId: z.string(),
			password: z.string(),
		});

		const requestBody = await request.json();

		console.log('🚀🚀  -> data:', requestBody);

		const data = schema.parse(requestBody);

		const user = await managementClient.users.update(
			{
				id: data.userId,
			},
			{
				password: data.password,
			},
		);

		if (!user.data) {
			return {
				status: 404,
				jsonBody: {
					message: 'User not found',
				},
			};
		}

		console.log('🚀🚀  -> ChangePassword -> user:', user);

		return {
			status: 200,
			jsonBody: {
				message: 'Password changed successfully',
			},
		};
	} catch (error) {
		console.error('Error changing password:', error);

		return errorHandler(error);
	}
};
