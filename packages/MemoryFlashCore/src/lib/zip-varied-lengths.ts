type ZipElement<T extends unknown[]> = T[number][];

export function zipVariedLengths<T extends unknown[]>(...arrays: T[]): ZipElement<T>[] {
	const maxLength = Math.max(...arrays.map((arr) => arr.length));
	const zipped: ZipElement<T>[] = [];

	for (let i = 0; i < maxLength; i++) {
		const tuple: any[] = [];
		arrays.forEach((arr) => {
			if (i < arr.length) {
				tuple.push(arr[i]);
			}
		});
		zipped.push(tuple);
	}

	return zipped;
}
