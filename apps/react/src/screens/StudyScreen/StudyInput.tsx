import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { showChordPadSelector } from 'MemoryFlashCore/src/redux/selectors/chordInputModeSelector';
import {
	noteNamesModeSelector,
	saxModeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { ChordNamePad } from '../../components/chord-pad/ChordNamePad';
import { NoteNamePad } from '../../components/chord-pad/NoteNamePad';
import { Keyboard } from '../../components/keyboard/KeyBoard';
import { SaxStudyPanel } from '../../components/sax/SaxStudyPanel';

export const StudyInput = () => {
	const showChordPad = useAppSelector(showChordPadSelector);
	const saxMode = useAppSelector(saxModeSelector);
	const noteNamesMode = useAppSelector(noteNamesModeSelector);
	if (showChordPad) return <ChordNamePad />;
	if (saxMode) return <SaxStudyPanel />;
	if (noteNamesMode) return <NoteNamePad />;
	return <Keyboard />;
};
