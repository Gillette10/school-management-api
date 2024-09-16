import { HttpRequest, InvocationContext } from '@azure/functions';
import { errorHandler } from '../../features/error-handler';
import { prisma } from '../../../prisma';

export const ListTeachers = async (
	request: HttpRequest,
	context: InvocationContext,
) => {
	try {
		const page = Number(request?.query?.get('page')) || 1;
		const pageSize = Number(request?.query?.get('pageSize')) || 10;
		const search = request?.query?.get('search') || '';
		const id = request?.query?.get('id');
		const schoolId = request?.query?.get('schoolId');

		// Ensure required field is present
		if (!schoolId) {
			return {
				status: 400,
				jsonBody: { message: 'schoolId is required.' },
			};
		}

		// Permission check
		const permissions = context?.permissions as string[];
		if (!permissions.includes('full_access')) {
			return {
				status: 401,
				jsonBody: { message: 'Unauthorized' },
			};
		}

		// If an ID is provided, fetch the teacher by ID
		if (id) {
			const teacher = await getTeacherById(id, schoolId);
			if (!teacher) {
				return {
					status: 404,
					jsonBody: { message: 'Teacher not found' },
				};
			}
			return {
				status: 200,
				jsonBody: { data: teacher },
			};
		}

		// Fetch all teachers based on search criteria
		const { data, totalCount } = await getAllTeachers(
			page,
			pageSize,
			schoolId,
			search,
		);

		return {
			status: 200,
			jsonBody: { data, totalCount },
		};
	} catch (error) {
		return errorHandler(error);
	}
};

// Fetch teacher by ID
async function getTeacherById(id: string, schoolId: string) {
	return await prisma.user.findFirst({
		where: {
			id,
			schoolId,
			roles: { has: 'TEACHER' },
		},
	});
}

// Fetch teachers by search query, page, and schoolId
async function getAllTeachers(
	page: number,
	pageSize: number,
	schoolId: string,
	search: string,
) {
	const searchIsEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(search); // Simple email regex check

	const [data, totalCount] = await Promise.all([
		prisma.user.findMany({
			where: {
				schoolId,
				roles: { has: 'TEACHER' },
				OR: searchIsEmail
					? [{ email: { contains: search } }]
					: [{ name: { contains: search } }],
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.user.count({
			where: {
				schoolId,
				roles: { has: 'TEACHER' },
			},
		}),
	]);

	return { data, totalCount };
}
