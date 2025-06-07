import React from 'react';
import { Spinner } from '../Spinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ loading = false, children, className = '', disabled, ...props }) => {
    return (
        <button
            {...props}
            disabled={loading || disabled}
            className={`flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${className}`}
        >
            {loading ? <Spinner className='w-5 h-5' /> : children}
        </button>
    );
};
