import ObjectId from 'bson-objectid';
import { Attempt } from '../../types/Attempt';
import { selectActivePresentationMode } from '../selectors/activePresentationModeSelector';
import { attemptsStatsSelector } from '../selectors/attemptsStatsSelector';
import { currDeckWithAttemptsSelector } from '../selectors/currDeckCardsWithAttempts';
import { attemptsActions } from '../slices/attemptsSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { AppThunk } from '../store';
import { schedule } from './schedule-cards-action';

export const recordAttempt =
	(correct: boolean): AppThunk =>
	async (dispatch, getState, { api }) => {
		const userId = getState().auth.user?._id;
		const { currStartTime, batchId, currCard: currCardId } = getState().scheduler;

		if (!userId || !currCardId) return;
		if (!correct) {
			dispatch(schedulerActions.markCurrIncorrect(currCardId));
			return;
		}

		const card = currDeckWithAttemptsSelector(getState())[currCardId];
		const timeTaken = (Date.now() - currStartTime) / 1000;

		// if the user takes too long to answer, we don't want to record the attempt
		const attemptsStats = attemptsStatsSelector(getState());
		if (!attemptsStats) return;
		const { length, tooLongTime } = attemptsStats;
		if (correct && timeTaken > tooLongTime && length > 10) {
			console.log(`[scheduling] Not recording attempt, user took too long!`);
			dispatch(schedulerActions.dequeueNextCard());
			return;
		}

		const attempt: Attempt = {
			_id: new ObjectId().toHexString(),
			userId,
			cardId: card._id,
			deckId: card.deckId,
			batchId,
			correct: correct && !getState().scheduler.incorrect,
			timeTaken: Math.min(60, (Date.now() - currStartTime) / 1000),
			attemptedAt: new Date().toISOString(),
			presentationMode: selectActivePresentationMode(getState()),
		};

		dispatch(attemptsActions.upsert([attempt]));

		console.log(`[scheduling] Recording attempt: ${correct}`);

		dispatch(schedulerActions.dequeueNextCard());
		if (getState().scheduler.nextCards.length < 3) {
			dispatch(schedule(card.deckId));
		}

		await api.post('/attempts', attempt);
	};
