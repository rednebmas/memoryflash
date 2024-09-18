import { nullableGet } from '../../lib/keypaths';

export const loggedOutByServerMsg = 'Logged out by server';
export const unkownErrorMsg = 'Unkown error. Contact support if the issue persists';

export const NetworkErrorMsg = (error: any) => {
	console.error(error);

	if (error === undefined) {
		return unkownErrorMsg;
	} else if (error === loggedOutByServerMsg) {
		return loggedOutByServerMsg;
	} else if (error.toString() === 'Error: Network Error') {
		return 'Network error.';
	} else if (window.navigator.onLine === false) {
		return 'You are offline. Please check your internet connection.';
	}

	return nullableGet(error, 'response.data.msg') || unkownErrorMsg;
};
