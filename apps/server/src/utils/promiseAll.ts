type PromiseType<T> = T extends Promise<infer U> ? U : never;

export async function promiseAll<T extends any[]>(
	promises: [...T],
): Promise<{ [K in keyof T]: PromiseType<T[K]> }> {
	const results = await Promise.allSettled(promises);
	const fulfilledValues = [] as any;
	for (const result of results) {
		if (result.status === 'fulfilled') {
			fulfilledValues.push(result.value);
		} else {
			throw result.reason; // Reject with the reason of the first rejected promise
		}
	}
	return fulfilledValues as { [K in keyof T]: PromiseType<T[K]> };
}
