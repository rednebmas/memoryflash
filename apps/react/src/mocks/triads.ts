import { Course } from '../types/course';

// Since the data for sections and the segments are not coming from an API, we will need to return the conditions for the sections to be displayed when a segment is selected. We will formulate data as such in selector and make the selection of segment sent to redux instead on local state. The one thing this doen't consider is how the icons for segments or sections will be displayed as we have them as JSX files and the data is coming from the server

export const triads = (key: string = 'all'): Course => {
	const items: Course = {
		segments: {
			chordSymbols: 'Chord Symbols',
			sheetMusic: 'Sheet Music',
			leftHand: 'Left Hand',
			rightHand: 'Right Hand',
			bothHands: 'Both Hands'
		},
		sections: []
	};

	if (!items.segments) {
		return items;
	}

	const sectionsData = [
		{
			title: 'Chord Symbols',
			subTitle: 'Right Hand',
			subSections: [
				{
					title: 'Major'
				},
				{
					title: 'Minor'
				},
				{
					title: 'Diminished'
				},
				{
					title: 'Augmented'
				},
				{
					title: 'All triads'
				}
			],
			active: [items.segments.chordSymbols, items.segments.rightHand]
		},
		{
			title: 'Chord Symbols',
			subTitle: 'Left Hand',
			subSections: [
				{
					title: 'Major'
				},
				{
					title: 'Minor'
				},
				{
					title: 'Diminished'
				},
				{
					title: 'Augmented'
				},
				{
					title: 'All triads'
				}
			],
			active: [items.segments.chordSymbols, items.segments.leftHand]
		},
		{
			title: 'Chord Symbols',
			subTitle: 'Both Hands',
			subSections: [
				{
					title: 'Major',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Minor',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Diminished',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Augmented',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Major',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'Minor',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'Diminished',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'Augmented',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'All triads',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'All triads',
					subTitle: 'LEFT HAND OCTAVE'
				}
			],
			active: [items.segments.chordSymbols, items.segments.bothHands]
		},
		{
			title: 'Sheet Music',
			subTitle: 'Right Hand',
			subSections: [
				{
					title: 'Major'
				},
				{
					title: 'Minor'
				},
				{
					title: 'Diminished'
				},
				{
					title: 'Augmented'
				},
				{
					title: 'All triads'
				}
			],
			active: [items.segments.sheetMusic, items.segments.rightHand]
		},
		{
			title: 'Sheet Music',
			subTitle: 'Left Hand',
			subSections: [
				{
					title: 'Major'
				},
				{
					title: 'Minor'
				},
				{
					title: 'Diminished'
				},
				{
					title: 'Augmented'
				},
				{
					title: 'All triads'
				}
			],
			active: [items.segments.sheetMusic, items.segments.leftHand]
		},
		{
			title: 'Sheet Music',
			subTitle: 'Both Hands',
			subSections: [
				{
					title: 'Major',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Minor',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Diminished',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Augmented',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'Major',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'Minor',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'Diminished',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'Augmented',
					subTitle: 'LEFT HAND OCTAVE'
				},
				{
					title: 'All triads',
					subTitle: 'LEFT HAND ROOT'
				},
				{
					title: 'All triads',
					subTitle: 'LEFT HAND OCTAVE'
				}
			],
			active: [items.segments.sheetMusic, items.segments.bothHands]
		}
	];

	sectionsData.forEach((section) => {
		const { active } = section;

		if (active.includes(key) || key.toLowerCase() === 'all') {
			items.sections.push(section);
		}
	});

	return items;
};
