import { generateToken } from './generate_token';
import { managementClient } from './../utils/config';
import { SendChangePasswordNotification } from '../features/send_notification';

interface User {
	email: string;
	name: string;
	role: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
	phoneNumber?: string;
}

interface School {
	name: string;
	id: string;
}

export const CreateAuthUser = async ({
	users,
	school,
}: {
	users: User[];
	school: School;
}) => {
	for (const user of users) {
		try {
			// Step 1: Create the user in Auth0
			const createdUser = await managementClient.users.create({
				email: user.email,
				name: user.name,
				connection: 'Username-Password-Authentication',
				password: 'PASSWORD@123',
				app_metadata: {
					schoolId: school.id,
					role: user.role,
					roles: [user.role],
					name: user.name,
					schoolName: school.name,
				},
			});

			console.log('Management Client created user:', createdUser);

			// Step 2: Assign role to the user
			const { data: roles } = await managementClient.roles.getAll();

			// Find the ID of the role specified for the user
			const role = roles.find((r) => r.name === user.role);

			if (!role) {
				console.error(`Role ${user.role} not found in Auth0.`);
				continue;
			}

			// Assign the role to the user
			await managementClient.users.assignRoles(
				{
					id: createdUser.data.user_id,
				},
				{
					roles: [role.id],
				},
			);

			// Step 3: Send change password notification to the user via email
			const token = generateToken(
				createdUser.data.user_id,
				createdUser.data.email,
				createdUser.data.name,
			);
			const url = new URL(process.env.FRONTEND_URL as string);
			url.searchParams.append('token', token);

			console.log('🚀🚀  -> url:', url.href);
			await SendChangePasswordNotification(user.name, user.email, url.href);
		} catch (error) {
			console.error(`Failed to create or manage user: ${user.email}`, error);
		}
	}
};
