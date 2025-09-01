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
				{ notes: [{ name: 'C', octave: 4 }], duration: 'h' },
				{ notes: [{ name: 'C', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'D', octave: 4 }], duration: 'q' },
				{ notes: [{ name: 'D', octave: 4 }], duration: '8' },
			],
		},
	],
};

renderApp(<MusicNotation data={data} />);
