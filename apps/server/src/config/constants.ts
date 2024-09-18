import { SessionOptions } from 'express-session';
import { oneDayInMillis, oneMinInMillis } from '../utils/dates';

export const APP_URL = process.env.APP_URL as string;
export const APP_DOMAIN = new URL(APP_URL).hostname;
export const PORT = process.env.PORT || 3000;

export const MONGO_URI = process.env.MONGO_URI!;

export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_STAGING = process.env.NODE_ENV == 'staging';
export const IS_TEST = process.env.NODE_ENV == 'test';
export const IS_DEV = !IS_PROD && !IS_STAGING && !IS_TEST;

const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY!;
export const SESSION_OPTS: SessionOptions = {
	cookie: {
		domain: APP_DOMAIN,
		httpOnly: true,
		maxAge: oneDayInMillis * 30,
		// In development we are not using HTTPS so we must use 'strict' otherwise the browser will
		// ignore our cookie.
		// When using https, we use none so we always get the sid cookie. This is not insecure
		// because we are using HTTP Only and Secure.
		sameSite: IS_DEV ? 'strict' : 'none',
		secure: IS_PROD || IS_STAGING,
	},
	name: 'sid',
	resave: false, // whether to save the session if it wasn't modified during the request
	rolling: true, // whether to (re-)set cookie on every response
	saveUninitialized: false, // whether to save empty sessions to the store
	secret: SESSION_SECRET_KEY,
	proxy: true,
};
