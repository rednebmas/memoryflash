import React from 'react';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { renderApp } from './renderApp';

const data: MultiSheetQuestion = {
	key: 'C',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [
				{ notes: [{ name: 'C', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'G', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'E', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'F', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'G', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'A', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'B', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'C', octave: 5 }], duration: '8' },
			],
		},
	],
};

renderApp(<MusicNotation data={data} highlightClassName="highlight" />);
