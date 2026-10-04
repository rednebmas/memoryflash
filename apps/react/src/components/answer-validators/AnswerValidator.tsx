import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { AnswerType, Card } from 'MemoryFlashCore/src/types/Cards';
import { selectActivePresentationMode } from 'MemoryFlashCore/src/redux/selectors/activePresentationModeSelector';
import { AnyOctaveAnswerValidator } from './AnyOctaveAnswerValidator';
import { ChordMemoryAnswerValidator } from './ChordMemoryAnswerValidator';
import { ExactMultiAnswerValidator } from './ExactMultiAnswerValidator';
import { UnExactMultiAnswerValidator } from './UnExactMultiAnswerValidator';
import { saxRhythmActiveSelector } from 'MemoryFlashCore/src/redux/selectors/saxRhythmSelectors';

export const AnswerValidator: React.FC<{ card: Card | undefined }> = ({ card }) => {
	const activePresentationMode = useAppSelector(selectActivePresentationMode);

	const saxRhythm = useAppSelector(saxRhythmActiveSelector);
	if (!card || saxRhythm) return null;

	switch (card.answer.type) {
		case AnswerType.AnyOctave:
			return <AnyOctaveAnswerValidator card={card} />;
		case AnswerType.ChordMemory:
			return <ChordMemoryAnswerValidator card={card} />;
		//   case AnswerType.Exact:
		//     return <ExactAnswerValidator card={card} />;
		case AnswerType.ExactMulti:
			switch (activePresentationMode) {
				case 'Chords':
				case 'Key Signature Only':
				case 'First Chord Only':
				case 'Text Prompt':
					return <UnExactMultiAnswerValidator card={card} />;
				default:
					return <ExactMultiAnswerValidator card={card} />;
			}

		default:
			return null;
	}
};
