import { useEffect } from 'react';

export const useDarkMode = () => {
	useEffect(() => {
		const toggleDarkMode = (isDark: boolean): void => {
			document.body.classList.toggle('dark', isDark);
		};

		// Media query to detect dark mode preference
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		toggleDarkMode(darkModeMediaQuery.matches);

		const handleChange = (event: MediaQueryListEvent): void => {
			toggleDarkMode(event.matches);
		};

		darkModeMediaQuery.addEventListener('change', handleChange);

		return () => {
			darkModeMediaQuery.removeEventListener('change', handleChange);
		};
	}, []);
};
