import clsx from 'clsx';
import { QuestionRender } from '..';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { MusicNotation } from '../MusicNotation';
import {
	PresentationModeStartCard,
	PresentationModeText,
} from 'MemoryFlashCore/src/types/PresentationMode';

export const MultiSheetCardQuestion: React.FC<QuestionRender> = ({ card, placement }) => {
	const c = card as MultiSheetCard;

	const multiPartCardIndex = useAppSelector((state) => state.scheduler.multiPartCardIndex);
	const presentationModesByQuestionType = useAppSelector(
		(state) => state.settings.presentationModes,
	);
	let activePresentationModeId = presentationModesByQuestionType[card.type];
	let activePresentationMode = c.question.presentationModes?.find(
		(m) => m.id === activePresentationModeId,
	);

	if (!activePresentationMode) {
		return null;
	}

	if (activePresentationModeId.startsWith('Sheet Music')) {
		return (
			<span>
				<MusicNotation
					data={c.question}
					highlightClassName={clsx(placement === 'cur' && 'highlight')}
					allNotesClassName={clsx(placement === 'answered' && 'answered')}
					hideChords={activePresentationModeId !== 'Sheet Music w/ Chords'}
				/>
			</span>
		);
	} else if (activePresentationModeId === 'Key Signature Only') {
		let presentationModeData = activePresentationMode as PresentationModeStartCard;
		return (
			<div className="flex flex-col items-center justify-center text-center gap-2">
				<span className="text-xs text-gray-500 mt-auto">
					{presentationModeData.textAbove}
				</span>
				<span className="pt-3">{c.question.key}</span>
				<div className="mb-auto">{CorrectDots(c, multiPartCardIndex, placement)}</div>
			</div>
		);
	} else if (activePresentationModeId === 'First Chord Only') {
		let presentationModeData = activePresentationMode as PresentationModeStartCard;
		return (
			<div className="flex flex-col items-center justify-center text-center gap-2">
				<span className="text-xs text-gray-500 mt-auto">
					{presentationModeData.textAbove}
				</span>
				<span className="pt-3">{c.question.voices[0].stack[0].chordName}</span>
				<div className="mb-auto">{CorrectDots(c, multiPartCardIndex, placement)}</div>
			</div>
		);
	} else if (activePresentationModeId === 'Text Prompt') {
		const pm = activePresentationMode as PresentationModeText;
		return (
			<div className="flex flex-col items-center justify-center text-center gap-2">
				<span className="pt-3">{pm.text}</span>
				<div className="mb-auto">{CorrectDots(c, multiPartCardIndex, placement)}</div>
			</div>
		);
	} else if (activePresentationModeId === 'Chords') {
		const chords = c.question.voices[0].stack.map((s) => s.chordName);
		return (
			<span className="flex flex-col text-center">
				<span className="pt-1 w-72 text-3xl">
					{chords.map((chord, i) => {
						const correct =
							(i < multiPartCardIndex && placement === 'cur') ||
							placement === 'answered';
						return (
							<span
								key={i}
								className={clsx({
									'text-green-500': correct,
								})}
							>
								{chord}{' '}
							</span>
						);
					})}
				</span>
			</span>
		);
	}

	return null;
};

function CorrectDots(c: MultiSheetCard, multiPartCardIndex: number, placement: string) {
	return (
		<span className="flex gap-4 justify-center pt-5">
			{c.question.voices[0].stack.map((_, i) => {
				const correct =
					(i < multiPartCardIndex && placement === 'cur') || placement === 'answered';
				return (
					<span
						key={i}
						className={clsx({
							'w-4 h-4 rounded-lg transition': true,
							'bg-green-500 ring-2 ring-green-300': correct,
							'bg-gray-300': !correct,
						})}
					></span>
				);
			})}
		</span>
	);
}
