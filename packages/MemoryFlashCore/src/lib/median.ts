export function calculateMedian(numbers: number[]): number {
	const sortedNumbers = [...numbers]
		.filter((x) => x !== undefined && !isNaN(x))
		.sort((a, b) => a - b);
	const middleIndex = Math.floor(sortedNumbers.length / 2);

	if (sortedNumbers.length % 2 === 0) {
		return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
	} else {
		return sortedNumbers[middleIndex];
	}
}
