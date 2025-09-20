import React from 'react';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { renderApp } from './renderApp';

const data: MultiSheetQuestion = {
	key: 'G',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [
				{ notes: [], duration: 'q', rest: true },
				{ notes: [{ name: 'B', octave: 3 }], duration: '16' },
				{ notes: [{ name: 'A', octave: 3 }], duration: '8' },
				{ notes: [{ name: 'G', octave: 3 }], duration: '8' },
				{ notes: [{ name: 'E', octave: 3 }], duration: '16' },
				{ notes: [{ name: 'D', octave: 3 }], duration: 'qd' },
			],
		},
		{
			staff: StaffEnum.Bass,
			stack: [
				{ notes: [{ name: 'G', octave: 2 }], duration: 'hd' },
				{ notes: [{ name: 'G', octave: 2 }], duration: 'q' },
			],
		},
	],
};

renderApp(<MusicNotation data={data} />);
