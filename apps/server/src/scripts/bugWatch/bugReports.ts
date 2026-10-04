import mongoose from 'mongoose';
import { writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { BugReport, BugReportDoc, BugReportStatus } from '../../models/BugReport';
import {
	addBugReportComment,
	claimBugReport,
	setBugReportStatus,
} from '../../services/bugReportService';
import { renderPrompt, taskBlock } from './taskPrompt';

const SKILL_DIR = resolve(__dirname, '../../../../../.claude/skills/bug-watch');
const summary = (r: BugReportDoc) =>
	JSON.stringify({
		id: String(r._id),
		email: r.email,
		status: r.status,
		text: r.description.slice(0, 160),
	});

const findFull = (id: string) => BugReport.findById(id).select('+screenshot').orFail();

const watch = async () => {
	const backlog = await BugReport.find({ admin: true, status: 'new' }).sort({ createdAt: 1 });
	backlog.forEach((r) => console.log(summary(r)));
	const stream = BugReport.watch([
		{ $match: { operationType: 'insert', 'fullDocument.admin': true } },
	]);
	stream.on('change', (change) => {
		if (change.operationType === 'insert')
			console.log(summary(BugReport.hydrate(change.fullDocument)));
	});
	stream.on('error', (err) => {
		console.error(`watch error: ${err.message}`);
		process.exit(1);
	});
	await new Promise(() => {});
};

const list = async (statuses: string[]) => {
	const reports = await BugReport.find({ status: { $in: statuses } }).sort({ createdAt: 1 });
	reports.forEach((r) => console.log(summary(r)));
};

const writePrompt = async (id: string, wtDir: string) => {
	const report = await findFull(id);
	const taskDir = join(wtDir, 'tasks', id);
	const vars = {
		report_id: id,
		wt_dir: wtDir,
		skill_dir: SKILL_DIR,
		reports: join(wtDir, '.claude/skills/bug-watch/reports.sh'),
		finish: join(wtDir, '.claude/skills/bug-watch/finish-task.sh'),
		evidence_dir: join(resolve(wtDir, '..'), '_evidence', id),
		task_block: taskBlock(report, taskDir),
	};
	const path = join(taskDir, 'prompt.md');
	writeFileSync(path, renderPrompt(report, vars));
	console.log(path);
};

const SECRET_FIELDS = { passwordHash: 0, screenshot: 0, token: 0 };
const { EJSON } = mongoose.mongo.BSON;

const query = async ([collection, filter = '{}', limit = '20']: string[]) => {
	const docs = await mongoose.connection
		.collection(collection)
		.find(EJSON.parse(filter) as mongoose.mongo.Filter<mongoose.AnyObject>, {
			projection: SECRET_FIELDS,
		})
		.limit(Number(limit))
		.toArray();
	console.log(EJSON.stringify(docs, undefined, 1, { relaxed: true }));
};

const commands: Record<string, (args: string[]) => Promise<void>> = {
	watch,
	list: async (args) =>
		list(args.length ? args : ['new', 'building', 'proposed-close', 'failed']),
	claim: async ([id, branch]) => {
		const claimed = await claimBugReport(id, branch ?? `task/${id}`);
		if (!claimed) throw new Error(`Report ${id} is not new (already claimed?)`);
		console.log(summary(claimed));
	},
	show: async ([id]) =>
		console.log(taskBlock(await findFull(id), join(process.cwd(), 'tasks', id))),
	query,
	prompt: async ([id, wtDir]) => writePrompt(id, resolve(wtDir)),
	comment: async ([id, ...text]) => void (await addBugReportComment(id, text.join(' '))),
	'set-status': async ([id, status, commit]) =>
		void (await setBugReportStatus(id, status as BugReportStatus, commit)),
};

const main = async () => {
	const [name, ...args] = process.argv.slice(2);
	const command = commands[name];
	if (!command) throw new Error(`Usage: reports.sh <${Object.keys(commands).join('|')}> ...`);
	await mongoose.connect(process.env.MONGO_URI!);
	await command(args);
	await mongoose.disconnect();
};

main().catch((err: Error) => {
	console.error(err.message);
	process.exit(1);
});
