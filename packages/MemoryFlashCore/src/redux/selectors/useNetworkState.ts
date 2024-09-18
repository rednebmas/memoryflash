import { useSelector } from 'react-redux';
import { ReduxState } from '../store';

const noNetworkState = { isLoading: false, error: null };

export function useNetworkState(name: string) {
	return useSelector((state: ReduxState) => {
		return state.network._[name] || noNetworkState;
	});
}
