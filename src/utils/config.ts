import { AuthenticationClient, ManagementClient } from 'auth0';

export const managementClient = new ManagementClient({
	domain: String(process.env.AUTH0_DOMAIN),
	clientId: String(process.env.AUTH0_CLIENT_ID),
	clientSecret: String(process.env.AUTH0_CLIENT_SECRET),
	audience: String(process.env.AUTH0_AUDIENCE),
});

export const authClient = new AuthenticationClient({
	domain: String(process.env.AUTH0_DOMAIN),
	clientId: String(process.env.AUTH0_CLIENT_ID_FRONTEND),
	clientSecret: String(process.env.AUTH0_CLIENT_SECRET_FRONTEND),
});
