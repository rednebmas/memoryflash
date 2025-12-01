import React from 'react';
import { sessionCardsSelector } from 'MemoryFlashCore/src/redux/selectors/scheduledCardsSelector';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { BlackKey } from './BlackKey';
import { WhiteKey } from './WhiteKey';

export const Keyboard = () => {
	return (
		<div className="p-4 flex justify-center">
			<div className="relative flex justify-center">
				{/* <div className='relative flex justify-center rounded-xl overflow-hidden '> */}
				{[1, 2, 3, 4, 5].map((octave) => (
					<KeyBoardKeys key={octave} rootMidi={36 + (octave - 1) * 12} />
				))}
			</div>
		</div>
	);
};

const KeyBoardKeys: React.FC<{ extra?: boolean; rootMidi: number }> = ({ rootMidi }) => {
	return (
		<div className="relative flex">
			{/* C through E */}
			<CustomisedKey midi={rootMidi + 0} type="white" />
			<CustomisedKey midi={rootMidi + 1} type="black" className="absolute ml-[22px]" />
			<CustomisedKey midi={rootMidi + 2} type="white" />
			<CustomisedKey midi={rootMidi + 3} type="black" className="absolute ml-[55px]" />
			<CustomisedKey midi={rootMidi + 4} type="white" />

			{/* F through B */}
			<CustomisedKey midi={rootMidi + 5} type="white" />
			<CustomisedKey midi={rootMidi + 6} type="black" className="absolute ml-[124px]" />
			<CustomisedKey midi={rootMidi + 7} type="white" />
			<CustomisedKey midi={rootMidi + 8} type="black" className="absolute ml-[157px]" />
			<CustomisedKey midi={rootMidi + 9} type="white" />
			<CustomisedKey midi={rootMidi + 10} type="black" className="absolute ml-[190px]" />
			<CustomisedKey midi={rootMidi + 11} type="white" />
		</div>
	);
};

const CustomisedKey: React.FC<{
	type: 'black' | 'white';
	className?: string;
	midi: number;
}> = ({ className = '', type, midi }) => {
	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((state) => state.midi.notes);
	const pressed = onNotes.find((note) => note.number === midi) !== undefined;
	const { cards, index } = useAppSelector(sessionCardsSelector);
	const card = cards[index];
	const pendingClear = useAppSelector((state) => state.midi.pendingClearClickedNotes);

	const noteIsCorrect = !useAppSelector((state) => state.midi.wrongNotes).includes(midi);
	let whiteKeyStartColor = '#FFF';
	let whiteKeyEndColor = '#F0F0F0';
	if (pressed && noteIsCorrect) {
		whiteKeyStartColor = '#63DC50';
		whiteKeyEndColor = '#3C962E';
	} else if (pressed && !noteIsCorrect) {
		whiteKeyStartColor = '#DC5050';
		whiteKeyEndColor = '#962E2E';
	}

	let blackKeyStartColor = '#475461';
	let blackKeyEndColor = '#282D31';
	if (pressed && noteIsCorrect) {
		blackKeyStartColor = '#63DC50';
		blackKeyEndColor = '#3C962E';
	} else if (pressed && !noteIsCorrect) {
		blackKeyStartColor = '#DC5050';
		blackKeyEndColor = '#962E2E';
	}

	return (
		<div
			className={`cursor-pointer ${className}`}
			onMouseDown={() => {
				if (!pressed) {
					dispatch(midiActions.addNote({ number: midi, clicked: true }));
				}
			}}
			onMouseUp={() => {
				// Remove on mouse up if:
				// 1. It's a wrong note (so user can fix mistakes), OR
				// 2. Chord was just completed (pendingClear is true)
				if (pressed && (!noteIsCorrect || pendingClear)) {
					dispatch(midiActions.removeNote(midi));
				}
			}}
			onMouseLeave={() => {
				// Only remove wrong notes on mouse leave
				if (pressed && !noteIsCorrect) {
					dispatch(midiActions.removeNote(midi));
				}
			}}
		>
			{type === 'black' ? (
				<BlackKey startColor={blackKeyStartColor} endColor={blackKeyEndColor} />
			) : (
				<WhiteKey startColor={whiteKeyStartColor} endColor={whiteKeyEndColor} />
			)}
			{/* {Midi.midiToNoteName(midi)} */}
		</div>
	);
};
