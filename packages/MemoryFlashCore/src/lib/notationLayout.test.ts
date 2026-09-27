import { expect } from 'chai';
import { barSlot, barsPerLine } from './notationLayout';

describe('notation layout', () => {
	it('fits as many bars as the width allows, up to four', () => {
		expect(barsPerLine(8, 2000, 300)).to.equal(4);
		expect(barsPerLine(8, 700, 300)).to.equal(2);
		expect(barsPerLine(8, 200, 300)).to.equal(1);
		expect(barsPerLine(2, 2000, 300)).to.equal(2);
	});

	it('places bars in rows', () => {
		expect(barSlot(5, 4)).to.deep.equal({ line: 1, column: 1, isLineStart: false });
		expect(barSlot(4, 4)).to.deep.equal({ line: 1, column: 0, isLineStart: true });
	});
});
