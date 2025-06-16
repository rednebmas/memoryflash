import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from 'MemoryFlashCore/src/redux/actions/sign-up-action';
import { authSelector } from 'MemoryFlashCore/src/redux/selectors/authSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import {
	AuthForm,
	EmailInput,
	InputField,
	PasswordInput,
	Button,
	NativeSettingsButton,
} from '../components';

export const SignUpScreen: React.FunctionComponent<{}> = ({}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const { isLoading, error } = useNetworkState('auth.signup');

	const [firstName, setFirstName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const authStatus = useAppSelector(authSelector);
	useEffect(() => {
		if (authStatus === 'Authenticated') {
			navigate('/');
		}
	}, [authStatus]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		dispatch(signUp(email, password, firstName));
	};
	return (
		<div className="relative">
			<NativeSettingsButton className="absolute top-4 right-4" />
			<AuthForm title="Sign Up" onSubmit={handleSubmit}>
				<InputField
					id="firstName"
					label="First name"
					value={firstName}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setFirstName(e.target.value)
					}
					required
					autoComplete="first-name"
				/>

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

				<div className="text-red-600">{error}</div>

				<Button type="submit" loading={isLoading}>
					Sign Up
				</Button>
				<p className="mt-6 text-center text-sm text-gray-500">
					Already have an account?{' '}
					<Link
						to="/auth/login"
						className="font-semibold text-blue-600 hover:text-blue-500"
					>
						Log in
					</Link>
				</p>
			</AuthForm>
		</div>
	);
};
