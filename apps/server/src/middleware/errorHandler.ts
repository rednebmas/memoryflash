import { ErrorRequestHandler } from 'express';

export class Err {
	readonly msg: string;
	readonly httpStatus: number;
	readonly more: any;

	constructor(msg: string = 'An unkown error occured', httpStatus: number = 400, more: any = {}) {
		this.msg = msg;
		this.httpStatus = httpStatus;
		this.more = more;
	}
}

export const customErrorHandler: ErrorRequestHandler = async (err, req, res, next) => {
	let errorMsg = 'An unknown error occurred. Please contact support if this issue persists.';
	let status = 500;
	let more = {};
	if (err instanceof Error && err.message == 'session expired') {
		errorMsg = 'session expired';
		status = 401;
	} else if (err instanceof Err) {
		more = err.more;
		errorMsg = err.msg;
		status = err.httpStatus;
	} else if (err.name === 'ValidationError') {
		errorMsg = err.message;
		status = 400;
	}

	console.error(err);
	console.trace();

	res.status(status).json({ ...more, msg: errorMsg });
};
