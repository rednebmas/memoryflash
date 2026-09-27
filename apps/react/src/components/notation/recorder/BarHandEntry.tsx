import React from 'react';
import { Bar, questionToBars } from 'MemoryFlashCore/src/lib/recording/bars';
import { ScoreEditor, ScoreEditorProvider } from '../ScoreEditor';
import { ScoreToolbar } from '../ScoreToolbar';
import { Button } from '../../ui/Button';

interface BarHandEntryProps {
	barNumber: number;
	keySig: string;
	beatsPerBar: number;
	onDone: (bar: Bar) => void;
	onCancel: () => void;
}

export const BarHandEntry: React.FC<BarHandEntryProps> = ({
	barNumber,
	keySig,
	beatsPerBar,
	onDone,
	onCancel,
}) => (
	<ScoreEditorProvider
		keySig={keySig}
		resetSignal={0}
		beatsPerBar={beatsPerBar}
		onChange={(question, full) => full && onDone(questionToBars(question)[0] ?? [])}
	>
		<div className="space-y-3 rounded-md border border-default p-3">
			<p className="text-sm font-medium">
				Enter bar {barNumber}: pick a duration, then play each note
			</p>
			<ScoreToolbar />
			<ScoreEditor />
			<Button variant="outline" onClick={onCancel}>
				Cancel
			</Button>
		</div>
	</ScoreEditorProvider>
);
