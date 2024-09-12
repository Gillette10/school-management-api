import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

export async function hellworld(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	context.log(`Http function processed request for url "${request.url}"`);

	const name = request.query.get('name') || (await request.text()) || 'world';

	return { body: `Hello, ${name} comign soon!` };
}

app.http('hellworld', {
	methods: ['GET', 'POST'],
	authLevel: 'anonymous',
	handler: hellworld,
});
