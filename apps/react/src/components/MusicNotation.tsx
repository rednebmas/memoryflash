import React, { useEffect, useRef } from 'react';
import { Stave, Vex, Note as VFNote } from 'vexflow';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Chord } from 'tonal';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

interface MusicNotationProps {
	data: MultiSheetQuestion;
	highlightClassName?: string;
	allNotesClassName?: string;
	hideChords?: boolean;
}

const VF = Vex.Flow;

const setupRendererAndStave = (div: HTMLDivElement, data: MultiSheetQuestion) => {
	const treble = !!data.voices.find((e) => e.staff === StaffEnum.Treble);
	const bass = !!data.voices.find((e) => e.staff === StaffEnum.Bass);

	const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
	const context = renderer.getContext();
	const width = 370;
	const height = treble && bass ? 250 : 160;

	renderer.resize(width + 2, height);

	let trebleStave: Stave | undefined;
	if (treble) {
		trebleStave = new VF.Stave(0, 20, width)
			.addClef('treble')
			.addTimeSignature('4/4')
			.addKeySignature(data.key);
		trebleStave.setContext(context).draw();
	}

	let bassStave: Stave | undefined;
	if (bass) {
		bassStave = new VF.Stave(0, treble ? 120 : 20, width)
			.addClef('bass')
			.addTimeSignature('4/4')
			.addKeySignature(data.key);
		bassStave.setContext(context).draw();
	}

	return { trebleStave, bassStave, context, width, height };
};

const createNotes = (
	voice: Voice,
	stave: Stave,
	allNotesClassName: string | undefined,
	highlightNotesClassName: string | undefined,
	multiPartCardIndex: number,
	_8va?: boolean,
) => {
	return voice.stack.map((stackedNotes, i) => {
		const isRest = stackedNotes.rest;
		const staveNote = new VF.StaveNote({
			keys: isRest
				? ['b/4']
				: stackedNotes.notes.map((note) => `${note.name}/${note.octave + (_8va ? 0 : 0)}`),
			duration: (isRest ? `${stackedNotes.duration}r` : stackedNotes.duration) as string,
			clef: stave.getClef(),
			auto_stem: true,
		});
		staveNote.setStave(stave);
		if (allNotesClassName) {
			staveNote.addClass(allNotesClassName);
		}
		if (i < multiPartCardIndex && highlightNotesClassName) {
			staveNote.addClass(highlightNotesClassName);
		}
		return staveNote;
	});
};

const createTextNotes = (data: MultiSheetQuestion, stave: Stave) => {
	return data.voices[0].stack.map((stackedNotes) => {
		const emptyTextNote = new VF.TextNote({
			text: '',
			duration: stackedNotes.duration,
		}).setStave(stave);
		if (!stackedNotes.chordName) return emptyTextNote;
		const chord = Chord.get(stackedNotes.chordName);
		if (!chord.tonic) return emptyTextNote;

		let text: string = chord.tonic.replace('b', '♭').replace('#', '♯');
		let superscript: string = '';
		switch (chord.type) {
			case 'minor seventh':
				text += 'm';
				superscript = '7';
				break;
			case 'dominant seventh':
				superscript = '7';
				break;
			case 'major seventh':
				superscript = '∆7';
				break;
			default:
				text = chord.symbol;
				break;
		}

		return new VF.TextNote({
			text,
			superscript,
			font: { family: 'FreeSerif' },
			duration: stackedNotes.duration,
		})
			.setJustification(VF.TextNote.Justification.CENTER)
			.setLine(-1)
			.setStave(stave);
	});
};

export const MusicNotation: React.FunctionComponent<MusicNotationProps> = ({
	data,
	allNotesClassName,
	highlightClassName,
	hideChords,
}) => {
	const divRef = useRef<HTMLDivElement>(null);
	const multiPartCardIndex = useAppSelector((state) => state.scheduler.multiPartCardIndex);

	useEffect(() => {
		const div = divRef.current;
		if (!div) return;
		div.innerHTML = '';

		const { bassStave, trebleStave, context } = setupRendererAndStave(div, data);
		const topStave = trebleStave || bassStave!;

		let formatter = new VF.Formatter();
		let vfNotes: VFNote[][] = [];
		let allNotesGroup = context.openGroup();

		let vfVoices = data.voices.map((voice) => {
			const notes = createNotes(
				voice,
				voice.staff === StaffEnum.Treble ? trebleStave! : bassStave!,
				allNotesClassName,
				highlightClassName,
				multiPartCardIndex,
				data._8va,
			);
			vfNotes.push(notes);
			const vfVoice = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables(notes);

			VF.Accidental.applyAccidentals([vfVoice], data.key);

			formatter.joinVoices([vfVoice]);
			return vfVoice;
		});

		// if (data._8va) {
		// const textBracket = new VF.TextBracket({
		// 	start: vfNotes[0][0],
		// 	stop: vfNotes[0][2],
		// 	// stop: vfNotes[0][vfNotes[0].length - 1],
		// 	text: '8',
		// 	superscript: 'va',
		// 	position: VF.TextBracketPosition.BOTTOM,
		// });
		// const startNote = vfNotes[0][0];
		// const endNote = vfNotes[0][vfNotes[0].length - 1];
		// }

		if (!hideChords) {
			const textNotes = createTextNotes(data, topStave);
			const textVoice = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables(textNotes);
			formatter.joinVoices([textVoice]);
			vfVoices.push(textVoice);
		}

		formatter.formatToStave(vfVoices, topStave);
		vfVoices.forEach((voice, i) => {
			let stave = topStave;
			if (data.voices[i]?.staff === StaffEnum.Bass && bassStave) {
				stave = bassStave;
			}
			voice.draw(context, stave);
		});

		context.closeGroup();
		allNotesGroup.classList.add('music-notation-notes');

		// if (data._8va) {
		// 	textBracket.setContext(context).draw();
		// }
	}, [data, multiPartCardIndex, allNotesClassName, highlightClassName, hideChords]);

	return <div className="svg-dark-mode" ref={divRef} id="output"></div>;
};
