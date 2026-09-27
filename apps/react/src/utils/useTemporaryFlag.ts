import { useEffect, useState } from 'react';

export const useTemporaryFlag = (ms: number): [boolean, () => void] => {
	const [flag, setFlag] = useState(false);
	useEffect(() => {
		if (!flag) return;
		const timer = setTimeout(() => setFlag(false), ms);
		return () => clearTimeout(timer);
	}, [flag]);
	return [flag, () => setFlag(true)];
};
