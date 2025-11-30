export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

export const buttonBaseClasses =
	'inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-150';

export const variantEnabledStyles: Record<ButtonVariant, string> = {
	primary:
		'bg-accent text-white hover:bg-accent-hover dark:bg-[#e8e8ea] dark:text-[#1a1a1a] dark:hover:bg-[#d4d4d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
	secondary:
		'bg-gray-100 text-lm-fg hover:bg-gray-200 dark:bg-dm-elevated dark:text-dm-fg dark:hover:bg-white/15',
	outline:
		'bg-transparent text-lm-muted hover:bg-gray-100 dark:text-dm-muted dark:hover:bg-white/5',
	danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
};

export const variantDisabledStyles: Record<ButtonVariant, string> = {
	primary: 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500',
	secondary: 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dm-surface dark:text-gray-500',
	outline: 'bg-transparent text-gray-300 cursor-not-allowed dark:text-gray-600',
	danger: 'bg-red-300 text-red-100 cursor-not-allowed',
};
