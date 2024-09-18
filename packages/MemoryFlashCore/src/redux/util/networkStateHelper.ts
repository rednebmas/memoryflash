import { networkActions } from '../slices/networkSlice';
import { AppDispatch } from '../store';
import { NetworkErrorMsg } from './networkErrorMessage';

interface NetworkCallWithReduxStateOptions {
	successCb?: () => void;
	failureCb?: () => void;
}

export const networkCallWithReduxState = async (
	dispatch: AppDispatch,
	networkStateName: string,
	networkCallAndProcessing: () => Promise<void>,
	options?: NetworkCallWithReduxStateOptions,
) => {
	try {
		dispatch(
			networkActions.set({
				name: networkStateName,
				isLoading: true,
				error: null,
			}),
		);

		await networkCallAndProcessing();

		dispatch(
			networkActions.set({
				name: networkStateName,
				isLoading: false,
				error: null,
			}),
		);

		if (options?.successCb) {
			options.successCb();
		}
	} catch (error) {
		const msg = NetworkErrorMsg(error);

		dispatch(
			networkActions.set({
				name: networkStateName,
				isLoading: false,
				error: msg,
			}),
		);

		if (options?.failureCb) {
			options.failureCb();
		}
	}
};
