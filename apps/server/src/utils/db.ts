import mongoose from 'mongoose';
import type { MongoClient } from 'mongodb';
import { MONGO_URI } from '../config/constants';

export const connectDB = async (): Promise<MongoClient> => {
	try {
		const useMemory = process.env.USE_MEMORY_DB === 'true';
		let res: typeof mongoose;
		if (useMemory) {
			console.log('Starting MongoMemoryServer...');
			const { MongoMemoryServer } = await import('mongodb-memory-server');
			const mongod = await MongoMemoryServer.create();
			const uri = mongod.getUri();
			res = await mongoose.connect(uri);
			console.log(`MongoMemoryServer connected at ${uri}`);
			// Ensure in-memory server stops with process
			process.on('exit', async () => {
				await res?.connection?.close();
				await mongod.stop();
			});
			process.once('SIGUSR2', async () => {
				await res?.connection?.close();
				await mongod.stop();
				process.kill(process.pid, 'SIGUSR2');
			});
		} else {
			console.log('Connecting to MongoDB...');
			res = await mongoose.connect(MONGO_URI, {
				retryWrites: true,
				w: 'majority',
			});
			console.log(`MongoDB connected: ${res.connection.host}`);
			// Clear the database completely
			// await mongoose.connection.db.dropDatabase();
			process.on('exit', async () => {
				await mongoose.connection.close();
			});

			// This is specifically for nodemon, it uses SIGUSR2 to restart the process
			process.once('SIGUSR2', async () => {
				await mongoose.connection.close();
				process.kill(process.pid, 'SIGUSR2');
			});
		}

		return res.connection.getClient() as unknown as MongoClient;
	} catch (error: any) {
		console.error(`Error:${error.message}`);
		process.exit(1);
	}
};
