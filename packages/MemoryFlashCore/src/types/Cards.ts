import { ObjectId } from 'mongoose';
import { MultiExactAnswer, MultiSheetCard } from './MultiSheetCard';
import { PresentationMode } from './PresentationMode';

export enum CardTypeEnum {
	Interval = 'Interval',
	ChordSymbol = 'ChordSymbol',
	BasicSheet = 'BasicSheet',
	MultiSheet = 'MultiSheet',
}

export enum StaffEnum {
	Treble = 'Treble',
	Bass = 'Bass',
	Grand = 'Grand',
}

export enum AnswerType {
	AnyOctave = 'AnyOctave',
	Exact = 'Exact',
	ExactMulti = 'ExactMulti',
}
export type BaseAnswer = { type: AnswerType };
export type AnyOctaveAnswer = BaseAnswer & {
	notes: string[]; // A#, Bb, C, ...
};
export type ExactAnswer = BaseAnswer & {
	notes: string[]; // A#4, Bb2, C5, ...
};
export type Answer = AnyOctaveAnswer | ExactAnswer | MultiExactAnswer;

export type CardTypeBase<T extends CardTypeEnum, Q extends {}> = {
	uid: string; // a unique identifier for the card so we can update it in the future
	type: T;
	question: Q & { presentationModes?: PresentationMode[] };
	answer: Answer;
};

// Interval
export interface IntervalQuestion {
	interval: string;
	direction: 'up' | 'down';
	note: string;
}
export type IntervalAnswer = {
	type: AnswerType;
	note: string;
};
export type IntervalCard = CardTypeBase<CardTypeEnum.Interval, IntervalQuestion>;

// Chord
export type ChordSymbolQuestion = {
	chordName: string;
};
export type ChordSymbolCard = CardTypeBase<CardTypeEnum.ChordSymbol, ChordSymbolQuestion>;

// Chord sheet
export type BasicSheetQuestion = {
	staff: StaffEnum;
	notes: string[];
	interval?: {
		direction: 'up' | 'down';
		interval: string;
	};
};
export type BasicSheetCard = CardTypeBase<CardTypeEnum.BasicSheet, BasicSheetQuestion>;

//
// Card
//
export type _Card<Id extends string | ObjectId> = (
	| IntervalCard
	| ChordSymbolCard
	| BasicSheetCard
	| MultiSheetCard
) & {
	_id: Id;
	deckId: Id;
	createdAt: Date;
	updatedAt: Date;
};
export type Card = _Card<string>;
