import { generateToken } from './generate_token';
import { managementClient } from './../utils/config';

interface User {
	email: string;
	name: string;
	role: 'admin' | 'teacher' | 'parent' | 'student';
	phoneNumber?: string | undefined;
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
		// Step 1: Create the user in Auth0
		const createdUser = await managementClient.users.create({
			email: user.email,
			name: user.name,
			connection: 'Username-Password-Authentication',
			password: 'PASSWORD@123',
			app_metadata: {
				schoolId: school.id,
				role: user.role,
				name: user.name,
				schoolName: school.name,
			},
		});

		console.log('Management Client created user:', createdUser);

		// Step 2: Assign roles to the user
		const rolesMapping = {
			admin: 'Admin',
			teacher: 'Teacher',
			parent: 'Parent',
			student: 'Student',
		};

		const roleName = rolesMapping[user.role];

		// Fetch the role ID for the specified role name
		const { data: roles } = await managementClient.roles.getAll();

		const role = roles.find((r) => r.name === roleName);

		if (!role) {
			console.error(`Role ${roleName} not found in Auth0.`);
			continue;
		}

		await managementClient.users.assignRoles(
			{
				id: createdUser.data.user_id,
			},
			{
				roles: [role.id],
			},
		);

		// Step 3: Send change password to the user via email
		const token = generateToken(
			createdUser.data.user_id,
			createdUser.data.email,
			createdUser.data.name,
		);
		let url = new URL(process.env.FRONTEND_URL as string);
		url.searchParams.append('token', token);

		console.log('🚀🚀  -> url:', url.href);
		// const emailBody = await GetEmailTemplate(user.name, url.href);

		// await sendEmail(createdUser.data.email, emailBody);
	}
};
