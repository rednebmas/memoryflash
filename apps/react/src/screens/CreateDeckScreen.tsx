import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components';
import { Button } from '../components/Button';
import { MidiInputsDropdown } from '../components/MidiInputsDropdown';
import Dropdown from '../components/Dropdown';
import SheetMusicEditor from '../components/SheetMusicEditor';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { createDeck } from 'MemoryFlashCore/src/redux/actions/create-deck-action';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { Midi } from 'tonal';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';

interface MiddleNoteControlsProps {
	middleNote: number;
	setMiddleNote: (value: number) => void;
}

interface KeySignatureControlsProps {
	keySignature: string;
	setKeySignature: (value: string) => void;
}

const KeySignatureControls: React.FC<KeySignatureControlsProps> = ({
	keySignature,
	setKeySignature,
}) => {
	const items = React.useMemo(
		() =>
			majorKeys.map((key) => ({
				label: key,
				onClick: () => {
					setKeySignature(key);
				},
			})),
		[setKeySignature],
	);

	return (
		<div className="mb-6">
			<label className="block mb-2">Key Signature</label>
			<Dropdown label={keySignature} items={items} />
		</div>
	);
};

// Component for controlling the middle note (bass/treble split)
const MiddleNoteControls: React.FC<MiddleNoteControlsProps> = ({ middleNote, setMiddleNote }) => {
	// Convert middleNote to note name (like "C4")
	const middleNoteName = Midi.midiToNoteName(middleNote);

	const handleMiddleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMiddleNote = parseInt(e.target.value);
		if (!isNaN(newMiddleNote) && newMiddleNote >= 0 && newMiddleNote <= 127) {
			setMiddleNote(newMiddleNote);
		}
	};

	// Function to increment/decrement the middle note
	const adjustMiddleNote = (amount: number) => {
		const newValue = middleNote + amount;
		if (newValue >= 0 && newValue <= 127) {
			setMiddleNote(newValue);
		}
	};

	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-2">
				<label>
					Middle Note (Treble/Bass split): {middleNoteName} ({middleNote})
				</label>
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm" onClick={() => adjustMiddleNote(-1)}>
						-
					</Button>
					<input
						type="number"
						value={middleNote}
						onChange={handleMiddleNoteChange}
						min="0"
						max="127"
					/>
					<Button variant="outline" size="sm" onClick={() => adjustMiddleNote(1)}>
						+
					</Button>
				</div>
			</div>
		</div>
	);
};

interface SaveDeckControlsProps {
	deckName: string;
	setDeckName: (value: string) => void;
	onSave: () => void;
	isCreating: boolean;
}

// Component for naming and saving the deck
const SaveDeckControls: React.FC<SaveDeckControlsProps> = ({
	deckName,
	setDeckName,
	onSave,
	isCreating,
}) => {
	return (
		<div>
			<div className="mb-6">
				<label htmlFor="deckName" className="mb-2 block">
					Deck Name
				</label>
				<input
					type="text"
					id="deckName"
					value={deckName}
					onChange={(e) => setDeckName(e.target.value)}
					placeholder="Enter deck name"
				/>
			</div>

			<div className="flex justify-end">
				<Button
					variant="primary"
					disabled={!deckName.trim() || isCreating}
					onClick={onSave}
				>
					{isCreating ? 'Creating...' : 'Create Deck'}
				</Button>
			</div>
		</div>
	);
};

export const CreateDeckScreen: React.FC = () => {
	const { courseId } = useParams<{ courseId: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const [deckName, setDeckName] = useState('');
	const [middleNote, setMiddleNote] = useState(60); // Middle C (C4) by default
	const [keySignature, setKeySignature] = useState('C'); // C major by default

	const { isLoading: isCreating } = useNetworkState('createDeck');
	const midiNotes = useAppSelector((state) => state.midi.notes);

	const handleSave = async () => {
		if (!courseId || !deckName.trim()) return;

			await dispatch(
				createDeck({
					courseId,
					name: deckName,
					section: 'Custom',
					sectionSubtitle: '',
				}),
			);
			navigate(`/course/${courseId}`);
	};

	return (
		<Layout subtitle="Create New Deck" back={`/course/${courseId}`}>
			<div className="space-y-8">
				<SaveDeckControls
					deckName={deckName}
					setDeckName={setDeckName}
					onSave={handleSave}
					isCreating={isCreating}
				/>

				<div className="mb-6">
					<div className="flex items-center justify-between mb-2">
						<label>MIDI Input</label>
						<MidiInputsDropdown />
					</div>
				</div>

				<KeySignatureControls
					keySignature={keySignature}
					setKeySignature={setKeySignature}
				/>

				<MiddleNoteControls middleNote={middleNote} setMiddleNote={setMiddleNote} />

				<SheetMusicEditor 
					keySignature={keySignature}
					middleNote={middleNote}
					midiNotes={midiNotes}
				/>
			</div>
		</Layout>
	);
};
