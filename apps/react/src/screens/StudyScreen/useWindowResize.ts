import { useState, useEffect } from 'react';

interface WindowSize {
	width: number;
	height: number;
}

type ResizeCallback = (size: WindowSize) => void;

const useWindowResize = (callback?: ResizeCallback) => {
	const [windowSize, setWindowSize] = useState<WindowSize>({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		const handleResize = () => {
			const newSize = {
				width: window.innerWidth,
				height: window.innerHeight,
			};
			setWindowSize(newSize);
			if (callback) {
				callback(newSize);
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [callback]);

	return windowSize;
};

export default useWindowResize;
