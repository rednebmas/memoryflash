export function filterNullOrUndefined<T>(arr: Array<T>): Array<NonNullable<T>> {
	return arr.filter((x) => !!x || (typeof x === 'number' && x === 0)) as any;
}
