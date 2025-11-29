export const normalizeTimezone = (timezone?: string, fallback = 'UTC') => {
	const trimmed = timezone?.trim();
	if (!trimmed) return fallback;
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: trimmed });
		return trimmed;
	} catch {
		return fallback;
	}
};

export const oneDayInMillis = 24 * 60 * 60 * 1000;
export const oneMinInMillis = 1000 * 60;
export const oneHourInMillis = oneMinInMillis * 60;
export const oneYearInMillis = oneDayInMillis * 365;
export const oneMinInSeconds = 60;
export const oneHourInSeconds = oneMinInSeconds * 60;
export const oneDayInSeconds = oneHourInSeconds * 24;
export const oneWeekInSeconds = oneDayInSeconds * 7;
export const oneMonthInSeconds = oneDayInSeconds * 30;
