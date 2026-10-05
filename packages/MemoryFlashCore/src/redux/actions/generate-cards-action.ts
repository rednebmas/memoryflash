import { generatedCardsActions } from '../slices/generatedCardsSlice';
import { AppDispatch, AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { GenerateCardsInput, GenerationJobStatus } from '../../types/GeneratedCards';
import { AxiosInstance as Api } from 'axios';

const POLL_MS = 2000;

type UploadProgress = { loaded: number; total?: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const startJob = async (
	dispatch: AppDispatch,
	api: Api,
	url: string,
	input: GenerateCardsInput,
) => {
	const onUploadProgress = ({ loaded, total }: UploadProgress) =>
		dispatch(
			generatedCardsActions.setGeneration({
				uploadPercent: total ? Math.round((loaded / total) * 100) : 0,
			}),
		);
	const res = await api.post<{ jobId: string }>(url, input, { onUploadProgress });
	dispatch(generatedCardsActions.setGeneration({ stage: 'generating' }));
	return res.data.jobId;
};

const pollJob = async (dispatch: AppDispatch, api: Api, url: string, pollMs: number) => {
	for (;;) {
		await sleep(pollMs);
		const { data } = await api.get<GenerationJobStatus>(url);
		if (data.song) return data.song;
		dispatch(generatedCardsActions.setGeneration({ stage: data.stage }));
	}
};

export const generateCards =
	(deckId: string, input: GenerateCardsInput, pollMs = POLL_MS): AppThunk =>
	async (dispatch, _, { api }) => {
		const url = `/decks/${deckId}/generate-cards`;
		dispatch(generatedCardsActions.startGeneration({ hasImage: !!input.image }));
		await networkCallWithReduxState(dispatch, 'generateCards', async () => {
			const jobId = await startJob(dispatch, api, url, input);
			const song = await pollJob(dispatch, api, `${url}/${jobId}`, pollMs);
			dispatch(generatedCardsActions.setSong(song));
		});
		dispatch(generatedCardsActions.setGeneration(null));
	};
