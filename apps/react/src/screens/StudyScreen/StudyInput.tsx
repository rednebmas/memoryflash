import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { studyInputSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { ChordNamePad } from '../../components/chord-pad/ChordNamePad';
import { ChordSpellingPad } from '../../components/chord-pad/ChordSpellingPad';
import { NoteNamePad } from '../../components/chord-pad/NoteNamePad';
import { Keyboard } from '../../components/keyboard/KeyBoard';
import { SaxStudyPanel } from '../../components/sax/SaxStudyPanel';

const INPUTS = {
	chordPad: ChordNamePad,
	sax: SaxStudyPanel,
	noteName: NoteNamePad,
	spelling: ChordSpellingPad,
	keyboard: Keyboard,
};

export const StudyInput = () => {
	const Input = INPUTS[useAppSelector(studyInputSelector)];
	return <Input />;
};
