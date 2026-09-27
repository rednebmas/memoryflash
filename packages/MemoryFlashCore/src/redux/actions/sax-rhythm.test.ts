import { expect } from 'chai';
import { makeCard } from '../../lib/schedulers/testHelpers';
import { SaxRhythmSession } from '../../lib/rhythm/saxRhythmSession';
import { AnswerType, CardTypeEnum, StaffEnum } from '../../types/Cards';
import { StackedNotes } from '../../types/MultiSheetCard';
import { saxFirstNoteSelector, saxNoteWindowsSelector } from '../selectors/saxRhythmSelectors';
import { nextDeadlineMsSelector } from '../selectors/rhythmSelectors';
import { settingsActions } from '../slices/settingsSlice';
import { setupRhythmStore } from '../testStore';
import { anchorSaxCard, reportCoverageStep } from './rhythm-actions';

const FRAME = 1000 / 60;
const note = (name: string, duration: StackedNotes['duration']) => ({
	notes: [{ name, octave: 4 }],
	duration,
});

const melodyCard = (id: string) => ({
	...makeCard(id),
	type: CardTypeEnum.MultiSheet,
	question: {
		key: 'C',
		voices: [
			{ staff: StaffEnum.Treble, stack: [note('C', 'q'), note('D', 'q'), note('E', 'h')] },
		],
	},
	answer: { type: AnswerType.ExactMulti },
});

type Span = { from: number; to: number; midi?: number };
type Store = ReturnType<typeof setupRhythmStore>;

const play = (store: Store, spans: Span[]) => {
	const session = new SaxRhythmSession();
	const end = Math.max(...spans.map((s) => s.to)) + 500;
	for (let t = 0; t < end; t += FRAME) {
		session.add({ timeMs: t, midi: spans.find((s) => t >= s.from && t < s.to)?.midi });
	}
	const first = saxFirstNoteSelector(store.getState())!;
	store.dispatch(anchorSaxCard(session.anchorOnset(first.midis)!, first.beat));
	const windows = saxNoteWindowsSelector(store.getState());
	windows.forEach((w, i) =>
		store.dispatch(reportCoverageStep(w.index, session.grade(w), i === windows.length - 1)),
	);
	return windows;
};

const lastAttempt = (store: Store) =>
	store.posted[store.posted.length - 1] as {
		correct: boolean;
		timing?: { offsetsMs: (number | null)[] };
	};

describe('sax rhythm grading', () => {
	const onTime = [
		{ from: 1010, to: 1490, midi: 60 },
		{ from: 1500, to: 1980, midi: 62 },
		{ from: 2000, to: 2850, midi: 64 },
	];

	it('passes a melody held for its written lengths', async () => {
		const store = setupRhythmStore([melodyCard('a'), melodyCard('b')], 'sax');
		const windows = play(store, onTime);
		expect(windows.map((w) => [w.startMs, w.endMs])).to.deep.equal([
			[1000, 1500],
			[1500, 2000],
			[2000, 3000],
		]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(true);
		expect(store.getState().rhythm.lastReport?.steps.map((s) => s.tier)).to.deep.equal([
			'perfect',
			'perfect',
			'good',
		]);
	});

	it('fails a note cut short', async () => {
		const store = setupRhythmStore([melodyCard('a'), melodyCard('b')], 'sax');
		play(store, [onTime[0], { from: 1500, to: 1700, midi: 62 }, onTime[2]]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(false);
	});

	it('shifts windows by the sax latency, not the piano latency', () => {
		const store = setupRhythmStore([melodyCard('a'), melodyCard('b')], 'sax');
		store.dispatch(settingsActions.setRhythmLatencyMs(200));
		store.dispatch(settingsActions.setSaxRhythmLatencyMs(60));
		const late = onTime.map((s) => ({ ...s, from: s.from + 60, to: s.to + 60 }));
		expect(play(store, late)[0].startMs).to.equal(1060);
	});

	it('does not arm the piano missed-beat deadline', () => {
		const store = setupRhythmStore([melodyCard('a'), melodyCard('b')], 'sax');
		play(store, [onTime[0]]);
		expect(nextDeadlineMsSelector(store.getState())).to.equal(undefined);
	});
});
