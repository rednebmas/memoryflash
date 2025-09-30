import React, { useEffect, useMemo, useRef } from 'react';
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
	StaveTie,
} from 'vexflow';
import { majorKey, minorKey } from '@tonaljs/key';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { calcBars } from 'MemoryFlashCore/src/lib/calcBars';
import { durationBeats } from 'MemoryFlashCore/src/lib/measure';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Chord } from 'tonal';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { buildScoreTimeline } from 'MemoryFlashCore/src/lib/scoreTimeline';

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
	StaveTie,
};

const BAR_WIDTH = 300;
const BEATS_PER_MEASURE = 4;
const RENDER_PADDING = 2;
const STAFF_TOP_OFFSET = 20;
const STAFF_GAP = 100;
const NOTE_AREA_LEFT_PADDING = 26;
const FIRST_MEASURE_MIN_LEFT_PADDING = 70;
const NOTE_AREA_RIGHT_PADDING = 26;
const SINGLE_STAFF_HEIGHT = 160;
const DOUBLE_STAFF_MIN_HEIGHT = 220;
const STAFF_BOTTOM_PADDING = 20;
const NOTE_SHADOW_BLUR = 2;
const NOTE_STYLE_MAP: Record<string, { light: string; dark: string }> = {
	highlight: { light: '#22c55e', dark: '#7e22ce' },
	answered: { light: '#22c55e', dark: '#7e22ce' },
};

const applyNoteStyle = (note: StaveNote, color: string) => {
	note.setStyle({
		shadowBlur: NOTE_SHADOW_BLUR,
		shadowColor: color,
		fillStyle: color,
		strokeStyle: color,
	});
};

const resolveNoteColor = (className: string | undefined, isDark: boolean) => {
	if (!className) return null;
	const classes = className
		.split(/\s+/)
		.map((c) => c.trim())
		.filter(Boolean);
	for (const cls of classes) {
		const entry = NOTE_STYLE_MAP[cls];
		if (entry) return isDark ? entry.dark : entry.light;
	}
	return null;
};

interface MusicNotationProps {
	data: MultiSheetQuestion;
	highlightClassName?: string;
	allNotesClassName?: string;
	hideChords?: boolean;
}

type IndexedSn = { sn: Voice['stack'][0]; idx: number };

type StaffRenderData = {
	stave: Stave;
	notes: StaveNote[];
	beams: Beam[];
	tieSpecs: Array<{
		first: StaveNote;
		last: StaveNote;
		firstIndices: number[];
		lastIndices: number[];
	}>;
	textVoice: VFVoice | null;
	voice: VFVoice | null;
};

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
	const timeline = useMemo(() => buildScoreTimeline(data), [data]);

	useEffect(() => {
		const div = divRef.current;
		if (!div) return;
		div.innerHTML = '';

		const prefersDark =
			typeof window !== 'undefined' &&
			(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
		const isDark = document.documentElement.classList.contains('dark') || prefersDark;
		const highlightColor = resolveNoteColor(highlightClassName, isDark);
		const baseNoteColor = resolveNoteColor(allNotesClassName, isDark);

		const bars = calcBars(data);
		const width = BAR_WIDTH * bars;
		const trebleOn = data.voices.some((v) => v.staff === StaffEnum.Treble);
		const bassOn = data.voices.some((v) => v.staff === StaffEnum.Bass);
		const initialHeight =
			trebleOn && bassOn ? STAFF_GAP + SINGLE_STAFF_HEIGHT * 2 : SINGLE_STAFF_HEIGHT;

		const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
		renderer.resize(width + RENDER_PADDING, initialHeight);
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

			const buildStaff = (staffType: StaffEnum, y: number): StaffRenderData => {
				const stave = new VF.Stave(x, y, BAR_WIDTH);
				if (isFirstBar) {
					stave
						.addClef(staffType === StaffEnum.Treble ? 'treble' : 'bass')
						.addTimeSignature('4/4')
						.addKeySignature(data.key);
				}
				if (isFirstBar) {
					const minStart = x + FIRST_MEASURE_MIN_LEFT_PADDING;
					if (stave.getNoteStartX() < minStart) {
						stave.setNoteStartX(minStart);
					}
				} else {
					stave.setNoteStartX(x + NOTE_AREA_LEFT_PADDING);
				}
				stave.setContext(ctx).draw();

				const vIdx = data.voices.findIndex((v) => v.staff === staffType);
				const stack = vIdx >= 0 ? measuresByVoice[vIdx][bar] || [] : [];
				let beat = 0;
				const notes: StaveNote[] = [];
				const tieSpecs: StaffRenderData['tieSpecs'] = [];
				let pendingTie: { note: StaveNote; indices: number[] } | null = null;

				stack.forEach(({ sn }) => {
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
					const isHighlighted =
						Boolean(highlightClassName) && beat < timeline.beats[multiPartCardIndex];
					if (allNotesClassName) note.addClass(allNotesClassName);
					if (isHighlighted && highlightClassName) note.addClass(highlightClassName);

					if (!isRest) {
						const noteColor = isHighlighted
							? (highlightColor ?? baseNoteColor)
							: baseNoteColor;
						if (noteColor) applyNoteStyle(note, noteColor);
					}

					if (!isRest) {
						const fromPrevious = sn.tie?.fromPrevious;
						if (fromPrevious && fromPrevious.length && pendingTie) {
							tieSpecs.push({
								first: pendingTie.note,
								last: note,
								firstIndices: [...pendingTie.indices],
								lastIndices: [...fromPrevious],
							});
						}
						const toNext = sn.tie?.toNext;
						pendingTie =
							toNext && toNext.length ? { note, indices: [...toNext] } : null;
					} else {
						pendingTie = null;
					}

					notes.push(note);
					beat += durationBeats[sn.duration];
				});

				const beams = VF.Beam.generateBeams(notes);

				let textVoice: VFVoice | null = null;
				if (!hideChords && staffType === StaffEnum.Treble) {
					const textNotes = (chordMeasures?.[bar] || []).map(({ sn }) => {
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
						textVoice = new VF.Voice({
							num_beats: BEATS_PER_MEASURE,
							beat_value: 4,
						})
							.setStrict(false)
							.addTickables(textNotes);

						const textFormatter = new VF.Formatter();
						textFormatter.joinVoices([textVoice]);
						textFormatter.formatToStave([textVoice], stave);
					}
				}

				return { stave, notes, beams, tieSpecs, textVoice, voice: null };
			};

			const staffEntries: StaffRenderData[] = [];
			const trebleY = STAFF_TOP_OFFSET;
			if (trebleOn) staffEntries.push(buildStaff(StaffEnum.Treble, trebleY));
			if (bassOn) {
				const bassY = trebleOn ? trebleY + STAFF_GAP : STAFF_TOP_OFFSET;
				staffEntries.push(buildStaff(StaffEnum.Bass, bassY));
			}

			const voices: VFVoice[] = [];
			staffEntries.forEach((entry) => {
				if (!entry.notes.length) return;
				entry.voice = new VF.Voice({
					num_beats: BEATS_PER_MEASURE,
					beat_value: 4,
				})
					.setStrict(false)
					.addTickables(entry.notes);
				voices.push(entry.voice);
			});

			if (voices.length) {
				const formatter = new VF.Formatter();
				if (voices.length > 1) {
					formatter.joinVoices(voices);
				}
				const availableWidths = staffEntries
					.filter((entry): entry is StaffRenderData & { voice: VFVoice } =>
						Boolean(entry.voice),
					)
					.map((entry) => {
						const leftOffset = entry.stave.getNoteStartX() - x;
						return BAR_WIDTH - leftOffset - NOTE_AREA_RIGHT_PADDING;
					});
				const availableWidth = availableWidths.length
					? Math.max(Math.min(...availableWidths), 0)
					: BAR_WIDTH - NOTE_AREA_LEFT_PADDING - NOTE_AREA_RIGHT_PADDING;
				formatter.format(voices, availableWidth);

				staffEntries.forEach((entry) => {
					entry.voice?.draw(ctx, entry.stave);
					entry.beams.forEach((b) => b.setContext(ctx).draw());
					entry.tieSpecs.forEach((spec) =>
						new VF.StaveTie({
							first_note: spec.first,
							last_note: spec.last,
							first_indices: spec.firstIndices,
							last_indices: spec.lastIndices,
						})
							.setContext(ctx)
							.draw(),
					);
					entry.textVoice?.draw(ctx, entry.stave);
				});
			}

			staffEntries.forEach((entry) => {
				new VF.Barline(VF.Barline.type.SINGLE)
					.setContext(ctx)
					.setX(x + BAR_WIDTH)
					.draw(entry.stave);
			});
		}

		const svg = div.querySelector<SVGSVGElement>('svg');
		if (svg) {
			const bbox = svg.getBBox();
			const minHeight = trebleOn && bassOn ? DOUBLE_STAFF_MIN_HEIGHT : SINGLE_STAFF_HEIGHT;
			const desiredHeight = Math.max(
				Math.ceil(bbox.y + bbox.height + STAFF_BOTTOM_PADDING),
				minHeight,
			);
			svg.setAttribute('height', `${desiredHeight}`);
			svg.setAttribute('viewBox', `0 0 ${width + RENDER_PADDING} ${desiredHeight}`);
			svg.style.height = `${desiredHeight}px`;
			div.style.height = `${desiredHeight}px`;
		}
	}, [data, multiPartCardIndex, allNotesClassName, highlightClassName, hideChords]);

	return <div className="svg-dark-mode" ref={divRef} />;
};
