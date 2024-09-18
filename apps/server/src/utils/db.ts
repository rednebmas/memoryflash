import mongoose from 'mongoose';
import { MONGO_URI } from '../config/constants';

export const connectDB = async () => {
	try {
		console.log('Connecting to MongoDB...');
		const res = await mongoose.connect(MONGO_URI, {
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

		return res.connection.getClient();
	} catch (error: any) {
		console.error(`Error:${error.message}`);
		process.exit(1);
	}
};
