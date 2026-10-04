import { expect } from 'chai';
import { Types } from 'mongoose';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { BugReport } from '../models/BugReport';
import {
	addBugReportComment,
	claimBugReport,
	fileBugReport,
	fileDirectTask,
	isAdminEmail,
	setBugReportStatus,
} from './bugReportService';

const user = (email: string) => ({ _id: new Types.ObjectId().toString(), email });
const input = { description: 'Piano keys stick', url: '/study/1', consoleErrors: ['boom'] };

describe('bugReportService', () => {
	setupDBConnectionForTesting();

	beforeEach(() => {
		process.env.ADMIN_EMAILS = 'Admin@Example.com, other@example.com';
	});

	it('matches admin emails case-insensitively from ADMIN_EMAILS', () => {
		expect(isAdminEmail('admin@example.com')).to.equal(true);
		expect(isAdminEmail('OTHER@example.com')).to.equal(true);
		expect(isAdminEmail('someone@example.com')).to.equal(false);
	});

	it('files a report flagged admin for admin users', async () => {
		const report = await fileBugReport(user('admin@example.com'), input);
		expect(report.admin).to.equal(true);
		expect(report.status).to.equal('new');
		expect(report.consoleErrors).to.deep.equal(['boom']);
	});

	it('files a non-admin report for everyone else', async () => {
		const report = await fileBugReport(user('someone@example.com'), input);
		expect(report.admin).to.equal(false);
	});

	it('keeps the screenshot out of default queries', async () => {
		const report = await fileBugReport(user('a@b.co'), { ...input, screenshot: 'data:x' });
		const plain = await BugReport.findById(report._id).lean();
		expect(plain?.screenshot).to.equal(undefined);
		const full = await BugReport.findById(report._id).select('+screenshot').lean();
		expect(full?.screenshot).to.equal('data:x');
	});

	it('truncates oversized fields', async () => {
		const report = await fileBugReport(user('a@b.co'), {
			description: 'x'.repeat(20000),
			consoleErrors: Array.from({ length: 100 }, (_, i) => `e${i}`),
		});
		expect(report.description.length).to.equal(10000);
		expect(report.consoleErrors).to.have.length(30);
	});

	it('files a direct task as an admin report even for emails outside ADMIN_EMAILS', async () => {
		const task = await fileDirectTask(user('someone@example.com'), 'Make the metronome louder');
		expect(task.admin).to.equal(true);
		expect(task.status).to.equal('new');
		expect(task.description).to.equal('Make the metronome louder');
		expect(task.url).to.equal('(direct task)');
	});

	it('claims a new report exactly once', async () => {
		const report = await fileBugReport(user('admin@example.com'), input);
		const first = await claimBugReport(report.id, 'task/abc');
		const second = await claimBugReport(report.id, 'task/abc');
		expect(first?.status).to.equal('building');
		expect(first?.agent.branch).to.equal('task/abc');
		expect(second).to.equal(null);
	});

	it('rejects unknown statuses', async () => {
		const report = await fileBugReport(user('admin@example.com'), input);
		const err = await setBugReportStatus(report.id, 'nope' as 'new').catch((e: Error) => e);
		expect(err).to.be.instanceOf(Error);
	});

	it('sets status with an optional commit and appends comments', async () => {
		const report = await fileBugReport(user('admin@example.com'), input);
		await setBugReportStatus(report.id, 'fixed', 'abc123');
		await addBugReportComment(report.id, 'Plan: fix it');
		const updated = await BugReport.findById(report._id).lean();
		expect(updated?.status).to.equal('fixed');
		expect(updated?.agent.commit).to.equal('abc123');
		expect(updated?.comments.map((c) => c.text)).to.deep.equal(['Plan: fix it']);
	});
});
