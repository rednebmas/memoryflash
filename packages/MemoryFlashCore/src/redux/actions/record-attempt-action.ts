import ObjectId from 'bson-objectid';
import { schedulers } from '../../lib/schedulers';
import { nextReview } from '../../lib/schedulers/nextReview';
import { Attempt } from '../../types/Attempt';
import {
	activeSchedulerSelector,
	currDeckReviewsSelector,
} from '../selectors/activeSchedulerSelector';
import { selectActivePresentationMode } from '../selectors/activePresentationModeSelector';
import { attemptsStatsSelector } from '../selectors/attemptsStatsSelector';
import { currDeckAllWithAttemptsSelector } from '../selectors/currDeckCardsWithAttempts';
import { attemptsActions } from '../slices/attemptsSlice';
import { midiActions } from '../slices/midiSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { AppThunk, SyncAppThunk } from '../store';
import { schedule } from './schedule-cards-action';
import { updateLocalStreak } from './update-local-streak-action';

const recordSessionReview =
	(attempt: Attempt): SyncAppThunk =>
	(dispatch, getState) => {
		if (attempt.scheduler !== 'recall') return;
		const prev = currDeckReviewsSelector(getState())[attempt.cardId];
		const review = nextReview(prev, attempt.correct, new Date(attempt.attemptedAt));
		dispatch(schedulerActions.setSessionReview({ cardId: attempt.cardId, review }));
	};

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

		const card = currDeckAllWithAttemptsSelector(getState())[currCardId];
		const scheduler = schedulers[activeSchedulerSelector(getState())];
		const timeTaken = (Date.now() - currStartTime) / 1000;

		// if the user takes too long to answer, we don't want to record the attempt
		const attemptsStats = attemptsStatsSelector(getState());
		if (!attemptsStats) return;
		const { length, tooLongTime } = attemptsStats;
		if (scheduler.discardSlowAttempts && timeTaken > tooLongTime && length > 10) {
			console.log(`[scheduling] Not recording attempt, user took too long!`);
			dispatch(midiActions.waitUntilEmpty());
			dispatch(schedulerActions.dequeueNextCard());
			return;
		}

		if (!card) return;

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
			scheduler: scheduler.id,
		};

		dispatch(midiActions.waitUntilEmpty());
		dispatch(attemptsActions.upsert([attempt]));
		dispatch(recordSessionReview(attempt));

		console.log(`[scheduling] Recording attempt: ${correct}`);

		dispatch(schedulerActions.dequeueNextCard());
		if (getState().scheduler.nextCards.length < 3) {
			dispatch(schedule(card.deckId));
		}

		dispatch(updateLocalStreak(attempt.attemptedAt));

		await api.post('/attempts', attempt);
	};
