import { UserDoc } from '../../models';
import { MongoId } from 'MemoryFlashCore/src/types/helper-types';

declare global {
	namespace Express {
		// Honestly... not sure this is doing anything.
		interface User extends UserDoc {
			_id: MongoId;
		}

		interface Request {
			user: UserDoc;
			isAuthenticated(): boolean;
		}
	}
}
