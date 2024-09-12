import { HttpRequest, InvocationContext } from '@azure/functions';
import * as z from 'zod';
import { verifyToken } from '../../utils/generate_token';
import { errorHandler } from '../../features/error-handler';

export const VerifyPasswordToken = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		const schema = z.object({
			token: z.string(),
		});

		const token = request?.query?.get('token');

		// console.log('🚀🚀  -> token:', token);

		const data = schema.parse({ token });

		const decoded = verifyToken(data.token);

		if (!decoded) {
			return {
				status: 401,
				jsonBody: {
					message: 'Invalid token',
				},
			};
		}

		// console.log('🚀🚀  -> VerifyPasswordToken -> decoded:', decoded);

		return {
			status: 200,
			jsonBody: {
				message: 'Password token verified successfully',
				data: decoded,
			},
		};
	} catch (error) {
		console.error('Error verifying password token:', error);
		return errorHandler(error);
	}
};
