import React from 'react';
import { getConsoleErrors, initConsoleErrorCapture, subscribeConsoleErrors } from './consoleErrors';

export const useConsoleErrors = (): string[] => {
	const [errs, setErrs] = React.useState<string[]>(getConsoleErrors());
	React.useEffect(() => {
		initConsoleErrorCapture();
		return subscribeConsoleErrors(setErrs);
	}, []);
	return errs;
};
