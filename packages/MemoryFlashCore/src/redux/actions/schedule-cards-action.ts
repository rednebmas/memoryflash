import { calculateMedian } from '../../lib/median';
import { shuffleArray } from '../../lib/shuffleArray';
import { CardTypeEnum } from '../../types/Cards';
import { currDeckWithCorrectAttemptsSortedArray } from '../selectors/currDeckCardsWithAttempts';
import { schedulerActions } from '../slices/schedulerSlice';
import { SyncAppThunk } from '../store';

/**
 * This scheduling algorithm dynamically adjusts the selection probabilities for different types of cards
 * (new, below median time, and above median time) based on their availability. Each card type is initially
 * assigned a target percentage, reflecting the intended distribution of card types within the scheduled set.
 *
 * However, the availability of each card type can vary (e.g., there might be no new cards left). In such cases,
 * the algorithm first adjusts the percentage of the available types to zero for those that are not available.
 * After this adjustment, it recalculates the percentages for the remaining types to ensure they sum to 100%.
 * This normalization process guarantees that the selection mechanism is always based on the relative proportions
 * of the available card types, maintaining the intended balance regardless of fluctuations in card availability.
 *
 * This approach ensures fairness in card selection, maintains a balanced review system, and adapts dynamically to
 * the current state of the deck, maximizing the efficiency and effectiveness of the learning process.
 */
export const schedule =
	(deckId: string): SyncAppThunk =>
	async (dispatch, getState, {}) => {
		if (getState().scheduler.deck !== deckId) return;
		if (getState().scheduler.nextCards.length > 12) return;

		let cards = currDeckWithCorrectAttemptsSortedArray(getState());
		let cardsWithNoAttempts = cards.filter((card) => card.attempts.length === 0);
		let cardsWithAttempts = cards.filter((card) => card.attempts.length > 0);
		let medianTimeTaken = calculateMedian(
			cardsWithAttempts.map((c) => c.attempts[0]?.timeTaken),
		);

		let belowMedianCards = shuffleArray(
			cardsWithAttempts.filter((card) => card.attempts[0].timeTaken < medianTimeTaken),
		);
		let aboveMedianCards = shuffleArray(
			cardsWithAttempts.filter((card) => card.attempts[0].timeTaken >= medianTimeTaken),
		);

		if (
			cardsWithNoAttempts.length === 0 &&
			belowMedianCards.length === 0 &&
			aboveMedianCards.length === 0
		) {
			return;
		}

		console.log(
			`[scheduler] cardsWithNoAttempts: ${cardsWithNoAttempts.length}, belowMedianCards: ${belowMedianCards.length}, aboveMedianCards: ${aboveMedianCards.length}`,
		);

		// It is important to make totalCardsToSchedule greater than the number of repetitions!!
		// If you don't, irt results in scenarios, especially in the beginning of a deck, where you
		//  can get the same below median card on repeat.
		let totalCardsToSchedule = 4;
		let repetitions = 3;

		let scheduledCards: string[] = [];

		let cardTypes = [
			{
				name: 'New',
				weight: cardsWithNoAttempts.length ? 6 : 0,
				generateCard: () => cardsWithNoAttempts.shift(),
			},
			{
				name: 'Below Median',
				weight: belowMedianCards.length ? 1 : 0,
				generateCard: () => belowMedianCards.shift(),
			},
			{
				name: 'Above Median',
				weight: aboveMedianCards.length ? 6 : 0,
				generateCard: () => {
					const weights = aboveMedianCards.map(
						(card) => card.attempts[0].timeTaken - medianTimeTaken,
					);
					const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
					const weightedRandom = Math.random() * totalWeight;
					let sum = 0;
					for (let i = 0; i < aboveMedianCards.length; i++) {
						sum += weights[i];
						if (sum >= weightedRandom) return aboveMedianCards.splice(i, 1)[0];
					}
				},
			},
		];

		// Normalize percentages if necessary (especially if some categories are zeroed out)
		let totalWeight = cardTypes.reduce((acc, type) => acc + type.weight, 0);
		cardTypes.forEach((type) => (type.weight /= totalWeight));

		console.log('[scheduler] cardTypes:', cardTypes);

		let i = totalCardsToSchedule * 5;
		while (scheduledCards.length < totalCardsToSchedule && i-- > 0) {
			let rand = Math.random();
			let cumulativePercentage = 0;

			console.log('[scheduler] rand:', rand.toFixed(2));

			for (const type of cardTypes) {
				cumulativePercentage += type.weight;
				if (rand < cumulativePercentage) {
					const card = type.generateCard();
					const cardId = card?._id;
					console.log('[scheduler] picked card:', card?.uid);

					if (cardId && !scheduledCards.includes(cardId)) {
						console.log('[scheduler] Scheduling', type.name, 'card');
						scheduledCards.push(cardId);

						// The card needs to have multiples parts to the answer or repeating doesn't make sense
						if (card.type === CardTypeEnum.MultiSheet) {
							if (type.name === 'New' || type.name === 'Above Median') {
								// ~ the basis of practice is repetition ~ //
								for (let i = 1; i < repetitions; i++) {
									scheduledCards.push(cardId);
								}
							}
						}
						break;
					}
				}
			}
		}

		console.log(
			'[scheduler] Scheduled cards:',
			scheduledCards,
			'totalCardsToSchedule:',
			totalCardsToSchedule,
		);

		dispatch(schedulerActions.addToNextCards(scheduledCards));
	};
