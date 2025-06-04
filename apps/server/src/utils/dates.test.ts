import { expect } from 'chai';
import { oneDayInSeconds, oneWeekInSeconds } from './dates';

describe('dates utilities', () => {
    it('oneWeekInSeconds should equal seven days', () => {
        expect(oneWeekInSeconds).to.equal(oneDayInSeconds * 7);
    });
});
