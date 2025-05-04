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

// Helper function to get the correct rest positions based on standard music notation
const getRestPosition = (duration: string, clef: string): string => {
	// Standard rest positions in treble clef
	if (clef === 'treble') {
		// Whole and half rests sit on the middle line (B4)
		if (duration === 'w' || duration === 'h') {
			return 'b/4';
		}
		// Quarter rests sit centered on the staff (often shown as D5)
		else if (duration === 'q') {
			return 'd/5';
		}
		// Eighth rests and shorter generally centered (D5)
		else {
			return 'd/5';
		}
	}
	// Standard rest positions in bass clef
	else if (clef === 'bass') {
		// Whole and half rests sit on the middle line (D3)
		if (duration === 'w' || duration === 'h') {
			return 'd/3';
		}
		// Quarter rests sit centered on the staff (often shown as F3)
		else if (duration === 'q') {
			return 'f/3';
		}
		// Eighth rests and shorter generally centered (F3)
		else {
			return 'f/3';
		}
	}
	
	// Default fallback
	return 'b/4';
};

const setupRendererAndStave = (div: HTMLDivElement, data: MultiSheetQuestion, measuresCount: number) => {
	const treble = !!data.voices.find((e) => e.staff === StaffEnum.Treble);
	const bass = !!data.voices.find((e) => e.staff === StaffEnum.Bass);

	const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
	const context = renderer.getContext();
	
	// Calculate width based on number of measures
	// Base width for a single measure (was 370)
	const measureWidth = 200;
	const width = measureWidth * measuresCount;
	const height = treble && bass ? 250 : 160;

	renderer.resize(width + 2, height);

	return { context, width, height, treble, bass, measureWidth };
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
		
		// Calculate the number of measures based on the total beats
		const calculateMeasureCount = (voices: Voice[]): number => {
			if (!voices.length) return 1;
			
			// Get total beats from the longest voice
			const maxBeats = Math.max(...voices.map(voice => calculateTotalBeats(voice.stack)));
			
			// Each measure is 4 beats in 4/4 time, round up to nearest measure
			return Math.max(1, Math.ceil(maxBeats / 4));
		};
		
		// Determine the total number of measures for this music notation
		const measuresCount = calculateMeasureCount(data.voices);
		
		// Setup the renderer and get context
		const { context, treble, bass, measureWidth } = setupRendererAndStave(div, data, measuresCount);
		
		// Create format for the context
		const formatter = new VF.Formatter();
		const allNotesGroup = context.openGroup();
		
		// Process each voice
		data.voices.forEach((voice) => {
			const staves: Stave[] = [];
			let currentX = 0;
			
			// Create multiple staves for each measure
			for (let i = 0; i < measuresCount; i++) {
				// Setup Y position based on staff type
				const staffY = voice.staff === StaffEnum.Treble ? 20 : (treble ? 120 : 20);
				
				// Create a new stave for this measure
				const stave = new VF.Stave(currentX, staffY, measureWidth);
				
				// For the first measure, add clef and key signature
				if (i === 0) {
					stave.addClef(voice.staff === StaffEnum.Treble ? 'treble' : 'bass')
					     .addTimeSignature('4/4')
					     .addKeySignature(data.key);
				}
				
				// Set context and draw the stave
				stave.setContext(context).draw();
				
				// Add to our collection of staves
				staves.push(stave);
				
				// Move X position for next stave
				currentX += measureWidth;
			}
			
			// Split the stack into measures of 4 beats each
			let currentMeasureNotes: VFNote[] = [];
			let currentBeats = 0;
			let currentMeasureIndex = 0;
			let allMeasureNotes: VFNote[][] = Array(measuresCount).fill(0).map(() => []);
			
			voice.stack.forEach((stackedNote, i) => {
				const noteDuration = beatMap[stackedNote.duration as keyof BeatMap] || 0;
				
				// If adding this note would exceed 4 beats, move to next measure
				if (currentBeats + noteDuration > 4) {
					currentMeasureIndex++;
					currentBeats = 0;
				}
				
				// Ensure we don't exceed the measure count
				if (currentMeasureIndex >= measuresCount) {
					currentMeasureIndex = measuresCount - 1;
				}
				
				// Get the current stave
				const stave = staves[currentMeasureIndex];
				
				// Create the note
				let keys;
				if (stackedNote.isRest) {
					// For rests, use standard positioning based on duration and clef
					const restPosition = getRestPosition(stackedNote.duration, stave.getClef());
					keys = [restPosition];
				} else {
					// For regular notes, use the provided pitch
					keys = stackedNote.notes.map((note) => 
						`${note.name}/${note.octave + (data._8va ? 0 : 0)}`
					);
				}
				
				const staveNote = new VF.StaveNote({
					keys,
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
				
				// Add note to the appropriate measure's notes
				allMeasureNotes[currentMeasureIndex].push(staveNote);
				currentBeats += noteDuration;
			});
			
			// Create a VexFlow Voice for each measure and render it
			allMeasureNotes.forEach((measureNotes, measureIndex) => {
				if (measureNotes.length === 0) return;
				
				const vfVoice = new VF.Voice({ num_beats: 4, beat_value: 4 })
					.addTickables(measureNotes);
					
				VF.Accidental.applyAccidentals([vfVoice], data.key);
				
				// Format and draw the notes for this measure
				formatter.joinVoices([vfVoice]);
				formatter.formatToStave([vfVoice], staves[measureIndex]);
				vfVoice.draw(context, staves[measureIndex]);
			});
		});
		
		// Handle chord notation in a similar way, rendering for each measure
		if (!hideChords && data.voices.length > 0) {
			// Find the top stave for each measure (for chord notation)
			const topStaves: Stave[] = [];
			
			let currentX = 0;
			for (let i = 0; i < measuresCount; i++) {
				// Create temporary staves just for positioning the chord names
				const staffY = treble ? 20 : (bass ? 20 : 20);
				const stave = new VF.Stave(currentX, staffY, measureWidth);
				
				if (i === 0) {
					stave.addClef(treble ? 'treble' : 'bass')
					     .addTimeSignature('4/4')
					     .addKeySignature(data.key);
				}
				
				// CRITICAL: Attach the context to the stave - this was missing and caused the NoContext error
				stave.setContext(context);
				
				// We don't need to draw these staves since they're just for positioning,
				// but they MUST have a context set
				
				topStaves.push(stave);
				currentX += measureWidth;
			}
			
			// Split chord notes by measure
			let currentMeasureTextNotes: VFNote[] = [];
			let currentBeats = 0;
			let currentMeasureIndex = 0;
			let allMeasureTextNotes: VFNote[][] = Array(measuresCount).fill(0).map(() => []);
			
			// Create text notes for chords
			const textNotes = data.voices[0].stack.map((stackedNotes) => {
				// Only create text notes for notes with chord names
				if (!stackedNotes.chordName) {
					return null; // Skip notes without chord names
				}
				
				const chord = Chord.get(stackedNotes.chordName);
				if (!chord.tonic) return null;
		
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
		
				// Create the text note with a reference to the first stave (will update later)
				const textNote = new VF.TextNote({
					text,
					superscript,
					font: { family: 'FreeSerif' },
					duration: stackedNotes.duration,
				})
					.setJustification(VF.TextNote.Justification.CENTER)
					.setLine(-1)
					.setStave(topStaves[0]); // Default to first stave, will update later
					
				return textNote;
			}).filter(Boolean) as VFNote[]; // Remove null entries
			
			// If we have no chord text notes, skip the rest of the processing
			if (textNotes.length === 0) {
				// No chord names to render
				return;
			}
			
			// Split the text notes into measures
			textNotes.forEach(textNote => {
				// Access the duration without using the protected property directly
				// Use type assertion to access internal properties safely
				const textNoteObj = textNote as any;
				const duration = textNoteObj.duration || 'q'; // Default to quarter note
				const noteDuration = beatMap[duration as keyof BeatMap] || 0;
				
				// If adding this note would exceed 4 beats, move to next measure
				if (currentBeats + noteDuration > 4) {
					currentMeasureIndex++;
					currentBeats = 0;
				}
				
				// Ensure we don't exceed the measure count
				if (currentMeasureIndex >= measuresCount) {
					currentMeasureIndex = measuresCount - 1;
				}
				
				// Update the stave for this text note to the appropriate measure's stave
				textNote.setStave(topStaves[currentMeasureIndex]);
				
				// Add to the appropriate measure's notes
				allMeasureTextNotes[currentMeasureIndex].push(textNote);
				currentBeats += noteDuration;
			});
			
			// Create and draw voices for chord text notes, one for each measure
			allMeasureTextNotes.forEach((measureNotes, measureIndex) => {
				if (measureNotes.length === 0) return;
				
				const textVoice = new VF.Voice({ num_beats: 4, beat_value: 4 })
					.addTickables(measureNotes);
					
				// Format and draw
				formatter.joinVoices([textVoice]);
				formatter.formatToStave([textVoice], topStaves[measureIndex]);
				textVoice.draw(context, topStaves[measureIndex]);
			});
		}

		context.closeGroup();
		allNotesGroup.classList.add('music-notation-notes');
	}, [data, multiPartCardIndex, allNotesClassName, highlightClassName, hideChords]);

	return <div className='svg-dark-mode' ref={divRef} id='output'></div>;
};

