export type StatsByCardId = {
	[cardId: string]: {
		attempts: number;
		timeStudyingPerDay: { [date: string]: number };
	};
};
