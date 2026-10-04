export type CardStats = {
	attempts: number;
	lastAttemptedAt: string;
	timeStudyingPerDay: { [date: string]: number };
};

export type StatsByCardId = {
	[cardId: string]: CardStats;
};
