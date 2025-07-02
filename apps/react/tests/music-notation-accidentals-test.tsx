import React from 'react';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { renderApp } from './renderApp';

const data: MultiSheetQuestion = {
	key: 'Eb',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [
				{ notes: [{ name: 'Eb', octave: 4 }], duration: 'q' },
				{ notes: [{ name: 'E', octave: 4 }], duration: 'q' },
				{ notes: [{ name: 'Db', octave: 4 }], duration: 'q' },
				{ notes: [], duration: 'q', rest: true },
			],
		},
	],
};

renderApp(<MusicNotation data={data} highlightClassName="highlight" />);
