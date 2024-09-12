import { sign, verify } from 'jsonwebtoken';

export const generateToken = (userId: string, email: string, name: string) => {
	return sign({ userId, email, name }, process.env.JWT_SECRET as string, {
		expiresIn: '2h',
	});
};

export const verifyToken = (token: string) => {
	try {
		const decoded = verify(token, process.env.JWT_SECRET as string);
		return decoded;
	} catch (error) {
		console.error('Error verifying token:', error);
		return null;
	}
};
