import React from 'react';

interface AuthFormContainerProps {
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const AuthFormContainer: React.FC<AuthFormContainerProps> = ({ title, children, footer }) => {
    return (
        <div className='flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
                <h2 className='mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white'>
                    {title}
                </h2>
            </div>

            <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
                <div className='bg-white dark:bg-gray-800 px-6 py-12 shadow sm:rounded-lg sm:px-12'>
                    {children}
                    {footer && <div className='mt-10'>{footer}</div>}
                </div>
            </div>
        </div>
    );
};
