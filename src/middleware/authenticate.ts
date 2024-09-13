import {
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';
import { JwtPayload, decode, verify, sign } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { errorHandler } from '../features/error-handler';
import { Unauthorized } from 'http-errors';

type NextFunction = (
	request: HttpRequest,
	context: InvocationContext,
) => Promise<HttpResponseInit>;

// Define JWKS client to get the public key for verification
const client = jwksClient({
	jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

export const Authenticate = async (
	request: HttpRequest,
	context: InvocationContext,
	nextFunction: NextFunction,
) => {
	try {
		// Extract the token from the Authorization header
		const authHeader = request.headers.get('authorization');
		const token = authHeader ? authHeader.split(' ')[1] : null;

		// console.log('🚀🚀  -> token:', token);

		if (!token) {
			context.log('Unauthorized: No token provided');
			return {
				status: 401,
				jsonBody: {
					message: 'Unauthorized',
				},
			};
		}

		const decoded = decode(token, { complete: true });

		// console.log('🚀🚀  -> decoded:', decoded);

		const kid = decoded.header.kid;

		const key = await client.getSigningKey(kid);
		const signingKey = key.getPublicKey();

		// console.log('🚀🚀  -> client:', signingKey);

		const verified = verify(token, signingKey, {
			audience: process.env.AUTH0_AUDIENCE_FRONTEND,
			issuer: process.env.AUTH0_ISSUER_BASE_URL,
			algorithms: ['RS256'],
		}) as JwtPayload;

		if (!verified) throw Unauthorized('invalid bearer token');

		const permissions = verified.permissions;

		context['permissions'] = permissions;

		return await nextFunction(request, context);
	} catch (error) {
		context.log('Error in authentication middleware:', error);
		return errorHandler(error);
	}
};
