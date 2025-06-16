import React, { useState } from 'react';
import { InputField, InputFieldProps } from './InputField';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const PasswordInput: React.FC<Omit<InputFieldProps, 'type'>> = (props) => {
	const [show, setShow] = useState(false);
	return (
		<InputField
			{...props}
			type={show ? 'text' : 'password'}
			afterElement={
				<button
					type="button"
					className="absolute inset-y-0 right-0 flex items-center pr-3"
					onClick={() => setShow(!show)}
				>
					{show ? (
						<EyeSlashIcon className="h-5 w-5 text-gray-500" />
					) : (
						<EyeIcon className="h-5 w-5 text-gray-500" />
					)}
				</button>
			}
		/>
	);
};
