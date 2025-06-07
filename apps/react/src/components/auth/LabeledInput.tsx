import React from 'react';

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({ id, label, className = '', ...props }) => {
    return (
        <div>
            <label htmlFor={id} className='block text-sm font-medium leading-6 text-gray-900 dark:text-white'>
                {label}
            </label>
            <div className='mt-2'>
                <input
                    id={id}
                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6 ${className}`}
                    {...props}
                />
            </div>
        </div>
    );
};
