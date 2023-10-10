export class ErrorWithCode extends Error {
	public code: string;
	constructor(message?: string) {
		super(message);
		this.code = message;
	}
}