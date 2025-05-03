import { Chord, Note, Interval } from 'tonal';

// Define types for clarity
type Voicing = string[];
type ChordVoicings = { chord: string; voicings: Voicing[] };
type Movement = { fromVoicing: Voicing; toVoicing: Voicing; distance: number };
type Path = { path: Voicing[]; totalDistance: number };

// Function to get all permutations of voicings for a chord
function getVoicings(chord: string): Voicing[] {
	const notes = Chord.get(chord).notes;

	// Generate inversions by rotating the notes array
	const inversions: Voicing[] = [notes];
	for (let i = 1; i < notes.length; i++) {
		const inversion = [
			...inversions[i - 1].slice(1),
			Note.transpose(inversions[i - 1][0], 'P8'),
		];
		inversions.push(inversion);
	}

	return inversions;
}

// Function to calculate the "distance" or "movement" between two voicings
function calculateDistance(from: Voicing, to: Voicing): number {
	let totalDistance = 0;

	from.forEach((note, index) => {
		const interval = Interval.distance(note, to[index]);
		const semitones = Interval.semitones(interval);
		totalDistance += Math.abs(semitones);
	});

	return totalDistance;
}

// Recursive function to find all possible paths through the progression
function findPathsThroughProgression(
	currentIndex: number,
	currentPath: Voicing[],
	currentDistance: number,
	allVoicings: ChordVoicings[],
): Path[] {
	const paths: Path[] = [];

	// If we've reached the end of the progression, return the current path and its total distance
	if (currentIndex === allVoicings.length) {
		return [{ path: currentPath, totalDistance: currentDistance }];
	}

	const nextChordVoicings = allVoicings[currentIndex].voicings;
	const lastVoicing = currentPath[currentPath.length - 1];

	// For each voicing of the next chord, calculate the distance and recursively find paths
	nextChordVoicings.forEach((nextVoicing) => {
		const distance = calculateDistance(lastVoicing, nextVoicing);
		const newPath = [...currentPath, nextVoicing];
		const newDistance = currentDistance + distance;

		// Recursively find paths from the next chord
		const subPaths = findPathsThroughProgression(
			currentIndex + 1,
			newPath,
			newDistance,
			allVoicings,
		);

		paths.push(...subPaths);
	});

	return paths;
}

// Function to find and sort paths by shortest sum of distances
function findAndSortPaths(progression: string[]): void {
	const allVoicings: ChordVoicings[] = progression.map((chord) => ({
		chord,
		voicings: getVoicings(chord),
	}));

	const startingChordVoicings = allVoicings[0].voicings;
	let allPaths: Path[] = [];

	// For each starting voicing, recursively find all paths through the progression
	startingChordVoicings.forEach((startVoicing) => {
		const pathsFromStart = findPathsThroughProgression(
			1, // Start with the second chord
			[startVoicing], // The first voicing in the path
			0, // Initial distance is zero
			allVoicings,
		);
		allPaths.push(...pathsFromStart);
	});

	// Sort paths by total distance
	allPaths.sort((a, b) => a.totalDistance - b.totalDistance);

	// Print the sorted paths
	allPaths.forEach((path, index) => {
		console.log(`Path ${index + 1}: Total Distance = ${path.totalDistance}`);
		console.log(path);

		path.path.forEach((voicing, chordIndex) => {
			console.log(`  Chord ${chordIndex + 1}: [${voicing.join(', ')}]`);
		});
		console.log();
	});
}

// Example triad progression
// const triadProgression = ["Cmaj", "Gmaj", "Amin", "Fmaj"];
const triadProgression = ['C', 'G', 'Amin', 'F'];

// Find and display paths sorted by shortest total distance
findAndSortPaths(triadProgression);
