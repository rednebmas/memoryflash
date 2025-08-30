import React from 'react';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { renderApp } from './renderApp';

const data: MultiSheetQuestion = {
	key: 'E',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [
				{ notes: [{ name: 'F#', octave: 4 }], duration: 'q' },
				{ notes: [{ name: 'G#', octave: 4 }], duration: 'q' },
				{ notes: [{ name: 'F', octave: 4 }], duration: 'q' },
				{ notes: [], duration: 'q', rest: true },
			],
		},
	],
};

renderApp(<MusicNotation data={data} highlightClassName="highlight" />);
