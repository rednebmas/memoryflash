import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { showChordPadSelector } from 'MemoryFlashCore/src/redux/selectors/chordInputModeSelector';
import { saxModeSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { ChordNamePad } from '../../components/chord-pad/ChordNamePad';
import { Keyboard } from '../../components/keyboard/KeyBoard';
import { SaxStudyPanel } from '../../components/sax/SaxStudyPanel';

export const StudyInput = () => {
	const showChordPad = useAppSelector(showChordPadSelector);
	const saxMode = useAppSelector(saxModeSelector);
	if (showChordPad) return <ChordNamePad />;
	if (saxMode) return <SaxStudyPanel />;
	return <Keyboard />;
};
