import { isIOSDebug } from './isIOSDebug';

let initialized = false;
const errors: string[] = [];
type Subscriber = (errs: string[]) => void;
const subs: Subscriber[] = [];

const notify = () => {
	subs.forEach((fn) => fn([...errors]));
};

export const initConsoleErrorCapture = () => {
	if (initialized || !isIOSDebug()) return;
	initialized = true;
	const orig = console.error;
	console.error = (...args: any[]) => {
		const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
		errors.push(msg);
		notify();
		orig(...args);
	};
};

export const subscribeConsoleErrors = (fn: Subscriber) => {
	subs.push(fn);
	fn([...errors]);
	return () => {
		const idx = subs.indexOf(fn);
		if (idx >= 0) subs.splice(idx, 1);
	};
};

export const getConsoleErrors = () => [...errors];
