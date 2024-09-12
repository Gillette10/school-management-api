import {
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';
import { authClient } from '../../utils/config';
import { errorHandler } from '../../features/error-handler';
import { z } from 'zod';

export const SignIn = async (
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> => {
	try {
		const requestData = await request.json();

		const schema = z.object({
			email: z.string().email(),
			password: z.string(),
		});
		const { email, password } = schema.parse(requestData);

		// Authenticate the user using Resource Owner Password Grant
		const tokenResponse = await authClient.oauth.passwordGrant({
			username: email,
			password: password,
			realm: 'Username-Password-Authentication',
			audience: process.env.AUTH0_AUDIENCE_FRONTEND,
		});

		return {
			status: 200,
			jsonBody: {
				accessToken: tokenResponse.data.access_token,
				idToken: tokenResponse.data.id_token,
				expiresIn: tokenResponse.data.expires_in,
			},
		};
	} catch (error) {
		console.error('Error during sign-in:', error);
		return errorHandler(error);
	}
};
