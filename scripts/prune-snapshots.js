#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const testsDir = path.resolve(__dirname, '../apps/react/tests');

function tokens(spec) {
	const out = new Set();
	const strRe = /(['"`])([\s\S]*?)\1/g;
	const src = fs
		.readFileSync(spec, 'utf8')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/\/\/.*$/gm, '');
	for (const m of src.matchAll(strRe)) {
		const s = m[2];
		const pre = s.split('${')[0];
		if (/^[A-Za-z0-9._-]+$/.test(pre)) out.add(pre);
		if (/^[A-Za-z0-9._-]+\.png$/.test(s)) out.add(s);
	}
	return out;
}

function findUnused() {
	const unused = [];
	for (const file of fs.readdirSync(testsDir)) {
		if (!/\.spec\.tsx?$/.test(file)) continue;
		const tok = tokens(path.join(testsDir, file));
		const dir = path.join(testsDir, file + '-snapshots');
		if (!fs.existsSync(dir)) continue;
		for (const png of fs.readdirSync(dir)) {
			if (!png.endsWith('.png')) continue;
			const name = png.replace(/\.png$/, '');
			let match = false;
			for (const t of tok) {
				if (name === t || png === t || name.startsWith(t)) {
					match = true;
					break;
				}
			}
			if (!match) unused.push(path.join(dir, png));
		}
	}
	for (const dir of fs.readdirSync(testsDir)) {
		if (dir.endsWith('.spec.ts-snapshots') || dir.endsWith('.spec.tsx-snapshots')) {
			const spec = path.join(testsDir, dir.replace('-snapshots', ''));
			if (!fs.existsSync(spec)) unused.push(path.join(testsDir, dir));
		}
	}
	return unused;
}

const prune = process.argv.includes('--prune');
const unused = findUnused();
if (unused.length) {
	const rel = unused.map((f) => path.relative(process.cwd(), f));
	console.error('Unused snapshots:', rel.join('\n'));
	if (prune) {
		for (const f of unused) {
			fs.rmSync(f, { recursive: true, force: true });
			try {
				fs.rmdirSync(path.dirname(f));
			} catch (_) {}
		}
	} else process.exit(1);
}
