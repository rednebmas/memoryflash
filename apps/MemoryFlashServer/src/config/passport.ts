import { compare } from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Err } from '../middleware';
import { User, UserDoc } from '../models';

passport.serializeUser((expressUser, done) => {
	const user = expressUser as UserDoc;
	done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (error) {
		done(error);
	}
});

passport.use(
	new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
		try {
			const user = await User.findOne({ email });

			if (!user) {
				throw new Err('Incorrect email', 401);
			}

			const isMatch = await compare(password, user.passwordHash);

			if (!isMatch) {
				throw new Err('Incorrect password', 401);
			}

			return done(null, user);
		} catch (error) {
			done(error);
		}
	}),
);

export { passport };
