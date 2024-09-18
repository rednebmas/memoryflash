import { DependencyList, EffectCallback, useEffect } from 'react';
import { useIsFirstRender } from './useIsFirstRender';

// https://usehooks-ts.com/react-hook/use-update-effect

export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
	const isFirst = useIsFirstRender();

	useEffect(() => {
		if (!isFirst) {
			return effect();
		}
	}, deps);
}
