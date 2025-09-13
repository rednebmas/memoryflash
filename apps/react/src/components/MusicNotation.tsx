import React, { useEffect, useRef } from 'react';
import {
	Stave,
	StaveNote,
	TextNote,
	Voice as VFVoice,
	Renderer,
	Formatter,
	Accidental,
	Barline,
	Beam,
	Dot,
} from 'vexflow';
import { majorKey, minorKey } from '@tonaljs/key';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { calcBars } from 'MemoryFlashCore/src/lib/calcBars';
import { durationBeats } from 'MemoryFlashCore/src/lib/measure';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Chord } from 'tonal';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

const VF = {
	Stave,
	StaveNote,
	TextNote,
	Voice: VFVoice,
	Renderer,
	Formatter,
	Accidental,
	Barline,
	Beam,
	Dot,
};

const BAR_WIDTH = 300;
const BEATS_PER_MEASURE = 4;

interface MusicNotationProps {
	data: MultiSheetQuestion;
	highlightClassName?: string;
	allNotesClassName?: string;
	hideChords?: boolean;
}

type IndexedSn = { sn: Voice['stack'][0]; idx: number };

// Split a flat stack into measures of up to BEATS_PER_MEASURE beats
function splitMeasures(indexed: IndexedSn[]) {
	const measures: IndexedSn[][] = [];
	let current: IndexedSn[] = [];
	let sum = 0;
	for (const item of indexed) {
		const dur = durationBeats[item.sn.duration];
		if (sum + dur > BEATS_PER_MEASURE) {
			measures.push(current);
			current = [];
			sum = 0;
		}
		current.push(item);
		sum += dur;
	}
	measures.push(current);
	return measures;
}

export const MusicNotation: React.FC<MusicNotationProps> = ({
	data,
	allNotesClassName,
	highlightClassName,
	hideChords,
}) => {
	const divRef = useRef<HTMLDivElement>(null);
	const multiPartCardIndex = useAppSelector((s) => s.scheduler.multiPartCardIndex);

	useEffect(() => {
		const div = divRef.current;
		if (!div) return;
		div.innerHTML = '';

		const bars = calcBars(data);
		const width = BAR_WIDTH * bars;
		const trebleOn = data.voices.some((v) => v.staff === StaffEnum.Treble);
		const bassOn = data.voices.some((v) => v.staff === StaffEnum.Bass);
		const height = trebleOn && bassOn ? 250 : 160;

		const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
		renderer.resize(width + 2, height);
		const ctx = renderer.getContext();

		// Prepare per-voice, per-measure stacks
		const voiceIndexed = data.voices.map((v) => v.stack.map((sn, idx) => ({ sn, idx })));
		const measuresByVoice = voiceIndexed.map(splitMeasures);
		const chordMeasures = measuresByVoice[0];

		const diatonic = new Set(
			data.key.endsWith('m')
				? minorKey(data.key.slice(0, -1)).natural.scale
				: majorKey(data.key).scale,
		);

		for (let bar = 0; bar < bars; bar++) {
			const x = bar * BAR_WIDTH;
			const isFirstBar = bar === 0;

			const drawStaff = (staffType: StaffEnum, y: number) => {
				const stave = new VF.Stave(x, y, BAR_WIDTH);
				if (isFirstBar) {
					stave
						.addClef(staffType === StaffEnum.Treble ? 'treble' : 'bass')
						.addTimeSignature('4/4')
						.addKeySignature(data.key);
				}
				stave.setContext(ctx).draw();

				// Notes/rests for this bar & voice
				const vIdx = data.voices.findIndex((v) => v.staff === staffType);
				const stack = measuresByVoice[vIdx][bar] || [];
				const notes = stack.map(({ sn, idx }) => {
					const isRest = sn.rest || sn.notes.length === 0;
					const restKey = staffType === StaffEnum.Bass ? 'd/3' : 'b/4';
					const keys = isRest
						? [restKey]
						: sn.notes.map((n) => `${n.name.charAt(0)}/${n.octave}`);
					const dur = (isRest ? `${sn.duration}r` : sn.duration) as string;
					const note = new VF.StaveNote({
						keys,
						duration: dur,
						clef: stave.getClef(),
						auto_stem: true,
						align_center: isRest && sn.duration === 'w',
					}).setStave(stave);

					if (!isRest) {
						sn.notes.forEach((n, i) => {
							const accidental = n.name.slice(1);
							if (!diatonic.has(n.name)) {
								let toAdd = accidental;
								if (!toAdd) toAdd = 'n';
								note.addModifier(new VF.Accidental(toAdd), i);
							}
						});
					}

					if (sn.duration.includes('d')) VF.Dot.buildAndAttach([note], { all: true });
					if (allNotesClassName) note.addClass(allNotesClassName);
					if (idx < multiPartCardIndex && highlightClassName)
						note.addClass(highlightClassName);

					return note;
				});
				const beams = VF.Beam.generateBeams(notes);

				if (notes.length) {
					VF.Formatter.FormatAndDraw(ctx, stave, notes);
					beams.forEach((b) => b.setContext(ctx).draw());
				}

				// --- CHORD TEXT (fixed): wrap in a Voice, format, then draw ---
				if (!hideChords && staffType === StaffEnum.Treble) {
					const textNotes = (chordMeasures[bar] || []).map(({ sn }) => {
						if (!sn.chordName) {
							return new VF.TextNote({ text: '', duration: sn.duration }).setStave(
								stave,
							);
						}
						const c = Chord.get(sn.chordName);
						let sym = c.tonic ? c.tonic.replace('b', '♭').replace('#', '♯') : '';
						let sup = '';
						switch (c.type) {
							case 'minor seventh':
								sym += 'm';
								sup = '7';
								break;
							case 'dominant seventh':
								sup = '7';
								break;
							case 'major seventh':
								sym = '∆7';
								break;
							default:
								sym = c.symbol || sym;
						}
						return new VF.TextNote({
							text: sym,
							superscript: sup,
							duration: sn.duration,
							font: { family: 'FreeSerif' },
						})
							.setJustification(VF.TextNote.Justification.CENTER)
							.setLine(-1)
							.setStave(stave);
					});

					if (textNotes.length) {
						const textVoice = new VF.Voice({
							num_beats: BEATS_PER_MEASURE,
							beat_value: 4,
						}).addTickables(textNotes);

						const textFormatter = new VF.Formatter();
						textFormatter.joinVoices([textVoice]);
						textFormatter.formatToStave([textVoice], stave);
						textVoice.draw(ctx, stave);
					}
				}

				// Draw barline at end of this measure
				new VF.Barline(VF.Barline.type.SINGLE)
					.setContext(ctx)
					.setX(x + BAR_WIDTH)
					.draw(stave);
			};

			if (trebleOn) drawStaff(StaffEnum.Treble, 20);
			if (bassOn) drawStaff(StaffEnum.Bass, trebleOn ? 120 : 20);
		}
	}, [data, multiPartCardIndex, allNotesClassName, highlightClassName, hideChords]);

	return <div className="svg-dark-mode" ref={divRef} />;
};
