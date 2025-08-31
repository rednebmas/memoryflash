const fs = require('fs');
const path = require('path');

function gather(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) files.push(...gather(full));
		else if (e.isFile() && full.endsWith('.png')) files.push(full);
	}
	return files;
}

const root = path.join(__dirname, '..', 'apps', 'react', 'tests');
const snaps = gather(root).filter((f) => f.includes('-snapshots'));
const unused = [];

for (const file of snaps) {
	const spec = file.replace(/-snapshots\/[^\/]+$/, '');
	const name = path.basename(file);
	const base = name.replace(/-\d+\.png$/, '');
	if (!fs.existsSync(spec)) {
		unused.push(file);
		continue;
	}
	const text = fs.readFileSync(spec, 'utf8');
	if (!text.includes(name) && !text.includes(base)) unused.push(file);
}

if (unused.length) {
	if (process.argv.includes('--prune')) {
		for (const f of unused) fs.rmSync(f);
		const dirs = [...new Set(unused.map((f) => path.dirname(f)))];
		for (const d of dirs) if (!fs.readdirSync(d).length) fs.rmdirSync(d);
		console.log(`Removed unused snapshots:\n${unused.join('\n')}`);
	} else {
		console.error(`Unused snapshots:\n${unused.join('\n')}`);
		process.exit(1);
	}
}
