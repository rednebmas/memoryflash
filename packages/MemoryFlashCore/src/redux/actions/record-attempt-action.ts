import ObjectId from 'bson-objectid';
import { diagnostics } from '../../lib/diagnosticLog';
import { schedulers } from '../../lib/schedulers';
import { nextReview } from '../../lib/schedulers/nextReview';
import { Attempt } from '../../types/Attempt';
import {
	activeSchedulerSelector,
	currDeckClockSelector,
	currDeckReviewsSelector,
	missRepeatsSelector,
} from '../selectors/activeSchedulerSelector';
import { selectActivePresentationMode } from '../selectors/activePresentationModeSelector';
import { attemptsStatsSelector } from '../selectors/attemptsStatsSelector';
import { currDeckAllWithAttemptsSelector } from '../selectors/currDeckCardsWithAttempts';
import {
	attemptTimingSelector,
	deckLadderSelector,
	deckRhythmSettingsSelector,
	rhythmReportSelector,
} from '../selectors/rhythmSelectors';
import { stepLadder } from '../../lib/rhythm/tempoLadder';
import { attemptsActions } from '../slices/attemptsSlice';
import { midiActions } from '../slices/midiSlice';
import { rhythmActions } from '../slices/rhythmSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { AppThunk, ReduxState, SyncAppThunk } from '../store';
import { schedule } from './schedule-cards-action';
import { updateLocalStreak } from './update-local-streak-action';

const recordSessionReview =
	(attempt: Attempt): SyncAppThunk =>
	(dispatch, getState) => {
		if (attempt.scheduler !== 'recall') return;
		const prev = currDeckReviewsSelector(getState())[attempt.cardId];
		const review = nextReview(prev, attempt.correct, currDeckClockSelector(getState()));
		dispatch(schedulerActions.setSessionReview({ cardId: attempt.cardId, review }));
	};

const stepSessionLadder =
	(attempt: Attempt): SyncAppThunk =>
	(dispatch, getState) => {
		if (!attempt.timing) return;
		const { bpm } = deckRhythmSettingsSelector(getState());
		const result = { bpm: attempt.timing.bpm, correct: attempt.correct };
		const ladder = stepLadder(deckLadderSelector(getState()), bpm, result);
		dispatch(rhythmActions.setSessionLadder({ deckId: attempt.deckId, ladder }));
	};

const requeueAtGap =
	(attempt: Attempt): SyncAppThunk =>
	(dispatch, getState) => {
		const review = getState().scheduler.sessionReviews[attempt.cardId];
		const gap = review && schedulers[attempt.scheduler ?? 'speed'].requeueGap(review);
		if (!gap) return;
		dispatch(schedule(attempt.deckId, { to: gap, exclude: attempt.cardId }));
		dispatch(schedulerActions.insertCard({ cardId: attempt.cardId, gap }));
	};

const retryStreakAfterPlay = ({ scheduler }: ReduxState) => {
	if (scheduler.incorrect) return 0;
	return scheduler.retryStreak === undefined ? undefined : scheduler.retryStreak + 1;
};

const moveOn =
	(attempt: Attempt, streak: number | undefined): SyncAppThunk =>
	(dispatch, getState) => {
		if (streak !== undefined && streak < missRepeatsSelector(getState()))
			return dispatch(schedulerActions.retryCurrCard(streak));
		dispatch(schedulerActions.dequeueNextCard());
		if (streak === undefined) dispatch(requeueAtGap(attempt));
		if (getState().scheduler.nextCards.length < 3) dispatch(schedule(attempt.deckId));
	};

export const recordAttempt =
	(correct: boolean): AppThunk =>
	async (dispatch, getState, { api }) => {
		const userId = getState().auth.user?._id;
		const { currStartTime, batchId, currCard: currCardId } = getState().scheduler;

		if (!userId || !currCardId) return;
		const scheduler = schedulers[activeSchedulerSelector(getState())];
		if (!correct) {
			const step = getState().scheduler.multiPartCardIndex;
			diagnostics.log('grading', `wrong answer step=${step}`);
			dispatch(schedulerActions.markCurrIncorrect());
			return;
		}

		const card = currDeckAllWithAttemptsSelector(getState())[currCardId];
		const timeTaken = (Date.now() - currStartTime) / 1000;
		const timing = attemptTimingSelector(getState());
		dispatch(rhythmActions.setLastReport(rhythmReportSelector(getState())));

		// if the user takes too long to answer, we don't want to record the attempt
		const attemptsStats = attemptsStatsSelector(getState());
		if (!attemptsStats) return;
		const { length, tooLongTime } = attemptsStats;
		const streak = retryStreakAfterPlay(getState());
		const discardSlow = scheduler.discardSlowAttempts && !timing && streak === undefined;
		if (discardSlow && timeTaken > tooLongTime && length > 10) {
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
			correct: !getState().scheduler.incorrect,
			timeTaken: Math.min(60, (Date.now() - currStartTime) / 1000),
			attemptedAt: new Date().toISOString(),
			presentationMode: selectActivePresentationMode(getState()),
			scheduler: scheduler.id,
			timing,
		};

		dispatch(midiActions.waitUntilEmpty());
		dispatch(attemptsActions.upsert([attempt]));
		dispatch(recordSessionReview(attempt));
		dispatch(stepSessionLadder(attempt));

		console.log(`[scheduling] Recording attempt: ${correct}`);

		dispatch(moveOn(attempt, streak));
		dispatch(updateLocalStreak(attempt.attemptedAt));

		await api.post('/attempts', attempt);
	};
