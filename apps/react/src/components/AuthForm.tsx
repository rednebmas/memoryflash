import React from 'react';
import { OpenSettingsButton } from './OpenSettingsButton';

interface AuthFormProps {
	title: string;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	children: React.ReactNode;
}

export const AuthForm: React.FC<AuthFormProps> = ({ title, onSubmit, children }) => {
	return (
		<div className="relative flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="absolute right-6 top-6">
				<OpenSettingsButton />
			</div>
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
					{title}
				</h2>
			</div>
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
					<form className="space-y-6" onSubmit={onSubmit}>
						{children}
					</form>
				</div>
			</div>
		</div>
	);
};
