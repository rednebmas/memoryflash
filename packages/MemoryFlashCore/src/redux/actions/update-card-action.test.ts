import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { StaffEnum } from '../../types/Cards';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { updateCard } from './update-card-action';

const question = { key: 'C', voices: [{ staff: StaffEnum.Treble, stack: [] }] };

const sentQuestion = async (cardType: string, textPrompt?: string) => {
	const store = makeTestStore();
	let sent: MultiSheetQuestion | undefined;
	const patch = async (_url: string, body: { question: MultiSheetQuestion }) => {
		sent = body.question;
		return { data: { card: { _id: 'c1', question: body.question } } };
	};
	const thunk = updateCard('c1', question, cardType, textPrompt);
	await thunk(store.dispatch as never, store.getState, { api: { patch } } as never);
	return sent;
};

describe('updateCard', () => {
	it('keeps the Sheet Music presentation mode on sheet music cards', async () => {
		const sent = await sentQuestion('Sheet Music');
		expect(sent?.presentationModes).to.deep.equal([{ id: 'Sheet Music' }]);
	});

	it('sets the Text Prompt presentation mode on text prompt cards', async () => {
		const sent = await sentQuestion('Text Prompt', 'Play it');
		expect(sent?.presentationModes).to.deep.equal([{ id: 'Text Prompt', text: 'Play it' }]);
	});
});
