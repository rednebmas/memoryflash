import * as dotenv from 'dotenv';
dotenv.config();

import MongoStore from 'connect-mongo';
import cors from 'cors';
import express, { Express } from 'express';
import session from 'express-session';
import type { MongoClient } from 'mongodb';
import { APP_URL, IS_PROD, SESSION_OPTS, passport } from './config';
import { customErrorHandler } from './middleware';
import { devSleep } from './middleware/devSleep';
import { api } from './routes';
import { connectDB, winstonErrorLogger, winstonLogger } from './utils';
import { generate251s } from './services/card-generators/ii-V-i/ii-V-I-progression-generators';
import { generateIntervalDecks } from './services/card-generators/interval-generators';
import { clearNonAuth } from './utils/clearNonAuth';
import {
	generateBluesCourse,
	generateBluesDecks,
} from './services/card-generators/blues/basic-blues-generator';
import { generatePopCourse } from './services/card-generators/pop/basic-I-V-vi-IV';
import { replayAttemptsForUser } from './services/attemptsService';
import Attempt from './models/Attempt';
import { singleHandedTritoneSub251 } from './services/card-generators/ii-V-i/ii-bII7-I-progression-generator';

const PORT = process.env.PORT || 3333;

const setupMiddlewaresAndRoutes = (server: Express, dbClient: MongoClient) => {
	server.set('trust proxy', true);

	const corsOrigins: (string | RegExp)[] = [];
	server.use(express.json());
	corsOrigins.push(/.*/);
	server.use(
		cors({
			origin: corsOrigins,
			credentials: true,
		}),
	);

	server.use(
		session({
			store: MongoStore.create({
				client: dbClient,
				stringify: false,
				autoRemove: 'interval',
				autoRemoveInterval: 60,
			}),
			...SESSION_OPTS,
		}),
	);

	server.use(passport.initialize());
	server.use(passport.session());

	server.use(winstonLogger);

	if (!IS_PROD) {
		server.use(devSleep);
	}

	server.use(api);
	server.use(customErrorHandler);
	server.use(winstonErrorLogger);
};

const initApp = async () => {
	try {
		const server = express();
		const dbClient = await connectDB();
		setupMiddlewaresAndRoutes(server, dbClient);
		server.listen(PORT, async () => {
			// seedData();
			// generateIntervalDecks();
			console.log(`Server is running on ${APP_URL}`);
			// await Attempt.updateMany(
			// 	{ timeTaken: { $gt: 60 } },
			// 	{ $set: { timeTaken: 60 } },
			// ).exec();
			// await Attempt.deleteMany().exec();

			// replayAttemptsForUser('66d4a69b871f809f48a0d2b7');
			// generate251s();
			// generateBluesCourse();
			// generatePopCourse();
		});
	} catch (error: any) {
		console.error(`Error:${error.message}`);
	}
};

initApp();
