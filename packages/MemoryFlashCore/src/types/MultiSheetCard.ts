import { BaseAnswer, CardTypeBase, CardTypeEnum, StaffEnum } from './Cards';

export type SheetNote = {
	name: string; // Rest, C, Bb, D#, ...
	octave: number;
	isRest?: boolean;
};
export type Voice = {
	stack: StackedNotes[];
	staff: StaffEnum;
};
export type StackedNotes = {
	notes: SheetNote[];
	duration: 'w' | 'h' | 'q' | '8' | '16' | '32' | '64';
	chordName?: string;
	isRest?: boolean;
};
export type Duration = StackedNotes['duration'];
export type MultiSheetQuestion = {
	_8va?: boolean;
	key: string;
	voices: Voice[];
	measuresCount?: number; // Maximum number of measures to display
};
export type MultiSheetCard = CardTypeBase<CardTypeEnum.MultiSheet, MultiSheetQuestion>;

export type MultiExactAnswer = BaseAnswer & {
	// voices: Array<StackedNotes[]>;
};
