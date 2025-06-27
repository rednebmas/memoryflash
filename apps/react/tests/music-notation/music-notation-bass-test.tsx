import React from 'react';
import { MusicNotation } from '../../src/components/MusicNotation';
import '../../src/index.css';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { renderApp } from '../renderApp';

const data: MultiSheetQuestion = {
	key: 'C',
	voices: [
		{
			staff: StaffEnum.Bass,
			stack: [
				{
					notes: [
						{ name: 'C', octave: 2 },
						{ name: 'E', octave: 2 },
						{ name: 'G', octave: 2 },
					],
					duration: 'q',
					chordName: 'C',
				},
				{ notes: [{ name: 'D', octave: 2 }], duration: 'q' },
				{ notes: [{ name: 'E', octave: 2 }], duration: 'q' },
				{ notes: [], duration: 'q', rest: true },
			],
		},
	],
};

renderApp(<MusicNotation data={data} highlightClassName="highlight" />);
