import React from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { buildScoreTimeline, activeNotesAt } from 'MemoryFlashCore/src/lib/scoreTimeline';
import { Midi } from 'tonal';

interface DebugValidatorProps {
	card: MultiSheetCard;
}

export const DebugValidator: React.FC<DebugValidatorProps> = ({ card }) => {
	return null;
	const onNotes = useAppSelector((s) => s.midi.notes);
	const wrongNotes = useAppSelector((s) => s.midi.wrongNotes);
	const waiting = useAppSelector((s) => s.midi.waitingUntilEmpty);
	const index = useAppSelector((s) => s.scheduler.multiPartCardIndex);

	const timeline = React.useMemo(() => buildScoreTimeline(card.question), [card.question]);
	const expectedNotes = React.useMemo(() => activeNotesAt(timeline, index), [timeline, index]);

	const onNotesMidi = onNotes.map((n) => n.number);
	const wrongNotesList = wrongNotes;

	return (
		<div className="fixed top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg font-mono text-xs max-w-md z-50">
			<div className="mb-2">
				<h3 className="text-yellow-400 font-bold mb-2">🎹 Validation Debug</h3>

				<div className="mb-2">
					<span className="text-blue-400">Current Index:</span> {index}
				</div>

				<div className="mb-2">
					<span className="text-blue-400">Waiting:</span> {waiting ? 'YES' : 'NO'}
				</div>
			</div>

			<div className="mb-2">
				<span className="text-green-400">Expected Notes:</span>
				<div className="ml-2">
					{expectedNotes.length === 0 ? (
						<span className="text-gray-400">(rest)</span>
					) : (
						expectedNotes.map((n) => (
							<div key={n.midi} className="text-green-300">
								{Midi.midiToNoteName(n.midi)} ({n.midi})
							</div>
						))
					)}
				</div>
			</div>

			<div className="mb-2">
				<span className="text-blue-400">Currently Playing:</span>
				<div className="ml-2">
					{onNotesMidi.length === 0 ? (
						<span className="text-gray-400">(none)</span>
					) : (
						onNotesMidi.map((midi) => (
							<div key={midi} className="text-blue-300">
								{Midi.midiToNoteName(midi)} ({midi})
							</div>
						))
					)}
				</div>
			</div>

			<div className="mb-2">
				<span className="text-red-400">Wrong Notes:</span>
				<div className="ml-2">
					{wrongNotesList.length === 0 ? (
						<span className="text-gray-400">(none)</span>
					) : (
						wrongNotesList.map((midi) => (
							<div key={midi} className="text-red-300">
								{Midi.midiToNoteName(midi)} ({midi})
							</div>
						))
					)}
				</div>
			</div>

			<div className="mb-2">
				<span className="text-purple-400">Timeline Beats:</span>
				<div className="ml-2 text-xs">
					[{timeline.beats.map((b) => b.toFixed(2)).join(', ')}]
				</div>
			</div>

			<div className="mb-2">
				<span className="text-purple-400">Timeline Events:</span>
				<div className="ml-2 text-xs max-h-32 overflow-y-auto">
					{timeline.events.map((event, i) => (
						<div key={i} className="text-purple-300">
							{Midi.midiToNoteName(event.midi)} ({event.midi}) Voice {event.voice}:{' '}
							{event.start}-{event.end}
						</div>
					))}
				</div>
			</div>

			{/* <div className="mt-2 pt-2 border-t border-gray-600">
				<div className="text-yellow-400 text-xs">
					Validation Status:{' '}
				</div>
			</div> */}
		</div>
	);
};
