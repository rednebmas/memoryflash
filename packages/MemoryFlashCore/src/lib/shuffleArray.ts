export function shuffleArray<T>(array: T[]): T[] {
	// Create a shallow copy of the array
	let copy = array.slice();
	let currentIndex = copy.length,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[copy[currentIndex], copy[randomIndex]] = [copy[randomIndex], copy[currentIndex]];
	}

	return copy;
}
