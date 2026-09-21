import { expect } from 'chai';
import { gapForRung, nextReview } from './nextReview';

describe('nextReview', () => {
	it('spaces cards by 2, 5, 10 and then keeps doubling forever', () => {
		expect([0, 1, 2, 3, 4, 10].map(gapForRung)).to.deep.equal([2, 5, 10, 20, 40, 2560]);
	});

	it('brings a first-try correct new card back after two other cards', () => {
		expect(nextReview(undefined, true, 7)).to.deep.equal({ rung: 0, due: 10 });
	});

	it('climbs a rung on each first-try correct answer', () => {
		expect(nextReview({ rung: 1, due: 0 }, true, 20)).to.deep.equal({ rung: 2, due: 31 });
	});

	it('drops back one rung on a miss', () => {
		expect(nextReview({ rung: 2, due: 0 }, false, 20)).to.deep.equal({ rung: 1, due: 26 });
	});

	it('keeps a missed card on the bottom rung', () => {
		expect(nextReview(undefined, false, 0).rung).to.equal(0);
		expect(nextReview({ rung: 0, due: 0 }, false, 0).rung).to.equal(0);
	});
});
