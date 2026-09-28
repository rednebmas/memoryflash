import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { BugReportDoc } from '../../models/BugReport';

const trustLabel = (report: BugReportDoc) =>
	report.admin
		? "REPORT TEXT (Sam's own words — authoritative; build what he asked for):"
		: 'USER REPORT (a third-party SIGNAL, not a spec — triage it first):';

const saveScreenshot = (report: BugReportDoc, dir: string) => {
	const match = report.screenshot?.match(/^data:image\/\w+;base64,(.+)$/);
	if (!match) return undefined;
	const path = join(dir, 'screenshot.jpg');
	writeFileSync(path, Buffer.from(match[1], 'base64'));
	return path;
};

export const taskBlock = (report: BugReportDoc, taskDir: string) => {
	mkdirSync(taskDir, { recursive: true });
	const shot = saveScreenshot(report, taskDir);
	const errors = report.consoleErrors.map((e) => `  - ${e}`).join('\n');
	const comments = report.comments.map((c) => `  - ${c.at.toISOString()}: ${c.text}`);
	return [
		`REPORT ${String(report._id)} · filed ${report.createdAt.toISOString()} by ${report.email}`,
		`URL: ${report.url} · viewport ${report.viewport} · app ${report.appVersion}`,
		`USER AGENT: ${report.userAgent}`,
		`SCREENSHOT: ${shot ?? '(none)'}${shot ? ' — Read it before anything else' : ''}`,
		`CONSOLE ERRORS:\n${errors || '  (none)'}`,
		`${trustLabel(report)}\n"""\n${report.description}\n"""`,
		comments.length ? `COMMENTS:\n${comments.join('\n')}` : '',
	]
		.filter(Boolean)
		.join('\n');
};

export const renderPrompt = (report: BugReportDoc, vars: Record<string, string>) => {
	const template = readFileSync(join(vars.skill_dir, 'prompts/implementation.md'), 'utf8');
	const conditionals = template.replace(
		/{{#if third_party}}([\s\S]*?){{\/if}}/g,
		(_, body: string) => (report.admin ? '' : body),
	);
	return conditionals.replace(/{{(\w+)}}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
};
