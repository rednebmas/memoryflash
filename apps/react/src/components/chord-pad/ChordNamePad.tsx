import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { chordPadSelector } from 'MemoryFlashCore/src/redux/selectors/chordPadSelector';
import { answerChordSymbol } from 'MemoryFlashCore/src/redux/actions/answer-chord-symbol-action';
import {
	EMPTY_PENDING,
	ENTER,
	PendingChord,
	applyPadKey,
	renderPending,
} from 'MemoryFlashCore/src/lib/chordPad';
import { prettyChordSymbol } from 'MemoryFlashCore/src/lib/romanNumerals';
import { AnswerStrip } from './AnswerStrip';
import { PadKey } from './PadKey';

const WRONG_FLASH_MS = 500;

export const ChordNamePad: React.FC = () => {
	const dispatch = useAppDispatch();
	const { notation, key, total, committed, rows } = useAppSelector(chordPadSelector);
	const currCard = useAppSelector((s) => s.scheduler.currCard);
	const [pending, setPending] = useState<PendingChord>(EMPTY_PENDING);
	const [wrong, setWrong] = useState(false);
	const symbol = renderPending(pending, notation);

	useEffect(() => setPending(EMPTY_PENDING), [currCard]);

	const commit = () => {
		if (!symbol) return;
		dispatch(
			answerChordSymbol(symbol, (correct) => {
				setPending(EMPTY_PENDING);
				if (!correct) setWrong(true);
			}),
		);
	};

	useEffect(() => {
		if (!wrong) return;
		const timer = setTimeout(() => setWrong(false), WRONG_FLASH_MS);
		return () => clearTimeout(timer);
	}, [wrong]);

	const press = (label: string) => {
		if (label === ENTER) return commit();
		const isRoot = rows[0].includes(label);
		if (isRoot && symbol) commit();
		setPending((p) => applyPadKey(isRoot && symbol ? EMPTY_PENDING : p, label, rows[0]));
	};

	return (
		<div className="flex flex-col gap-1.5 px-4 pt-3 pb-4 border-t border-default max-w-xl mx-auto w-full">
			<AnswerStrip
				committed={committed}
				pending={prettyChordSymbol(symbol)}
				total={total}
				wrong={wrong}
				keyLabel={notation === 'romanNumerals' ? key : undefined}
			/>
			{rows.map((row, i) => (
				<div key={i} className="grid grid-cols-7 gap-1.5">
					{row.map((label) => (
						<PadKey
							key={label}
							label={label}
							active={
								i === 0 && !!pending.root && label.replace('°', '') === pending.root
							}
							onPress={() => press(label)}
						/>
					))}
				</div>
			))}
		</div>
	);
};
