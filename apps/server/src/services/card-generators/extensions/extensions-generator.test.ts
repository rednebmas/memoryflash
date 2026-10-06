import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../../../config/test-setup';
import { Card } from '../../../models/Card';
import Course from '../../../models/Course';
import {
	extensionDecks,
	generateExtensionDecks,
	generateExtensionsCourse,
} from './extensions-generator';
import { voiceAllRoots } from './extension-voicings';

const voicings = (name: string, degrees?: string) => {
	const deck = extensionDecks.find(
		(d) => d.name === name && (!degrees || d.degrees.join('-') === degrees),
	)!;
	return Object.fromEntries(
		voiceAllRoots(deck).map(({ symbol, lh, rh }) => [symbol, `${lh} | ${rh.join(' ')}`]),
	);
};

describe('extensions generator', () => {
	it('voices ninths as LH root, RH 7-9-3', () => {
		const ninths = voicings('Dominant 9th');
		expect(ninths['Bb9']).to.equal('Bb2 | Ab3 C4 D4');
		expect(ninths['C9']).to.equal('C3 | Bb3 D4 E4');
		expect(ninths['F#9']).to.equal('F#3 | E4 G#4 A#4');
		expect(voicings('Minor 9th')['Cm9']).to.equal('C3 | Bb3 D4 Eb4');
		expect(voicings('Major 9th')['Ebmaj9']).to.equal('Eb3 | D4 F4 G4');
	});

	it('voices Type A rootless as LH root, RH 3-5-7-9', () => {
		expect(voicings('Dominant 9th', '3-5-7-9')['C9']).to.equal('C3 | E4 G4 Bb4 D5');
		expect(voicings('Minor 9th', '3-5-7-9')['Dm9']).to.equal('D2 | F3 A3 C4 E4');
		expect(voicings('Major 9th', '3-5-7-9')['Gmaj9']).to.equal('G2 | B3 D4 F#4 A4');
	});

	it('voices Type B rootless as LH root, RH 7-9-3-5', () => {
		expect(voicings('Dominant 9th', '7-9-3-5')['G9']).to.equal('G2 | F3 A3 B3 D4');
		expect(voicings('Minor 9th', '7-9-3-5')['Cm9']).to.equal('C3 | Bb3 D4 Eb4 G4');
		expect(voicings('Major 9th', '7-9-3-5')['Fmaj9']).to.equal('F3 | E4 G4 A4 C5');
	});

	it('explains each rootless type in its section subtitle', () => {
		const subtitles = generateExtensionDecks('course')
			.map(([d]) => d.section + ': ' + d.sectionSubtitle)
			.join('\n');
		expect(subtitles).to.match(/Type A Rootless.*: .*3rd/);
		expect(subtitles).to.match(/Type B Rootless.*: .*7th/);
	});

	it('voices sevenths as LH root, RH 3-5-7', () => {
		expect(voicings('Major 7th')['Ebmaj7']).to.equal('Eb2 | G3 Bb3 D4');
		expect(voicings('Major 7th')['Cmaj7']).to.equal('C3 | E4 G4 B4');
		expect(voicings('Minor 7th')['C#m7']).to.equal('C#3 | E4 G#4 B4');
		expect(voicings('Dominant 7th')['G7']).to.equal('G2 | B3 D4 F4');
	});

	it('spells diminished sevenths from the root', () => {
		const dims = voicings('Diminished 7th');
		expect(dims['Edim7']).to.equal('E2 | G3 Bb3 Db4');
		expect(dims['C#dim7']).to.equal('C#3 | E4 G4 Bb4');
		expect(dims['Cdim7']).to.equal('C3 | Eb4 Gb4 Bbb4');
	});

	it('picks the root spelling with the fewest awkward accidentals', () => {
		expect(Object.keys(voicings('Major 7th'))).to.include.members(['Dbmaj7', 'Gbmaj7']);
		expect(Object.keys(voicings('Minor 7th'))).to.include.members(['C#m7', 'G#m7', 'Bbm7']);
		expect(Object.keys(voicings('Dominant 9th'))).to.include.members(['F#9', 'Ab9', 'Bb9']);
		expect(Object.keys(voicings('Diminished 7th'))).to.include.members(['D#dim7', 'A#dim7']);
	});

	it('covers all 12 roots in every deck', () => {
		extensionDecks.forEach((d) => expect(Object.keys(voicings(d.name))).to.have.length(12));
	});

	it('puts the root in the bass staff and the upper notes in the treble', () => {
		const [, cards] = generateExtensionDecks('course')[4];
		const bb9 = cards.find((c) => c.uid.startsWith('Bb9 '))!;
		const staves = bb9.question.voices.map(
			(v) => `${v.staff} ${v.stack[0].notes.map((n) => n.name + n.octave).join(' ')}`,
		);
		expect(staves).to.deep.equal(['Treble Ab3 C4 D4', 'Bass Bb2']);
		expect(bb9.question.voices[0].stack[0].chordName).to.equal('Bb9');
	});

	describe('course', () => {
		setupDBConnectionForTesting();

		it('upserts idempotently as a system course', async () => {
			await generateExtensionsCourse();
			await generateExtensionsCourse();
			const courses = await Course.find({ name: 'Extensions' });
			expect(courses).to.have.length(1);
			expect(courses[0].userId).to.equal(undefined);
			expect(courses[0].decks).to.have.length(13);
			expect(await Card.countDocuments()).to.equal(156);
		});
	});
});
