import { app } from '@azure/functions';
import { config } from 'dotenv';
import { Authenticate } from '../middleware/authenticate';
import { CreateUsers } from '../controllers/management/create_users';
import { CreateStudents } from '../controllers/management/create-students';
import { AssignRoleToUser } from '../controllers/management/assign_roles';
import { ListTeachers } from '../controllers/school/list_teachers';

config();

app.http('list-teachers', {
	methods: ['GET'],
	authLevel: 'anonymous',
	route: 'school/list-teachers',
	handler: (request, context) => {
		return Authenticate(request, context, ListTeachers);
	},
});
