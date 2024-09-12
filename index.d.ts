import '@azure/functions';

declare module '@azure/functions' {
	export interface InvocationContext {
		permissions?: [];
	}
}
