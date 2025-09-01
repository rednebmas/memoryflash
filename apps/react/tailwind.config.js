/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
	darkMode: 'class',
	content: [
		'!./src/submodules/**/*.{js,jsx,ts,tsx}',
		'./src/**/*.{js,jsx,ts,tsx}',
		'./index.html',
	],
	theme: {
		screens: {
			xs: '425px',
			...defaultTheme.screens,
		},
		extend: {
			colors: {
				btn: '#274535',
				card: '#E8E7E7',
				dm: {
					bg: '#0f0f11',
					surface: '#1e1e20',
					elevated: 'rgba(223, 223, 255, 0.09)',
					slightlyElevated: 'rgba(223, 223, 255, 0.03)',
					border: 'rgba(255, 255, 255, 0.1)',
					fg: '#fcfcfd',
					muted: 'rgba(255, 255, 255, 0.6)',
				},
				lm: {
					bg: '#f8f9fa',
					surface: '#ffffff',
					elevated: '#f3f4f6',
					slightlyElevated: '#f5f6f7',
					border: '#e5e7eb',
					fg: '#111827',
					muted: '#6b7280',
				},
				accent: {
					DEFAULT: '#2657d5',
					hover: '#1e4bb8',
				},
			},
			letterSpacing: {
				tighter: '-0.05em',
				tight: '-0.025em',
			},
		},
		fontFamily: {
			primary: ['Jost', ...defaultTheme.fontFamily.sans],
			secondary: ['Futura', ...defaultTheme.fontFamily.sans],
		},
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
