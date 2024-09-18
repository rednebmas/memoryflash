import React, { useState } from 'react';
import { login } from 'MemoryFlashCore/src/redux/actions/login-action';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { useNavigate } from 'react-router-dom';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useUpdateEffect } from '../utils/useUpdateEffect';

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
		<div>
			<h1>Log in</h1>
			<form onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Email'
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
				/>
				<input
					type='password'
					placeholder='Password'
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
				/>
				<div className='text-red-600 '>{error}</div>

				<button type='submit' className=''>
					Login
				</button>
			</form>
		</div>
	);
};
