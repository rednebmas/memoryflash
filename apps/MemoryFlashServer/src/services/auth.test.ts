import { expect } from 'chai';
import { ForgotPassword } from '../models';
import { requestPasswordReset, resetPassword, signUp } from '.';
import { setupDBConnectionForTesting } from '../config/test-setup';

describe('Auth', async () => {
	setupDBConnectionForTesting();

	it('should be able register a new user', async () => {
		const user = await signUp('John', 'Doe', 'john@gmail.com', 'Testing1!');

		expect(user).to.have.property('_id');
		expect(user).to.have.property('firstName', 'John');
		expect(user).to.have.property('lastName', 'Doe');
		expect(user).to.have.property('email', 'john@gmail.com');
	});

	it('should be able to request for password reset', async () => {
		const user = await signUp('John', 'Doe', 'john@gmail.com', 'Testing1!');

		await requestPasswordReset(user.email);

		const forgotPassword = await ForgotPassword.findOne({
			user: user._id,
		});

		expect(forgotPassword).to.not.be.null;
	});

	it('should be able to reset password', async () => {
		const user = await signUp('John', 'Doe', 'john@gmail.com', 'Testing1!');

		await requestPasswordReset(user.email);

		let forgotPassword = (await ForgotPassword.findOne({
			user: user._id,
		}))!;

		await resetPassword(forgotPassword._id as string, 'Testing2!');

		forgotPassword = (await ForgotPassword.findOne({
			user: user._id,
		}))!;

		expect(forgotPassword).to.have.property('reset', true);
	});
});
