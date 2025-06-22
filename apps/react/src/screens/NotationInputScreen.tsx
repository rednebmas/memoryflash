import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Layout, Button } from '../components';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { questionsForAllMajorKeys } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { addCardsToDeck } from 'MemoryFlashCore/src/redux/actions/add-cards-to-deck';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { useDeckIdPath } from './useDeckIdPath';
import {
	NotationSettings,
	NotationSettingsState,
	defaultSettings,
	NotationPreviewList,
} from '../components/notation';

export const NotationInputScreen = () => {
	const [settings, setSettings] = useState<NotationSettingsState>(defaultSettings);
	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();

	const recorderRef = useRef(new MusicRecorder('q'));
	const midiNotes = useAppSelector(
		(state) => state.midi.notes.map((n) => n.number),
		shallowEqual,
	);

	useEffect(() => {
		recorderRef.current.updateDuration(settings.trebleDur, StaffEnum.Treble);
	}, [settings.trebleDur]);

	useEffect(() => {
		recorderRef.current.updateDuration(settings.bassDur, StaffEnum.Bass);
	}, [settings.bassDur]);

	useEffect(() => {
		recorderRef.current.addMidiNotes(midiNotes);
	}, [midiNotes]);

	const data = recorderRef.current.buildQuestion(settings.keySig);
	const previewsAll = questionsForAllMajorKeys(data, settings.lowest, settings.highest);
	const previews = previewsAll.filter((_, i) => settings.selected[i]);

	const handleAdd = () => {
		if (deckId) {
			let toAdd = previews;
			if (settings.cardType === 'Text Prompt') {
				toAdd = toAdd.map((q) => ({
					...q,
					presentationModes: [{ id: 'Text Prompt', text: settings.textPrompt }],
				}));
				dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Text Prompt'));
			}
			dispatch(addCardsToDeck(deckId, toAdd));
		}
	};

	return (
		<Layout subtitle="Notation Input" back="/">
			<NotationSettings onChange={setSettings} />
			<NotationPreviewList
				previews={previews}
				cardType={settings.cardType}
				textPrompt={settings.textPrompt}
				previewTextCard={settings.preview}
			/>
			<div className="pt-4 flex justify-center">
				<Button onClick={handleAdd}>Add Card</Button>
			</div>
		</Layout>
	);
};
