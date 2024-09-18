import { hash } from 'bcrypt';
import { ForgotPassword, User } from '../models';
import { promiseAll } from '../utils';
import { Err } from '../middleware';

const hashRounds = 11;

export const signUp = async (
	firstName: string,
	lastName: string,
	email: string,
	password: string,
) => {
	const [hashedPassword, existingUser] = await promiseAll([
		hash(password, hashRounds),
		User.findOne({ email }),
	]);

	if (existingUser) {
		throw new Err('User already exists');
	}

	const user = new User({
		firstName,
		lastName,
		email,
		passwordHash: hashedPassword,
	});

	return await user.save();
};

export const requestPasswordReset = async (email: string) => {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Err('User not found', 404);
	}

	// Check if the user has requested for password reset more than 3 times in the last 24 hours

	const forgotPasswordCount = await ForgotPassword.find({
		user: user._id,
		createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
	}).countDocuments();

	if (forgotPasswordCount > 3) {
		throw new Err('You have exceeded the maximum number of password reset requests', 429);
	}

	const forgotPassword = new ForgotPassword({
		user: user._id,
	});

	await forgotPassword.save();

	//TODO: Send email to user with password reset link
};

export const resetPassword = async (token: string, password: string) => {
	// Check if token is valid, has not been used before and has not expired (30 minutes)

	const forgotPassword = await ForgotPassword.findOne({
		_id: token,
		reset: false,
		createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
	});

	if (!forgotPassword) {
		throw new Err('Invalid token', 400);
	}

	// Update user password
	const [user, passwordHash] = await promiseAll([
		User.findById(forgotPassword.user),
		await hash(password, hashRounds),
	]);

	if (!user) {
		throw new Err('User not found', 404);
	}

	user.passwordHash = passwordHash;
	forgotPassword.reset = true;

	await promiseAll([user.save(), forgotPassword.save()]);
};
