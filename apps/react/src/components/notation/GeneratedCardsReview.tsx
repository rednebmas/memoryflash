import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { generatedCardsActions } from 'MemoryFlashCore/src/redux/slices/generatedCardsSlice';
import { invalidChordNames } from 'MemoryFlashCore/src/lib/chordTones';
import { EmptyState } from '../feedback/EmptyState';
import { Pill } from '../ui/Pill';
import { GeneratedCardRow } from './GeneratedCardRow';

export const GeneratedCardsReview: React.FC = () => {
	const dispatch = useAppDispatch();
	const { song, selected } = useAppSelector((s) => s.generatedCards);
	if (!song) {
		return <EmptyState message="Generate a preview to review cards here." />;
	}
	return (
		<div className="card-container w-full flex flex-col gap-4">
			<div>
				<div className="flex items-baseline gap-2">
					<span className="heading-sm">{song.title}</span>
					<span className="caption">{song.artist}</span>
				</div>
				<span className="caption">
					Key {song.key} · {song.patterns.length} patterns · {song.cards.length} cards
				</span>
			</div>
			<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm bg-slightly-elevated border border-default rounded-xl p-3">
				{song.patterns.map((p) => (
					<React.Fragment key={p.id}>
						<Pill text={`Pattern ${p.id}`} theme="gray" />
						<span>
							{p.chords.join(' · ')}{' '}
							<span className="caption">— {p.sections.join(', ')}</span>
						</span>
					</React.Fragment>
				))}
			</div>
			<div className="flex flex-col">
				{song.cards.map((card, i) => (
					<GeneratedCardRow
						key={i}
						card={card}
						selected={selected[i]}
						onToggle={() => dispatch(generatedCardsActions.toggleCard(i))}
						onRemove={() => dispatch(generatedCardsActions.removeCard(i))}
						onChange={(changes) => {
							const chords = changes.chords ?? card.chords;
							dispatch(
								generatedCardsActions.updateCard({
									index: i,
									changes: {
										...changes,
										invalidChords: invalidChordNames(chords),
									},
								}),
							);
						}}
					/>
				))}
			</div>
		</div>
	);
};
