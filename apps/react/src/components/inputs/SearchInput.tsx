import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput';

export type SearchInputProps = Omit<BaseInputProps, 'type'>;

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
	({ className = '', ...props }, ref) => (
		<BaseInput ref={ref} type="text" className={`py-2 px-3 ${className}`} {...props} />
	),
);
SearchInput.displayName = 'SearchInput';
