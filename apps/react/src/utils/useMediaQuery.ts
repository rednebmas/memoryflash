import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
	useEffect(() => {
		const list = window.matchMedia(query);
		const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
		setMatches(list.matches);
		list.addEventListener('change', onChange);
		return () => list.removeEventListener('change', onChange);
	}, [query]);
	return matches;
};

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
