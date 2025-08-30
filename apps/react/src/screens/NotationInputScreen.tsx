import React, { useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Layout, Button } from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { questionsForAllMajorKeys } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { addCardsToDeck } from 'MemoryFlashCore/src/redux/actions/add-cards-to-deck';
import { updateCard } from 'MemoryFlashCore/src/redux/actions/update-card-action';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { useDeckIdPath } from './useDeckIdPath';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useParams } from 'react-router-dom';
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
	const { cardId } = useParams();
	const card = useAppSelector((state) => (cardId ? state.cards.entities[cardId] : undefined));
	const { isLoading: isUpdating, error: updateError } = useNetworkState('updateCard');
	const { isLoading: isAdding, error: addError } = useNetworkState('addCardsToDeck');

	const recorderRef = useRef(new MusicRecorder('q', 'C4', 'q', defaultSettings.bars));
	const midiNotes = useAppSelector(
		(state) => state.midi.notes.map((n) => n.number),
		shallowEqual,
	);

	useEffect(() => {
		if (card && card.type === CardTypeEnum.MultiSheet) {
			setSettings((prev) => ({
				...prev,
				keySig: card.question.key,
			}));
		}
	}, [card]);

	useEffect(() => {
		recorderRef.current.updateDuration(settings.trebleDur, StaffEnum.Treble);
	}, [settings.trebleDur]);

	useEffect(() => {
		recorderRef.current.updateDuration(settings.bassDur, StaffEnum.Bass);
	}, [settings.bassDur]);

	useEffect(() => {
		recorderRef.current.setBars(settings.bars);
		recorderRef.current.reset();
	}, [settings.bars]);

	const prevMidiNotesRef = useRef<number[]>([]);

	const data = useMemo(() => {
		if (!shallowEqual(prevMidiNotesRef.current, midiNotes)) {
			recorderRef.current.addMidiNotes(midiNotes);
			prevMidiNotesRef.current = [...midiNotes]; // Copy to store content
		}
		return recorderRef.current.buildQuestion(settings.keySig);
	}, [midiNotes, settings.keySig]);
	const previewsAll = questionsForAllMajorKeys(data, settings.lowest, settings.highest);
	const previews = previewsAll.filter((_, i) => settings.selected[i]);

	const handleAdd = () => {
		if (deckId) {
			if (!recorderRef.current.hasFullMeasure()) return;
			let toAdd = previews;
			if (settings.cardType === 'Text Prompt') {
				toAdd = previews.map((q) => ({
					...q,
					presentationModes: [{ id: 'Text Prompt', text: settings.textPrompt }],
				}));
				dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Text Prompt'));
			} else {
				toAdd = previews.map((q) => ({
					...q,
					presentationModes: [{ id: 'Sheet Music' }],
				}));
				dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Sheet Music'));
			}
			dispatch(addCardsToDeck(deckId, toAdd));
		}
	};

	const handleUpdate = () => {
		if (cardId && previews[0]) {
			dispatch(updateCard(cardId, previews[0], settings.cardType, settings.textPrompt));
		}
	};

	const handleReset = () => {
		recorderRef.current.reset();
	};

	const error = updateError || addError;

	return (
		<Layout subtitle="Notation Input">
			<NotationSettings onChange={setSettings} />
			<NotationPreviewList
				previews={previews}
				cardType={settings.cardType}
				textPrompt={settings.textPrompt}
				previewTextCard={settings.preview}
			/>
			<BasicErrorCard error={error} />
			<div className="pt-4 flex justify-center gap-3">
				<Button onClick={handleReset}>Reset</Button>
				<Button
					onClick={cardId ? handleUpdate : handleAdd}
					disabled={!cardId && !recorderRef.current.hasFullMeasure()}
					loading={cardId ? isUpdating : isAdding}
				>
					{cardId ? 'Update Card' : 'Add Card'}
				</Button>
			</div>
		</Layout>
	);
};
