import { expect } from 'chai';
import { fitWithin } from './fitWithin';

describe('fitWithin', () => {
	it('keeps images that already fit', () => {
		expect(fitWithin(800, 600, 2000)).to.deep.equal({ width: 800, height: 600 });
	});

	it('scales the longest side down preserving aspect ratio', () => {
		expect(fitWithin(4032, 3024, 2000)).to.deep.equal({ width: 2000, height: 1500 });
		expect(fitWithin(3000, 4000, 2000)).to.deep.equal({ width: 1500, height: 2000 });
	});
});
