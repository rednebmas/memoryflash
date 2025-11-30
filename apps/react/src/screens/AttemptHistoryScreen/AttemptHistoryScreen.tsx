import React, { useEffect, useMemo, useState } from 'react';
import {
	Layout,
	LinkButton,
	SegmentedControl,
	SegmentButton,
	PageTitle,
	EmptyState,
} from '../../components';
import { BasicErrorCard } from '../../components/feedback/ErrorCard';
import { Spinner } from '../../components/feedback/Spinner';
import { getDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-action';
import { currDeckAllWithAttemptsSelector } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { MultiSheetCardQuestion } from '../../components/FlashCards/MultiSheetCardQuestion';
import { useDeckIdPath } from '../useDeckIdPath';

type AttemptCard = ReturnType<typeof currDeckAllWithAttemptsSelector>[string];
type AttemptViewMode = 'text' | 'notation';

const stripDeckName = (uid: string, deckName?: string) => {
	if (!deckName) return uid;
	const trimmedDeck = deckName.trim();
	if (!trimmedDeck) return uid;
	const prefixes = [':', '-', '–', '—'].map((delimiter) => `${trimmedDeck} ${delimiter} `);
	return prefixes.reduce(
		(name, prefix) => (name.startsWith(prefix) ? name.slice(prefix.length) : name),
		uid,
	);
};

const describeCard = (card: AttemptCard, deckName?: string) => {
	if (card.type === CardTypeEnum.Interval) {
		const { interval, direction, note } = card.question;
		const arrow = direction === 'up' ? '↑' : '↓';
		return `${arrow} ${interval} of ${note}`;
	}
	if (card.type === CardTypeEnum.ChordSymbol) return card.question.chordName;
	if (card.type === CardTypeEnum.MultiSheet) {
		const { question } = card as MultiSheetCard;
		const chordNames = question?.voices?.[0]?.stack
			?.map((stack) => stack.chordName)
			.filter(Boolean);
		if (chordNames?.length) {
			const label = chordNames.join(' → ');
			return question?.key ? `${question.key}: ${label}` : label;
		}
	}
	return stripDeckName(card.uid, deckName);
};

const formatAttemptDate = (attemptedAt: string) =>
	new Date(attemptedAt).toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});

const buildAttemptRows = (cards: ReturnType<typeof currDeckAllWithAttemptsSelector>) =>
	Object.values(cards)
		.flatMap((card) => card.attempts.map((attempt) => ({ attempt, card })))
		.sort(
			(a, b) =>
				new Date(b.attempt.attemptedAt).getTime() -
				new Date(a.attempt.attemptedAt).getTime(),
		);

const AttemptsList: React.FC<{
	attempts: ReturnType<typeof buildAttemptRows>;
	viewMode: AttemptViewMode;
	deckName?: string;
}> = ({ attempts, viewMode, deckName }) =>
	attempts.length === 0 ? (
		<EmptyState message="No attempts yet." />
	) : (
		<div className="flex flex-col gap-3">
			{attempts.map(({ attempt, card }) => (
				<div
					key={attempt._id}
					className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
				>
					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-gray-900">
							<span>{describeCard(card, deckName)}</span>
							<span className="text-xs text-gray-600 sm:text-sm">
								{formatAttemptDate(attempt.attemptedAt)}
							</span>
						</div>
						{viewMode === 'notation' && card.type === CardTypeEnum.MultiSheet && (
							<div className="overflow-auto rounded border border-gray-100 bg-gray-50 p-2">
								<MultiSheetCardQuestion card={card} placement="answered" />
							</div>
						)}
						<div className="flex items-center justify-between text-sm text-gray-700">
							<span className={attempt.correct ? 'text-green-700' : 'text-red-700'}>
								{attempt.correct ? 'Correct' : 'Incorrect'}
							</span>
							<span>{attempt.timeTaken.toFixed(1)}s</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);

export const AttemptHistoryScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const { deckId, deck } = useDeckIdPath();
	const cardsWithAttempts = useAppSelector(currDeckAllWithAttemptsSelector);
	const { isLoading, error } = useNetworkState('getDeck' + deckId);
	const [viewMode, setViewMode] = useState<AttemptViewMode>('text');

	useEffect(() => {
		if (deckId) {
			dispatch(getDeck(deckId));
		}
	}, [deckId]);

	const attempts = useMemo(() => buildAttemptRows(cardsWithAttempts), [cardsWithAttempts]);

	return (
		<Layout subtitle={deck?.name}>
			<div className="flex flex-col gap-6">
				<Spinner show={isLoading && attempts.length === 0} />
				<BasicErrorCard error={error} />
				<div className="flex flex-wrap items-center justify-between gap-2">
					<PageTitle>Attempt history</PageTitle>
					<div className="flex flex-wrap items-center gap-3">
						<SegmentedControl variant="compact">
							<SegmentButton
								text="Text"
								active={viewMode === 'text'}
								onClick={() => setViewMode('text')}
								variant="compact"
							/>
							<SegmentButton
								text="Sheet music"
								active={viewMode === 'notation'}
								onClick={() => setViewMode('notation')}
								variant="compact"
							/>
						</SegmentedControl>
						{deckId && (
							<LinkButton to={`/study/${deckId}/stats`} variant="outline">
								Back to stats
							</LinkButton>
						)}
					</div>
				</div>
				<AttemptsList attempts={attempts} viewMode={viewMode} deckName={deck?.name} />
			</div>
		</Layout>
	);
};
