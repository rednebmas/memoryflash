const MAX_ERRORS = 50;
let initialized = false;
const errors: string[] = [];
type Subscriber = (errs: string[]) => void;
const subs: Subscriber[] = [];

const notify = () => {
	subs.forEach((fn) => fn([...errors]));
};

const record = (msg: string) => {
	errors.push(msg);
	if (errors.length > MAX_ERRORS) errors.shift();
	notify();
};

export const initConsoleErrorCapture = () => {
	if (initialized) return;
	initialized = true;
	const orig = console.error;
	console.error = (...args: any[]) => {
		record(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
		orig(...args);
	};
	window.addEventListener('error', (e) => record(`${e.message} (${e.filename}:${e.lineno})`));
	window.addEventListener('unhandledrejection', (e) =>
		record(`Unhandled rejection: ${e.reason}`),
	);
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
