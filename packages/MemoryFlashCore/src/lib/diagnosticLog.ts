type Snapshot = () => string;

export const createDiagnosticLog = (max: number, now: () => number) => {
	const entries: string[] = [];
	const snapshots = new Map<string, Snapshot>();
	const stamp = (tag: string, msg: string) => `[${tag} +${(now() / 1000).toFixed(1)}s] ${msg}`;
	const read = (fn: Snapshot) => {
		try {
			return `snapshot ${fn()}`;
		} catch (e) {
			return `snapshot failed: ${e instanceof Error ? e.message : String(e)}`;
		}
	};

	return {
		log(tag: string, msg: string) {
			entries.push(stamp(tag, msg));
			if (entries.length > max) entries.shift();
		},
		snapshot(tag: string, fn: Snapshot) {
			snapshots.set(tag, fn);
		},
		entries: () => [
			...entries,
			...Array.from(snapshots).map(([tag, fn]) => stamp(tag, read(fn))),
		],
	};
};

export const diagnostics = createDiagnosticLog(20, () => performance.now());
