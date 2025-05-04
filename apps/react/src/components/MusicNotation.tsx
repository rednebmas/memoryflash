import React, { useEffect, useRef } from 'react';
import { Stave, Vex, Note as VFNote } from 'vexflow';
import { MultiSheetQuestion, Voice, StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
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
		const staveNote = new VF.StaveNote({
			keys: stackedNotes.notes.map((note) => `${note.name}/${note.octave + (_8va ? 0 : 0)}`),
			duration: stackedNotes.duration,
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
		const emptyTextNote = new VF.TextNote({ text: '', duration: stackedNotes.duration }).setStave(
			stave,
		);
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
		let allNotesGroup = context.openGroup();
		
		// Define beat map type
		type BeatMap = {
			'w': number;
			'h': number;
			'q': number;
			'8': number;
			'16': number;
			'32': number;
			'64': number;
		};
		
		// Beat map for duration calculations
		const beatMap: BeatMap = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25, '32': 0.125, '64': 0.0625 };
		
		// Calculate total beats to determine how many measures we have
		const calculateTotalBeats = (stack: StackedNotes[]) => {
			return stack.reduce((total: number, item: StackedNotes) => {
				return total + (beatMap[item.duration as keyof BeatMap] || 0);
			}, 0);
		};
		
		// IMPORTANT: MusicNotation expects complete 4-beat measures.
		// It's the responsibility of the data provider (e.g., MusicRecorder) to ensure
		// that input data contains complete measures. This component will not attempt
		// to fix incomplete measures - it will only display what it's given.
		
		// We need to split the notes into measures of 4 beats each
		data.voices.forEach((voice) => {
			const stave = voice.staff === StaffEnum.Treble ? trebleStave! : bassStave!;
			
			// Split the stack into groups of 4 beats (one measure)
			let currentMeasureNotes: VFNote[] = [];
			let currentBeats = 0;
			let allMeasures: VFNote[][] = [];
			
			voice.stack.forEach((stackedNote, i) => {
				const noteDuration = beatMap[stackedNote.duration as keyof BeatMap] || 0;
				
				// If adding this note would exceed 4 beats, start a new measure
				if (currentBeats + noteDuration > 4) {
					if (currentMeasureNotes.length > 0) {
						allMeasures.push(currentMeasureNotes);
					}
					currentMeasureNotes = [];
					currentBeats = 0;
				}
				
				// Create the note and add it to the current measure
				const staveNote = new VF.StaveNote({
					keys: stackedNote.notes.map((note) => `${note.name}/${note.octave + (data._8va ? 0 : 0)}`),
					duration: stackedNote.isRest ? stackedNote.duration + 'r' : stackedNote.duration,
					clef: stave.getClef(),
					auto_stem: true,
				});
				staveNote.setStave(stave);
				
				if (allNotesClassName) {
					staveNote.addClass(allNotesClassName);
				}
				if (i < multiPartCardIndex && highlightClassName) {
					staveNote.addClass(highlightClassName);
				}
				
				currentMeasureNotes.push(staveNote);
				currentBeats += noteDuration;
				
				// If we've filled exactly 4 beats, start a new measure
				if (currentBeats === 4) {
					allMeasures.push(currentMeasureNotes);
					currentMeasureNotes = [];
					currentBeats = 0;
				}
			});
			
			// Add any remaining notes as the last measure
			if (currentMeasureNotes.length > 0) {
				allMeasures.push(currentMeasureNotes);
			}
			
			// Create a VexFlow Voice for each measure
			const voices = allMeasures.map(measureNotes => {
				// Only create a voice if we have notes to add
				if (measureNotes.length === 0) return null;
				
				const vfVoice = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables(measureNotes);
				VF.Accidental.applyAccidentals([vfVoice], data.key);
				return vfVoice;
			}).filter(Boolean); // Remove null voices
			
			// Only join and format if we have valid voices
			if (voices.length > 0) {
				// Join voices separately for each measure to avoid IncompleteVoice error
				voices.forEach(voice => {
					if (voice) {
						formatter.joinVoices([voice]);
					}
				});
				
				// Format and draw the notes
				formatter.formatToStave(voices as any, stave);
				voices.forEach(voice => {
					if (voice) {
						voice.draw(context, stave);
					}
				});
			}
		});
		
		// Handle chord notation
		if (!hideChords && data.voices.length > 0) {
			const textNotes = createTextNotes(data, topStave);
			
			// Split text notes into measures similar to regular notes
			let currentMeasureTextNotes: VFNote[] = [];
			let currentBeats = 0;
			let allTextMeasures: VFNote[][] = [];
			
			textNotes.forEach(textNote => {
				// Access the duration without using the protected property directly
				// Use type assertion to access internal properties safely
				const textNoteObj = textNote as any;
				const duration = textNoteObj.duration || 'q'; // Default to quarter note
				const noteDuration = beatMap[duration as keyof BeatMap] || 0;
				
				if (currentBeats + noteDuration > 4) {
					if (currentMeasureTextNotes.length > 0) {
						allTextMeasures.push(currentMeasureTextNotes);
					}
					currentMeasureTextNotes = [];
					currentBeats = 0;
				}
				
				currentMeasureTextNotes.push(textNote);
				currentBeats += noteDuration;
				
				if (currentBeats === 4) {
					allTextMeasures.push(currentMeasureTextNotes);
					currentMeasureTextNotes = [];
					currentBeats = 0;
				}
			});
			
			if (currentMeasureTextNotes.length > 0) {
				allTextMeasures.push(currentMeasureTextNotes);
			}
			
			// Create and draw voices for chord text notes
			const textVoices = allTextMeasures.map(measureTextNotes => {
				if (measureTextNotes.length === 0) return null;
				
				const textVoice = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables(measureTextNotes);
				return textVoice;
			}).filter(Boolean); // Remove null voices
			
			// Only join and format if we have valid voices
			if (textVoices.length > 0) {
				textVoices.forEach(voice => {
					if (voice) {
						formatter.joinVoices([voice]);
					}
				});
				
				// Format and draw
				formatter.formatToStave(textVoices as any, topStave);
				textVoices.forEach(voice => {
					if (voice) {
						voice.draw(context, topStave);
					}
				});
			}
		}

		context.closeGroup();
		allNotesGroup.classList.add('music-notation-notes');
	}, [data, multiPartCardIndex, allNotesClassName, highlightClassName, hideChords]);

	return <div className='svg-dark-mode' ref={divRef} id='output'></div>;
};
