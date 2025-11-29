import { AppThunk } from '../store';
import { getCourses } from './get-courses-action';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const importDeck =
	(deckId: string, targetCourseId?: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'importDeck', async () => {
			await api.post(`/decks/${deckId}/import`, { targetCourseId });
			dispatch(getCourses());
		});
	};

export const importCourse =
	(courseId: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'importCourse', async () => {
			await api.post(`/courses/${courseId}/import`);
			dispatch(getCourses());
		});
	};
