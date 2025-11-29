import { AppDispatch } from '../redux/store';

export const createMockDispatch = () => {
	const actions: { type?: string }[] = [];
	const dispatch = ((action: { type?: string }) => {
		actions.push(action);
		return action;
	}) as AppDispatch;
	return { actions, dispatch };
};
