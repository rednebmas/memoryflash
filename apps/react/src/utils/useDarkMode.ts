import { useEffect } from 'react';

export const useDarkMode = () => {
	useEffect(() => {
		const toggleDarkMode = (isDark: boolean): void => {
			document.documentElement.classList.toggle('dark', isDark);

			const themeColor = isDark ? '#000000' : '#f1f5f9';
			const metaThemeColor = document.querySelector('meta[name="theme-color"]');
			if (metaThemeColor) {
				metaThemeColor.setAttribute('content', themeColor);
			}
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
