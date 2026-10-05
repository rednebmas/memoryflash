const SECTION =
	/^(intro|verse|pre-?chorus|chorus|bridge|outro|solo|transition|interlude|hook|coda|tag|refrain|break|part|\d+)$/i;

const bracketed = (text: string): string[] | null => {
	const before = text.match(/^\[([^\]]+)\]\s*(.+)$/);
	if (before) return [before[2], before[1]];
	const after = text.match(/^(.+?)\s*\[([^\]]+)\]$/);
	return after && [after[1], after[2]];
};

const sectionRun = (words: string[]): number => {
	const n = words.findIndex((w) => !SECTION.test(w));
	return n === -1 ? words.length : n;
};

const bySectionWords = (text: string): string[] => {
	const words = text.split(/\s+/);
	const tail = sectionRun([...words].reverse());
	if (tail > 0 && tail < words.length)
		return [words.slice(0, -tail).join(' '), words.slice(-tail).join(' ')];
	const head = sectionRun(words);
	if (head > 0 && head < words.length)
		return [words.slice(head).join(' '), words.slice(0, head).join(' ')];
	return [text];
};

export const textPromptLines = (text: string): string[] | null => {
	const t = text.trim();
	if (/^#|[\n*_`]/.test(t)) return null;
	return bracketed(t) ?? bySectionWords(t);
};
