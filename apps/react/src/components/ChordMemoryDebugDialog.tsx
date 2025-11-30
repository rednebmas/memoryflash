import React, { useMemo, useRef, useState } from 'react';
import { Midi, Note } from 'tonal';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { AnswerType, Card, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { ChordMemoryValidatorEngine } from 'MemoryFlashCore/src/lib/ChordMemoryValidatorEngine';

interface ChordMemoryDebugDialogProps {
	card: Card;
}

interface ActionLogEntry {
	timestamp: number;
	action: string;
	details: string;
}

export const ChordMemoryDebugDialog: React.FC<ChordMemoryDebugDialogProps> = ({ card }) => {
	const [isOpen, setIsOpen] = useState(false);
	const userEmail = useAppSelector((s) => s.auth.user?.email);
	const onNotes = useAppSelector((s) => s.midi.notes);
	const waiting = useAppSelector((s) => s.midi.waitingUntilEmpty);
	const waitingUntilEmptyNotes = useAppSelector((s) => s.midi.waitingUntilEmptyNotes);
	const index = useAppSelector((s) => s.scheduler.multiPartCardIndex);
	const currCard = useAppSelector((s) => s.scheduler.currCard);
	const currStartTime = useAppSelector((s) => s.scheduler.currStartTime);
	const nextCards = useAppSelector((s) => s.scheduler.nextCards);
	const actionLogRef = useRef<ActionLogEntry[]>([]);
	const prevNotesRef = useRef<number[]>([]);
	const prevStateRef = useRef({ waiting, index, notesCount: onNotes.length });

	const currentNotesMidi = onNotes.map((n) => n.number);

	// Track state changes for debugging
	if (
		prevStateRef.current.waiting !== waiting ||
		prevStateRef.current.index !== index ||
		prevStateRef.current.notesCount !== onNotes.length
	) {
		const now = Date.now();
		if (prevStateRef.current.waiting !== waiting) {
			actionLogRef.current.push({
				timestamp: now,
				action: 'waiting changed',
				details: `${prevStateRef.current.waiting} → ${waiting}`,
			});
		}
		if (prevStateRef.current.index !== index) {
			actionLogRef.current.push({
				timestamp: now,
				action: 'index changed',
				details: `${prevStateRef.current.index} → ${index}`,
			});
		}
		if (prevStateRef.current.notesCount !== onNotes.length) {
			// Find added and removed notes
			const added = currentNotesMidi.filter((n) => !prevNotesRef.current.includes(n));
			const removed = prevNotesRef.current.filter((n) => !currentNotesMidi.includes(n));
			const addedNames = added.map((n) => `${Midi.midiToNoteName(n)}(${n})`).join(', ');
			const removedNames = removed.map((n) => `${Midi.midiToNoteName(n)}(${n})`).join(', ');

			let details = `${prevStateRef.current.notesCount} → ${onNotes.length}`;
			if (added.length > 0) details += ` +[${addedNames}]`;
			if (removed.length > 0) details += ` -[${removedNames}]`;

			actionLogRef.current.push({
				timestamp: now,
				action: 'notes',
				details,
			});
		}
		// Keep only last 15 entries
		if (actionLogRef.current.length > 15) {
			actionLogRef.current = actionLogRef.current.slice(-15);
		}
		prevNotesRef.current = currentNotesMidi;
		prevStateRef.current = { waiting, index, notesCount: onNotes.length };
	}

	const answer = card.answer as ChordMemoryAnswer;
	const chords = answer.type === AnswerType.ChordMemory ? answer.chords : [];
	const currentChord = chords[index];

	const engine = useMemo(() => new ChordMemoryValidatorEngine(chords), [chords]);

	const onNotesMidi = onNotes.map((n) => n.number);
	const playedChromas = onNotesMidi.map((n) => Note.chroma(Midi.midiToNoteName(n)));
	const playedChromaSet = new Set(playedChromas.filter((c) => c !== null));

	const requiredChromas = currentChord?.requiredTones.map((t) => Note.chroma(t)) ?? [];
	const optionalChromas = currentChord?.optionalTones.map((t) => Note.chroma(t)) ?? [];
	const allowedChromas = new Set([...requiredChromas, ...optionalChromas]);

	const validationResult = currentChord ? engine.validate(onNotesMidi, currentChord) : null;

	const wrongNotesPlayed = onNotesMidi.filter((n) => {
		const chroma = Note.chroma(Midi.midiToNoteName(n));
		return typeof chroma === 'number' && !allowedChromas.has(chroma);
	});

	const missingRequired = requiredChromas.filter(
		(c) => typeof c === 'number' && !playedChromaSet.has(c),
	);

	// Only show for specific user and ChordMemory cards
	if (userEmail !== 'sam@riker.tech') return null;
	if (answer.type !== AnswerType.ChordMemory) return null;

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="fixed top-4 left-4 bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-mono text-xs z-50 hover:bg-yellow-500"
			>
				🔍 Debug Chord
			</button>
		);
	}

	return (
		<div className="fixed top-4 left-4 bg-black bg-opacity-95 text-white p-4 rounded-lg font-mono text-xs max-w-lg z-50 shadow-2xl border border-gray-700">
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-yellow-400 font-bold">🎹 Chord Memory Debug</h3>
				<button
					onClick={() => setIsOpen(false)}
					className="text-gray-400 hover:text-white px-2"
				>
					✕
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<div className="mb-3">
						<span className="text-blue-400">Progression Index:</span>{' '}
						<span className="text-white font-bold">{index}</span> / {chords.length - 1}
					</div>

					<div className="mb-3">
						<span className="text-blue-400">Waiting Until Empty:</span>{' '}
						<span className={waiting ? 'text-yellow-400' : 'text-gray-400'}>
							{waiting ? 'YES (blocked)' : 'NO'}
						</span>
					</div>

					<div className="mb-3">
						<span className="text-purple-400">Current Chord:</span>
						<div className="ml-2 mt-1 p-2 bg-gray-800 rounded">
							{currentChord ? (
								<>
									<div className="text-lg font-bold text-purple-300">
										{currentChord.chordName}
									</div>
									<div className="text-green-400 text-xs mt-1">
										Required: {currentChord.requiredTones.join(', ')}
									</div>
									{currentChord.optionalTones.length > 0 && (
										<div className="text-gray-400 text-xs">
											Optional: {currentChord.optionalTones.join(', ')}
										</div>
									)}
								</>
							) : (
								<span className="text-red-400">No chord at index {index}</span>
							)}
						</div>
					</div>
				</div>

				<div>
					<div className="mb-3">
						<span className="text-green-400">Expected Chromas:</span>
						<div className="ml-2 mt-1 text-xs">
							{requiredChromas.map((c, i) => (
								<span
									key={i}
									className={`inline-block px-1.5 py-0.5 rounded mr-1 mb-1 ${
										typeof c === 'number' && playedChromaSet.has(c)
											? 'bg-green-600'
											: 'bg-red-600'
									}`}
								>
									{currentChord?.requiredTones[i]} (chroma:{c})
								</span>
							))}
						</div>
					</div>

					<div className="mb-3">
						<span className="text-blue-400">Notes Playing:</span>
						<div className="ml-2 mt-1">
							{onNotesMidi.length === 0 ? (
								<span className="text-gray-500">(none)</span>
							) : (
								onNotesMidi.map((midi, i) => {
									const chroma = playedChromas[i];
									const isAllowed =
										typeof chroma === 'number' && allowedChromas.has(chroma);
									return (
										<div
											key={midi}
											className={
												isAllowed ? 'text-green-300' : 'text-red-300'
											}
										>
											{Midi.midiToNoteName(midi)} (midi:{midi}, chroma:
											{chroma}){!isAllowed && ' ❌ NOT ALLOWED'}
										</div>
									);
								})
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="border-t border-gray-700 pt-3 mt-3">
				<span className="text-yellow-400">Validation Result:</span>
				{validationResult ? (
					<div className="ml-2 mt-1 p-2 bg-gray-800 rounded">
						<div>
							isCorrect:{' '}
							<span
								className={
									validationResult.isCorrect ? 'text-green-400' : 'text-red-400'
								}
							>
								{String(validationResult.isCorrect)}
							</span>
						</div>
						<div>
							isIncomplete:{' '}
							<span
								className={
									validationResult.isIncomplete
										? 'text-yellow-400'
										: 'text-gray-400'
								}
							>
								{String(validationResult.isIncomplete)}
							</span>
						</div>
						<div>
							wrongNotes:{' '}
							<span className="text-red-400">
								{validationResult.wrongNotes.length > 0
									? validationResult.wrongNotes
											.map((n) => `${Midi.midiToNoteName(n)}(${n})`)
											.join(', ')
									: '(none)'}
							</span>
						</div>
					</div>
				) : (
					<span className="text-gray-500 ml-2">(no chord to validate)</span>
				)}
			</div>

			<div className="border-t border-gray-700 pt-3 mt-3">
				<span className="text-orange-400">Diagnosis:</span>
				<div className="ml-2 mt-1 p-2 bg-gray-800 rounded text-xs">
					{waiting && (
						<div className="text-yellow-400 mb-1">
							⚠️ BLOCKED: Waiting for keys to be released before accepting new input
						</div>
					)}
					{wrongNotesPlayed.length > 0 && (
						<div className="text-red-400 mb-1">
							❌ Wrong notes being played:{' '}
							{wrongNotesPlayed.map((n) => Midi.midiToNoteName(n)).join(', ')}
						</div>
					)}
					{missingRequired.length > 0 && onNotesMidi.length > 0 && (
						<div className="text-yellow-400 mb-1">
							⏳ Missing required tones:{' '}
							{missingRequired
								.map((c) =>
									currentChord?.requiredTones.find((t) => Note.chroma(t) === c),
								)
								.join(', ')}
						</div>
					)}
					{validationResult?.isCorrect && (
						<div className="text-green-400">
							✅ All conditions met - should advance!
						</div>
					)}
					{onNotesMidi.length === 0 && !waiting && (
						<div className="text-gray-400">Play some notes to see validation</div>
					)}
				</div>
			</div>

			<div className="border-t border-gray-700 pt-3 mt-3">
				<span className="text-cyan-400">All Chords in Progression:</span>
				<div className="ml-2 mt-1 flex flex-wrap gap-1">
					{chords.map((chord, i) => (
						<div
							key={i}
							className={`px-2 py-1 rounded text-xs ${
								i === index
									? 'bg-purple-600 text-white'
									: i < index
										? 'bg-green-800 text-green-200'
										: 'bg-gray-700 text-gray-300'
							}`}
						>
							{chord.chordName}
							{i === index && ' ←'}
						</div>
					))}
				</div>
			</div>

			<div className="border-t border-gray-700 pt-3 mt-3">
				<span className="text-pink-400">Waiting Notes (to release):</span>
				<div className="ml-2 mt-1 text-xs">
					{waitingUntilEmptyNotes.length === 0 ? (
						<span className="text-gray-500">(none)</span>
					) : (
						waitingUntilEmptyNotes.map((n) => (
							<span key={n.number} className="text-pink-300 mr-2">
								{Midi.midiToNoteName(n.number)}
							</span>
						))
					)}
				</div>
			</div>

			<div className="border-t border-gray-700 pt-3 mt-3">
				<span className="text-orange-400">Current Card ID:</span>
				<span className="ml-2 text-gray-300 text-xs">{currCard || '(none)'}</span>
			</div>

			<div className="border-t border-gray-700 pt-3 mt-3">
				<span className="text-orange-400">Time on Card:</span>
				<span className="ml-2 text-gray-300 text-xs">
					{currStartTime > 0
						? `${((Date.now() - currStartTime) / 1000).toFixed(1)}s`
						: '(not started)'}
				</span>
				<span className="ml-4 text-orange-400">Next Cards:</span>
				<span className="ml-2 text-gray-300 text-xs">{nextCards.length}</span>
			</div>

			<div className="border-t border-gray-700 pt-3 mt-3">
				<span className="text-lime-400">State Change Log:</span>
				<div className="ml-2 mt-1 text-xs max-h-24 overflow-y-auto">
					{actionLogRef.current.length === 0 ? (
						<span className="text-gray-500">(no changes yet)</span>
					) : (
						actionLogRef.current.map((entry, i) => (
							<div key={i} className="text-lime-300">
								{new Date(entry.timestamp).toLocaleTimeString()}: {entry.action} -{' '}
								{entry.details}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};
