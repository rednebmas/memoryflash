import { expect } from 'chai';
import { activeSchedulerSelector, autoSchedulerSelector } from './activeSchedulerSelector';

describe('activeSchedulerSelector', () => {
	it('uses recall automatically only for chord-name input on a chord-memory deck', () => {
		expect(autoSchedulerSelector.resultFunc('names', true)).to.equal('recall');
		expect(autoSchedulerSelector.resultFunc('names', false)).to.equal('speed');
		expect(autoSchedulerSelector.resultFunc('piano', true)).to.equal('speed');
	});

	it('lets the deck override beat the automatic choice', () => {
		expect(activeSchedulerSelector.resultFunc('auto', 'recall')).to.equal('recall');
		expect(activeSchedulerSelector.resultFunc('speed', 'recall')).to.equal('speed');
		expect(activeSchedulerSelector.resultFunc('recall', 'speed')).to.equal('recall');
	});
});
