import { MongoMemoryServer } from 'mongodb-memory-server';

export const createMemoryServer = async (attempts = 5): Promise<MongoMemoryServer> => {
	try {
		return await MongoMemoryServer.create();
	} catch (error) {
		const portRace = error instanceof Error && error.message.includes('already in use');
		if (!portRace || attempts <= 1) throw error;
		return createMemoryServer(attempts - 1);
	}
};
