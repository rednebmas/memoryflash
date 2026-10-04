import { RefObject, useLayoutEffect, useState } from 'react';

const PAGE_GUTTER = 32;

export const useNotationWidth = (ref: RefObject<HTMLElement>, fitWindow: boolean) => {
	const [width, setWidth] = useState(0);

	useLayoutEffect(() => {
		const el = fitWindow ? document.documentElement : ref.current;
		if (!el) return;
		const gutter = fitWindow ? PAGE_GUTTER : 0;
		const measure = () => setWidth(el.clientWidth - gutter);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [ref, fitWindow]);

	return width;
};
