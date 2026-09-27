import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { answerNoteName } from 'MemoryFlashCore/src/redux/actions/answer-note-name-action';
import { ACCIDENTALS, Accidental, NOTE_LETTERS } from 'MemoryFlashCore/src/lib/noteNames';
import { useTemporaryFlag } from '../../utils/useTemporaryFlag';
import { WRONG_FLASH_MS } from './ChordNamePad';
import { PadKey } from './PadKey';

const ACCIDENTAL_LABELS: Record<Accidental, string> = { b: '♭', '#': '♯' };

const useLetterKeys = (onLetter: (letter: string) => void) =>
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const letter = e.key.toUpperCase();
			if (!e.metaKey && !e.ctrlKey && NOTE_LETTERS.includes(letter)) onLetter(letter);
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [onLetter]);

export const NoteNamePad: React.FC = () => {
	const dispatch = useAppDispatch();
	const currCard = useAppSelector((s) => s.scheduler.currCard);
	const [accidental, setAccidental] = useState<Accidental>();
	const [wrong, flashWrong] = useTemporaryFlag(WRONG_FLASH_MS);

	useEffect(() => setAccidental(undefined), [currCard]);

	const answer = (letter: string) =>
		dispatch(
			answerNoteName(letter + (accidental ?? ''), (correct) => {
				setAccidental(undefined);
				if (!correct) flashWrong();
			}),
		);
	useLetterKeys(answer);

	return (
		<div
			className={clsx(
				'flex flex-col gap-1.5 px-4 pt-3 pb-4 max-w-xl mx-auto w-full rounded-[10px]',
				wrong && 'bg-red-500/10 ring-1 ring-inset ring-red-500/50',
			)}
		>
			<div className="grid grid-cols-7 gap-1.5">
				{NOTE_LETTERS.map((letter) => (
					<PadKey key={letter} label={letter} onPress={() => answer(letter)} />
				))}
			</div>
			<div className="grid grid-cols-7 gap-1.5">
				{ACCIDENTALS.map((acc) => (
					<PadKey
						key={acc}
						label={ACCIDENTAL_LABELS[acc]}
						active={accidental === acc}
						onPress={() => setAccidental(accidental === acc ? undefined : acc)}
					/>
				))}
			</div>
		</div>
	);
};
