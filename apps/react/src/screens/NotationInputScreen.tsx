import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Button } from '../components';
import { BasicErrorCard } from '../components/feedback/ErrorCard';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { questionsForAllMajorKeys } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { addCardsToDeck } from 'MemoryFlashCore/src/redux/actions/add-cards-to-deck';
import { updateCard } from 'MemoryFlashCore/src/redux/actions/update-card-action';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { AnswerType, CardTypeEnum, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { useDeckIdPath } from './useDeckIdPath';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useParams } from 'react-router-dom';
import {
	NotationSettings,
	NotationSettingsState,
	defaultSettings,
	NotationPreviewList,
} from '../components/notation';
import { ScoreEditorProvider } from '../components/notation/ScoreEditor';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

export const NotationInputScreen = () => {
	const [settings, setSettings] = useState<NotationSettingsState>(defaultSettings);
	const [resetCount, setResetCount] = useState(0);
	const [question, setQuestion] = useState<MultiSheetQuestion>({
		key: settings.keySig,
		voices: [{ staff: StaffEnum.Treble, stack: [{ notes: [], duration: 'w', rest: true }] }],
	});
	const [complete, setComplete] = useState(false);
	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();
	const { cardId } = useParams();
	const card = useAppSelector((state) => (cardId ? state.cards.entities[cardId] : undefined));
	const initialQuestion = card?.type === CardTypeEnum.MultiSheet ? card.question : undefined;
	const { isLoading: isUpdating, error: updateError } = useNetworkState('updateCard');
	const { isLoading: isAdding, error: addError } = useNetworkState('addCardsToDeck');
	useEffect(() => {
		if (card && card.type === CardTypeEnum.MultiSheet) {
			const text = card.question.presentationModes?.find((p) => p.id === 'Text Prompt');
			const idx = majorKeys.indexOf(card.question.key);
			const isChordMemory = card.answer.type === AnswerType.ChordMemory;
			const chordMemoryAnswer = isChordMemory ? (card.answer as ChordMemoryAnswer) : null;
			setSettings((prev) => ({
				...prev,
				keySig: card.question.key,
				selected: majorKeys.map((_, i) => i === idx),
				cardType: isChordMemory ? 'Chord Memory' : text ? 'Text Prompt' : 'Sheet Music',
				textPrompt: text?.text || '',
				// If editing a Text Prompt card, default to previewing the text prompt
				preview: !!text,
				chordMemory: chordMemoryAnswer
					? {
							progression: chordMemoryAnswer.chords.map((c) => c.chordName).join(' '),
							chordTones: chordMemoryAnswer.chords,
							textPrompt: text?.text || '',
						}
					: prev.chordMemory,
			}));
			setQuestion(card.question);
			setComplete(true);
		}
	}, [card]);
	const previewsAll = questionsForAllMajorKeys(question, settings.lowest, settings.highest);
	const previews = previewsAll.filter((_, i) => settings.selected[i]);
	const handleScoreChange = useCallback((q: MultiSheetQuestion, full: boolean) => {
		setQuestion(q);
		setComplete(full);
	}, []);

	const handleSettingsChange = (newSettings: NotationSettingsState) => {
		setSettings(newSettings);
		if (newSettings.cardType === 'Chord Memory') {
			setComplete(newSettings.chordMemory.chordTones.length > 0);
		}
	};

	const handleAdd = () => {
		if (!deckId || !complete) return;

		let toAdd = previews;
		if (settings.cardType === 'Text Prompt') {
			toAdd = previews.map((q) => ({
				...q,
				presentationModes: [{ id: 'Text Prompt', text: settings.textPrompt }],
			}));
			dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Text Prompt'));
			dispatch(addCardsToDeck(deckId, toAdd));
		} else if (settings.cardType === 'Chord Memory') {
			const text = settings.chordMemory.textPrompt || settings.chordMemory.progression;
			toAdd = previews.map((q) => ({
				...q,
				presentationModes: [{ id: 'Text Prompt', text }],
			}));
			dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Text Prompt'));
			dispatch(
				addCardsToDeck(deckId, toAdd, {
					type: AnswerType.ChordMemory,
					chords: settings.chordMemory.chordTones,
				}),
			);
		} else {
			toAdd = previews.map((q) => ({
				...q,
				presentationModes: [{ id: 'Sheet Music' }],
			}));
			dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Sheet Music'));
			dispatch(addCardsToDeck(deckId, toAdd));
		}
	};

	const handleUpdate = () => {
		if (cardId && previews[0]) {
			dispatch(updateCard(cardId, previews[0], settings.cardType, settings.textPrompt));
		}
	};

	const handleReset = () => {
		setResetCount((c) => c + 1);
	};

	const error = updateError || addError;

	return (
		<Layout subtitle="Notation Input">
			<ScoreEditorProvider
				keySig={settings.keySig}
				resetSignal={resetCount}
				onChange={handleScoreChange}
				initialQuestion={initialQuestion}
			>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div>
						<NotationSettings settings={settings} onChange={handleSettingsChange} />
					</div>
					<div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
						<NotationPreviewList
							keySig={settings.keySig}
							previews={previews}
							cardType={settings.cardType}
							textPrompt={
								settings.cardType === 'Chord Memory'
									? settings.chordMemory.textPrompt ||
										settings.chordMemory.progression
									: settings.textPrompt
							}
							previewTextCard={settings.preview}
						/>
						<div className="w-full max-w-xs">
							<div className="grid grid-cols-2 gap-3">
								<Button onClick={handleReset} className="w-full">
									Reset
								</Button>
								<Button
									onClick={cardId ? handleUpdate : handleAdd}
									disabled={!cardId && !complete}
									loading={cardId ? isUpdating : isAdding}
									className="w-full"
								>
									{cardId ? 'Update Card' : 'Add Card'}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</ScoreEditorProvider>
			<BasicErrorCard error={error} />
		</Layout>
	);
};
