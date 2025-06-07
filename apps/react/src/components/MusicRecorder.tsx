import React, { useEffect, useState } from 'react';
import { MusicNotation } from './MusicNotation';
import { MultiSheetQuestion, StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

const durations: StackedNotes['duration'][] = ['w', 'h', 'q', '8', '16', '32', '64'];

export const MusicRecorder: React.FC = () => {
	const [key, setKey] = useState('C');
	const [bars, setBars] = useState(1);
	const [duration, setDuration] = useState<StackedNotes['duration']>('q');
	const [data, setData] = useState<MultiSheetQuestion>({
		key: 'C',
		voices: [{ staff: StaffEnum.Treble, stack: [] }],
	});

	useEffect(() => {
		setData((d) => ({ ...d, key }));
	}, [key]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const map: Record<string, string> = {
				a: 'A',
				b: 'B',
				c: 'C',
				d: 'D',
				e: 'E',
				f: 'F',
				g: 'G',
			};
			const note = map[e.key.toLowerCase()];
			if (!note) return;
			setData((d) => {
				const voice = d.voices[0];
				const stack = [...voice.stack, { notes: [{ name: note, octave: 4 }], duration }];
				return { ...d, voices: [{ ...voice, stack }] };
			});
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [duration]);

	return (
		<div className="space-y-4">
			<div className="flex gap-4">
				<label className="flex flex-col">
					Key
					<input
						value={key}
						onChange={(e) => setKey(e.target.value)}
						className="border rounded p-1"
					/>
				</label>
				<label className="flex flex-col">
					Bars
					<input
						type="number"
						value={bars}
						onChange={(e) => setBars(parseInt(e.target.value) || 0)}
						className="border rounded p-1 w-16"
					/>
				</label>
				<label className="flex flex-col">
					Note Duration
					<select
						value={duration}
						onChange={(e) => setDuration(e.target.value as StackedNotes['duration'])}
						className="border rounded p-1"
					>
						{durations.map((d) => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
				</label>
			</div>
			<MusicNotation data={data} />
		</div>
	);
};
