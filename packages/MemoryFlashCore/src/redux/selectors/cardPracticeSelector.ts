import { practiceStatsLabel } from '../../lib/practiceStats';
import { ReduxState } from '../store';

export const cardPracticeLabelSelector = (state: ReduxState, cardId: string) => {
	const stats = state.userDeckStats.statsByCardId;
	return stats ? practiceStatsLabel(stats[cardId], new Date()) : undefined;
};
