import { BaseAnswer, CardTypeBase, CardTypeEnum, StaffEnum } from './Cards';
import type { Duration } from '../lib/measure';

export type NoteTie = {
	toNext?: number[];
	fromPrevious?: number[];
};

export type SheetNote = {
	name: string; // Rest, C, Bb, D#, ...
	octave: number;
};
export type Voice = {
	stack: StackedNotes[];
	staff: StaffEnum;
};
export type StackedNotes = {
	notes: SheetNote[];
	duration: Duration;
	chordName?: string;
	rest?: boolean;
	tie?: NoteTie;
};

export type NoteDuration = StackedNotes['duration'];
export type MultiSheetQuestion = {
	_8va?: boolean;
	key: string;
	voices: Voice[];
};
export type MultiSheetCard = CardTypeBase<CardTypeEnum.MultiSheet, MultiSheetQuestion>;

export type MultiExactAnswer = BaseAnswer & {
	voices?: Array<StackedNotes[]>;
};
