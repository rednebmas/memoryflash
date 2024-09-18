import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export const setupDBConnectionForTesting = async (): Promise<void> => {
	let mongod: MongoMemoryServer | undefined;

	before(async () => {
		mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();
		await mongoose.connect(uri);
	});

	beforeEach(async () => {
		const collections = await mongoose.connection.db!.collections();
		for (const collection of collections) {
			await collection.deleteMany({});
		}
	});

	after(async () => {
		if (mongod) {
			await mongoose.disconnect();
			await mongod.stop();
		}
	});
};
