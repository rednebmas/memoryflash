import { expect } from 'chai';
import { clickSlots, clickSound, enabledClicks, toggleClick } from './metronomeClicks';

describe('metronomeClicks', () => {
	it('labels every beat and its offbeat in the bar', () => {
		expect(clickSlots(3).map((s) => s.label)).to.deep.equal(['1', '&', '2', '&', '3', '&']);
	});

	it('clicks every downbeat by default', () => {
		expect(enabledClicks(undefined, 4)).to.deep.equal([0, 2, 4, 6]);
		expect(enabledClicks(undefined, 3)).to.deep.equal([0, 2, 4]);
	});

	it('ignores slots past the end of a shorter bar', () => {
		expect(enabledClicks([0, 4, 6], 3)).to.deep.equal([0, 4]);
	});

	it('toggles a slot off', () => {
		expect(toggleClick([0, 2, 4, 6], 2)).to.deep.equal([0, 4, 6]);
	});

	it('toggles an offbeat on in sorted order', () => {
		expect(toggleClick([0, 4], 1)).to.deep.equal([0, 1, 4]);
	});

	it('accents beat one, ticks other enabled slots, and is silent otherwise', () => {
		expect(clickSound([0, 4], 0)).to.equal('accent');
		expect(clickSound([0, 4], 4)).to.equal('beat');
		expect(clickSound([0, 4], 2)).to.equal(undefined);
		expect(clickSound([4], 0)).to.equal(undefined);
	});
});
