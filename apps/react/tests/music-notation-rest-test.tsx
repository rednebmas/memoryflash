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
				{ notes: [], duration: '8', rest: true },
				{ notes: [], duration: 'q', rest: true },
				{ notes: [], duration: 'h', rest: true },
				{ notes: [], duration: '8', rest: true },
			],
		},
	],
};

renderApp(<MusicNotation data={data} highlightClassName="highlight" />);
