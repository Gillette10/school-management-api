/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponseInit } from '@azure/functions';
import { Prisma } from '@prisma/client';
import { HttpError } from 'http-errors';
import { ZodError } from 'zod';

export async function errorHandler(err: any): Promise<HttpResponseInit> {
	const errorResponse =
		err instanceof HttpError
			? err.message
			: err?.response?.data || err?.message;

	console.error(errorResponse);

	const errorMap = new Map();

	if (err instanceof HttpError) {
		// Handle HTTP error
		errorMap.set('status', err.statusCode);
		errorMap.set('message', errorResponse);
	} else if (err instanceof ZodError) {
		// Handle Zod validation error
		errorMap.set('status', 400);
		errorMap.set(
			'message',
			err.errors.map((e) => {
				return `${e.path.join('.')}: ${e.message}`;
			}),
		);
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		switch (err.code) {
			case 'P2000':
				// Value too long for column
				errorMap.set('status', 400);
				errorMap.set(
					'message',
					`Value too long for column: ${err.meta?.target}`,
				);
				break;
			case 'P2001':
				// Record not found
				errorMap.set('status', 404);
				errorMap.set(
					'message',
					`Record not found for query: ${err.meta?.modelName}`,
				);
				break;
			case 'P2002':
				// Unique constraint failed
				errorMap.set('status', 400);
				errorMap.set(
					'message',
					`Unique constraint failed on the fields: ${err.meta?.target}`,
				);
				break;
			case 'P2003':
				// Foreign key constraint failed
				errorMap.set('status', 400);
				errorMap.set(
					'message',
					`Foreign key constraint failed on the fields: ${err.meta?.target}`,
				);
				break;
			case 'P2025':
				// Record to update not found
				errorMap.set('status', 404);
				errorMap.set('message', `Record to update not found`);
				break;
			case 'P2026':
				// Record to delete not found
				errorMap.set('status', 404);
				errorMap.set('message', `Record to delete not found`);
				break;
			default:
				// Handle other Prisma errors
				errorMap.set('status', 500);
				errorMap.set(
					'message',
					`An unexpected error occurred with the database: ${err.code}`,
				);
		}
	} else if (err.name === 'CastError' && err.kind === 'ObjectId') {
		errorMap.set('status', 404);
		errorMap.set('message', 'Resource not found');
	} else {
		// Default error handling
		errorMap.set('status', err.statusCode || 500);
		errorMap.set('message', errorResponse);
	}

	// Error response
	return {
		status: errorMap.get('status'),
		jsonBody: {
			message: errorMap.get('message'),
		},
	};
}
