import React from 'react';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { renderApp } from './renderApp';

const data: MultiSheetQuestion = {
	key: 'F#m',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [
				{
					notes: [
						{ name: 'A', octave: 4 },
						{ name: 'C#', octave: 5 },
					],
					duration: 'h',
				},
				{
					notes: [
						{ name: 'A', octave: 4 },
						{ name: 'C#', octave: 5 },
					],
					duration: 'h',
				},
				{
					notes: [
						{ name: 'A', octave: 4 },
						{ name: 'C#', octave: 5 },
					],
					duration: 'h',
				},
				{ notes: [], rest: true, duration: 'h' },
			],
		},
		{
			staff: StaffEnum.Bass,
			stack: [
				{ notes: [{ name: 'F#', octave: 3 }], duration: 'h' },
				{ notes: [{ name: 'F#', octave: 3 }], duration: 'h' },
				{ notes: [{ name: 'F#', octave: 3 }], duration: 'h' },
				{ notes: [], rest: true, duration: 'h' },
			],
		},
	],
};

renderApp(<MusicNotation data={data} />);
