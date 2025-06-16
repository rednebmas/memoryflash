import React, { useState } from 'react';
import { login } from 'MemoryFlashCore/src/redux/actions/login-action';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { Link, useNavigate } from 'react-router-dom';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useUpdateEffect } from '../utils/useUpdateEffect';
import { AuthForm, EmailInput, PasswordInput, Button } from '../components';

// Use:
// https://tailwindui.com/components/application-ui/forms/sign-in-forms

export const LoginScreen: React.FunctionComponent<{}> = ({}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const { isLoading, error } = useNetworkState('auth.login');

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useUpdateEffect(() => {
		if (!isLoading && !error) {
			navigate('/');
		}
	}, [isLoading, error]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault(); // Prevent default form submission behavior
		dispatch(login(email, password));
	};

	return (
		<AuthForm title="Log in" onSubmit={handleSubmit}>
			<EmailInput
				id="email"
				label="Email address"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>

			<PasswordInput
				id="password"
				label="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
				autoComplete="current-password"
			/>

			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<input
						id="remember-me"
						type="checkbox"
						className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
						defaultChecked
					/>
					<label
						htmlFor="remember-me"
						className="ml-3 block text-sm leading-6 text-gray-900"
					>
						Remember me
					</label>
				</div>
				<div className="text-sm leading-6">
					<a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
						Forgot password?
					</a>
				</div>
			</div>
			<div className="text-red-600 ">{error}</div>

			<Button type="submit" loading={isLoading}>
				Login
			</Button>
			<p className="mt-6 text-center text-sm text-gray-500">
				Not a member?{' '}
				<Link
					to="/auth/sign-up"
					className="font-semibold text-blue-600 hover:text-blue-500"
				>
					Sign up
				</Link>
			</p>
		</AuthForm>
	);
};
