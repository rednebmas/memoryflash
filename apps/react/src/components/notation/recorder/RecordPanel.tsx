import React, { useState } from 'react';
import { quantizeToBars } from 'MemoryFlashCore/src/lib/recording/quantize';
import {
	Bar,
	barsToQuestion,
	clearBar,
	deleteBar,
	insertBar,
	questionToBars,
	replaceBars,
	setBar,
} from 'MemoryFlashCore/src/lib/recording/bars';
import { useScoreEditor } from '../ScoreEditor';
import { Button } from '../../ui/Button';
import { BarStrip } from './BarStrip';
import { BarHandEntry } from './BarHandEntry';
import { RecordControls } from './RecordControls';
import { useMidiRecording } from './useMidiRecording';

const STATUS_TEXT = {
	idle: '',
	'count-in': 'Count-in… start on the next downbeat',
	recording: 'Recording — press Stop when done',
};

export const RecordPanel: React.FC<{ keySig: string; beatsPerBar: number }> = ({
	keySig,
	beatsPerBar,
}) => {
	const { question, replaceQuestion } = useScoreEditor();
	const [take, setTake] = useState({ bpm: 80, stepsPerBeat: 2 });
	const [selected, setSelected] = useState(0);
	const [editing, setEditing] = useState(false);
	const recording = useMidiRecording(take.bpm, beatsPerBar);
	const bars = questionToBars(question);
	const commit = (next: Bar[]) => replaceQuestion(barsToQuestion(next, keySig, beatsPerBar));

	const stop = () => {
		const result = recording.stop();
		if (!result) return;
		const opts = { ...result, ...take, beatsPerBar, key: keySig, firstBar: 0 };
		commit(replaceBars(bars, selected, quantizeToBars(result.notes, opts)));
	};

	if (editing) {
		const done = (bar: Bar) => {
			commit(setBar(bars, selected, bar));
			setEditing(false);
		};
		const props = { keySig, beatsPerBar, barNumber: selected + 1 };
		return <BarHandEntry {...props} onDone={done} onCancel={() => setEditing(false)} />;
	}

	const idle = recording.status === 'idle';
	const onBar = selected < bars.length;
	return (
		<div className="space-y-3">
			<RecordControls {...take} onChange={(c) => setTake({ ...take, ...c })} />
			<BarStrip count={bars.length} selected={selected} onSelect={setSelected} />
			<div className="flex flex-wrap gap-2">
				{idle ? (
					<Button onClick={recording.start}>Record from bar {selected + 1}</Button>
				) : (
					<Button variant="danger" onClick={stop}>
						Stop
					</Button>
				)}
				<Button variant="outline" disabled={!idle} onClick={() => setEditing(true)}>
					Enter bar {selected + 1} by hand
				</Button>
				<Button
					variant="outline"
					disabled={!idle || !onBar}
					onClick={() => commit(clearBar(bars, selected, beatsPerBar))}
				>
					Clear
				</Button>
				<Button
					variant="outline"
					disabled={!idle || !onBar}
					onClick={() => commit(deleteBar(bars, selected))}
				>
					Delete
				</Button>
				<Button
					variant="outline"
					disabled={!idle || !onBar}
					onClick={() => commit(insertBar(bars, selected, beatsPerBar))}
				>
					Insert before
				</Button>
			</div>
			<p className="caption">{STATUS_TEXT[recording.status]}</p>
		</div>
	);
};
