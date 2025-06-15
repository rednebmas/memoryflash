import { expect } from 'chai';
import { addRests } from 'MemoryFlashCore/src/lib/notationBuilder';
import { StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';

describe('addRests', () => {
	it('fills a simple remainder', () => {
		const notes: StackedNotes[] = [
			{ notes: [{ name: 'C', octave: 4 }], duration: 'h' },
			{ notes: [{ name: 'D', octave: 4 }], duration: 'q' },
		];
		const res = addRests(notes);
		expect(res.map((n) => n.duration)).to.eql(['h', 'q', 'qr']);
	});

	it('handles complex remainder', () => {
		const notes: StackedNotes[] = [
			{ notes: [{ name: 'C', octave: 4 }], duration: 'h' },
			{ notes: [{ name: 'D', octave: 4 }], duration: '8' },
		];
		const res = addRests(notes);
		expect(res.slice(2).map((n) => n.duration)).to.eql(['qr', '8r']);
	});

	it('returns same array when full', () => {
		const notes: StackedNotes[] = [
			{ notes: [{ name: 'C', octave: 4 }], duration: 'h' },
			{ notes: [{ name: 'D', octave: 4 }], duration: 'h' },
		];
		const res = addRests(notes);
		expect(res.length).to.equal(2);
	});
});
