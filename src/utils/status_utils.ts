interface Status {
	code: number;
	customCode: string;
}

const statusMessages: Record<number, Status> = {
	200: {
		code: 200,
		customCode: 'SUCCESS',
	},
	201: {
		code: 201,
		customCode: 'CREATION_SUCCESS',
	},
	400: {
		code: 400,
		customCode: 'BAD_REQUEST',
	},
	401: {
		code: 401,
		customCode: 'UNAUTHORIZED',
	},
	403: {
		code: 403,
		customCode: 'FORBIDDEN',
	},
	404: {
		code: 404,
		customCode: 'NOT_FOUND',
	},
	409: {
		code: 409,
		customCode: 'CONFLICT',
	},
	413: {
		code: 413,
		customCode: 'PAYLOAD_TOO_LARGE',
	},
	429: {
		code: 429,
		customCode: 'RATE_LIMIT_EXCEEDED',
	},
	500: {
		code: 500,
		customCode: 'INTERNAL_SERVER_ERROR',
	},
	503: {
		code: 503,
		customCode: 'SERVICE_UNAVAILABLE',
	},
};

// Utility function to get the status object based on the status code
export function getStatusByCode(code: number) {
	return (
		statusMessages[code] || {
			code: 500,
			customCode: 'UNKNOWN_ERROR',
		}
	);
}
