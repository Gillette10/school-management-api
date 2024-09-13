import { app } from '@azure/functions';
import { config } from 'dotenv';
import { ChangePassword } from '../controllers/misc/change_password';
import { CreateSchool } from '../controllers/management/create-school';
import { Authenticate } from '../middleware/authenticate';
import { CreateUsers } from '../controllers/management/create_users';
import { CreateStudents } from '../controllers/management/create-students';

config();

app.http('create-school', {
	methods: ['POST'],
	authLevel: 'anonymous',
	route: 'management/create-school',
	handler: CreateSchool,
});

app.http('create-users', {
	methods: ['POST'],
	authLevel: 'anonymous',
	route: 'management/create-users',
	handler: (request, context) => {
		return Authenticate(request, context, CreateUsers);
	},
});
app.http('create-students', {
	methods: ['POST'],
	authLevel: 'anonymous',
	route: 'management/create-students',
	handler: (request, context) => {
		return Authenticate(request, context, CreateStudents);
	},
});
