import { z } from 'zod';

export const createSchoolSchema = z.object({
	name: z.string(),
	address: z.string().optional(),
	phoneNumber: z.string().optional(),
	email: z.string().email(),
	users: z.array(
		z.object({
			email: z.string().email(),
			name: z.string(),
			phoneNumber: z.string().optional(),
			role: z.enum(['ADMIN']),
		}),
	),
});
