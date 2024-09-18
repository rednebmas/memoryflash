import { promiseAll } from '../utils';
import { User } from '../models';

export async function userOnLoadInfo(userId: string) {
	const [user] = await promiseAll([User.findById(userId)]);

	return {
		user: user?.toJSON(),
	};
}
