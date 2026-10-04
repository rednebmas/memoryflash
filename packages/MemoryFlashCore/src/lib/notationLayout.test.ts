import { expect } from 'chai';
import { barSlot, lineLayout, MIN_BAR_WIDTH } from './notationLayout';

describe('notation layout', () => {
	it('fits up to four bars on a line at full width', () => {
		expect(lineLayout(4, 2000)).to.deep.equal({ perLine: 4, lines: 1, barWidth: 300 });
		expect(lineLayout(8, 2000)).to.deep.equal({ perLine: 4, lines: 2, barWidth: 300 });
		expect(lineLayout(2, 2000)).to.deep.equal({ perLine: 2, lines: 1, barWidth: 300 });
	});

	it('balances lines instead of leaving a lone bar', () => {
		expect(lineLayout(4, 600)).to.deep.equal({ perLine: 2, lines: 2, barWidth: 300 });
		expect(lineLayout(3, 400)).to.include({ perLine: 2, lines: 2 });
		expect(lineLayout(5, 2000)).to.include({ perLine: 3, lines: 2 });
	});

	it('shrinks bars to fit the available width', () => {
		expect(lineLayout(2, 500)).to.deep.equal({ perLine: 2, lines: 1, barWidth: 250 });
		expect(lineLayout(4, 500)).to.deep.equal({ perLine: 2, lines: 2, barWidth: 250 });
	});

	it('renders bars at the minimum width and lets them scale down to fit', () => {
		expect(lineLayout(4, 360)).to.deep.equal({
			perLine: 2,
			lines: 2,
			barWidth: MIN_BAR_WIDTH,
		});
		expect(lineLayout(4, 100)).to.deep.equal({
			perLine: 1,
			lines: 4,
			barWidth: MIN_BAR_WIDTH,
		});
	});

	it('places bars in rows', () => {
		expect(barSlot(5, 4)).to.deep.equal({ line: 1, column: 1, isLineStart: false });
		expect(barSlot(4, 4)).to.deep.equal({ line: 1, column: 0, isLineStart: true });
	});
});
