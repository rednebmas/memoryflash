import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { AnswerType, Card } from 'MemoryFlashCore/src/types/Cards';
import { AnyOctaveAnswerValidator } from './AnyOctaveAnswerValidator';
import { ExactMultiAnswerValidator } from './ExactMultiAnswerValidator';
import { UnExactMultiAnswerValidator } from './UnExactMultiAnswerValidator';

export const AnswerValidator: React.FC<{ card: Card | undefined }> = ({ card }) => {
	const presentationModesByQuestionType = useAppSelector(
		(state) => state.settings.presentationModes,
	);

	if (!card) return null;

	let activePresentationMode = presentationModesByQuestionType[card.type];

	switch (card.answer.type) {
		case AnswerType.AnyOctave:
			return <AnyOctaveAnswerValidator card={card} />;
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
