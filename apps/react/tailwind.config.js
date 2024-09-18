/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
	darkMode: 'class',
	content: ['!./src/submodules/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}', './index.html'],
	theme: {
		screens: {
			xs: '425px',
			...defaultTheme.screens,
		},
		extend: {
			colors: {
				btn: '#274535',
				card: '#E8E7E7',
			},
		},
		fontFamily: {
			primary: ['Jost', ...defaultTheme.fontFamily.sans],
			secondary: ['Futura', ...defaultTheme.fontFamily.sans],
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
