import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from 'MemoryFlashCore/src/redux/actions/sign-up-action';
import { authSelector } from 'MemoryFlashCore/src/redux/selectors/authSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { AuthFormContainer, LabeledInput, LoadingButton } from '../components';

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
                <AuthFormContainer title='Sign Up'>
                        <form className='space-y-6' onSubmit={handleSubmit}>
                                <LabeledInput
                                        id='firstName'
                                        type='text'
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        autoComplete='first-name'
                                        label='First name'
                                />

                                <LabeledInput
                                        id='email'
                                        type='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete='email'
                                        label='Email address'
                                />

                                <LabeledInput
                                        id='password'
                                        type='password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete='current-password'
                                        label='Password'
                                />

                                <div className='flex items-center justify-between'>
                                        <div className='flex items-center'>
                                                <input
                                                        id='remember-me'
                                                        type='checkbox'
                                                        className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600'
                                                        defaultChecked
                                                />
                                                <label htmlFor='remember-me' className='ml-3 block text-sm leading-6 text-gray-900 dark:text-gray-100'>
                                                        Remember me
                                                </label>
                                        </div>
                                        <div className='text-sm leading-6'>
                                                <a href='#' className='font-semibold text-blue-600 hover:text-blue-500'>
                                                        Forgot password?
                                                </a>
                                        </div>
                                </div>

                                <div className='text-red-600'>{error}</div>

                                <LoadingButton type='submit' loading={isLoading}>
                                        Sign Up
                                </LoadingButton>
                        </form>
                </AuthFormContainer>
        );
};
