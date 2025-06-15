import { expect } from 'chai';
import { insertRestsToFillBars } from 'MemoryFlashCore/src/lib/measure';
import { StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';

describe('insertRestsToFillBars', () => {
	it('adds rest to fill last bar', () => {
		const notes: StackedNotes[] = [
			{ notes: [{ name: 'C', octave: 4 }], duration: 'q' },
			{ notes: [{ name: 'D', octave: 4 }], duration: 'q' },
			{ notes: [{ name: 'E', octave: 4 }], duration: 'q' },
		];
		const result = insertRestsToFillBars(notes);
		expect(result.map((n) => n.rest || false)).to.deep.equal([false, false, false, true]);
	});

	it('handles overflow into next bar', () => {
		const notes: StackedNotes[] = [
			{ notes: [{ name: 'C', octave: 4 }], duration: 'q' },
			{ notes: [{ name: 'D', octave: 4 }], duration: 'q' },
			{ notes: [{ name: 'E', octave: 4 }], duration: 'h' },
			{ notes: [{ name: 'F', octave: 4 }], duration: 'q' },
		];
		const result = insertRestsToFillBars(notes);
		expect(result.filter((n) => n.rest).length).to.equal(2); // half + quarter
	});
});
