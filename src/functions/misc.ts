import { app } from '@azure/functions';
import { config } from 'dotenv';
import { ChangePassword } from '../controllers/misc/change_password';
import { VerifyPasswordToken } from '../controllers/misc/verify_password_token';
import { Authenticate } from '../middleware/authenticate';

config();

app.http('change-password', {
	methods: ['POST'],
	authLevel: 'anonymous',
	route: 'misc/change-password',
	handler: ChangePassword,
});

app.http('verify-password-token', {
	methods: ['GET'],
	authLevel: 'anonymous',
	route: 'misc/verify-password-token',
	handler: VerifyPasswordToken,
});
