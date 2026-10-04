import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layout, Button } from '../components';
import { BasicErrorCard } from '../components/feedback/ErrorCard';
import { useToast } from '../components/feedback/Toast';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { questionsForAllMajorKeys, splitByKey } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { addCardsToDeck } from 'MemoryFlashCore/src/redux/actions/add-cards-to-deck';
import { prepareQuestion, updateCard } from 'MemoryFlashCore/src/redux/actions/update-card-action';
import { syncTransposedCopies } from 'MemoryFlashCore/src/redux/actions/sync-transposed-copies-action';
import { withChordNames } from 'MemoryFlashCore/src/lib/chordNames';
import { settingsFromCard } from '../components/notation/settingsFromCard';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { generatedCardsActions } from 'MemoryFlashCore/src/redux/slices/generatedCardsSlice';
import { generatedCardsPayloadSelector } from 'MemoryFlashCore/src/redux/selectors/generatedCardsSelector';
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
import { ScoreEditorProvider } from '../components/notation/ScoreEditor';
import { buildCardsToAdd, textPromptFor } from '../components/notation/buildCardsToAdd';
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
	const toast = useToast();
	const { deckId } = useDeckIdPath();
	const { cardId } = useParams();
	const card = useAppSelector((state) => (cardId ? state.cards.entities[cardId] : undefined));
	const generated = useAppSelector(generatedCardsPayloadSelector);
	const initialQuestion = card?.type === CardTypeEnum.MultiSheet ? card.question : undefined;
	const { isLoading: isUpdating, error: updateError } = useNetworkState('updateCard');
	const { isLoading: isAdding, error: addError } = useNetworkState('addCardsToDeck');
	const isAi = settings.cardType === 'Generate with AI';
	const prefilledId = useRef<string>();
	useEffect(() => {
		if (card && card.type === CardTypeEnum.MultiSheet && prefilledId.current !== card._id) {
			prefilledId.current = card._id;
			setSettings((prev) => settingsFromCard(card, prev));
			setQuestion(card.question);
			setComplete(true);
		}
	}, [card]);
	const named = withChordNames(question, settings.chordNames);
	const previewsAll = questionsForAllMajorKeys(named, settings.lowest, settings.highest);
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

	const toastAdded = (count: number) =>
		toast(count === 1 ? 'Card added' : `${count} cards added`);

	const addPreviews = (id: string, qs: MultiSheetQuestion[]) => {
		const { questions, answer, presentationMode } = buildCardsToAdd(settings, qs);
		dispatch(setPresentationMode(CardTypeEnum.MultiSheet, presentationMode));
		dispatch(addCardsToDeck(id, questions, answer, toastAdded));
	};

	const handleAdd = () => {
		if (!deckId) return;
		if (isAi) {
			dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Text Prompt'));
			dispatch(
				addCardsToDeck(deckId, generated.questions, generated.answers, (count) => {
					toastAdded(count);
					dispatch(generatedCardsActions.clear());
				}),
			);
			return;
		}
		if (complete) addPreviews(deckId, previews);
	};

	const handleUpdate = () => {
		if (!cardId || !deckId) return;
		const { answer } = buildCardsToAdd(settings, [named]);
		const text = textPromptFor(settings);
		if (settings.syncCopies) {
			dispatch(syncTransposedCopies(cardId, prepareQuestion(named, settings.cardType, text)));
		}
		dispatch(
			updateCard(cardId, named, settings.cardType, text, answer, () => toast('Card updated')),
		);
		const { others } = splitByKey(previews, question.key);
		if (others.length) addPreviews(deckId, others);
	};

	const handleReset = () => {
		setResetCount((c) => c + 1);
		setSettings((prev) => ({ ...prev, chordNames: [] }));
		if (isAi) dispatch(generatedCardsActions.clear());
	};

	const error = updateError || addError;
	const canAdd = isAi ? generated.questions.length > 0 : complete;
	const cardCount = isAi
		? generated.questions.length
		: complete
			? buildCardsToAdd(settings, previews).questions.length
			: 1;
	const addLabel = cardCount === 1 ? 'Add Card' : `Add ${cardCount} cards`;

	return (
		<Layout subtitle="Notation Input">
			<ScoreEditorProvider
				keySig={settings.keySig}
				resetSignal={resetCount}
				onChange={handleScoreChange}
				initialQuestion={initialQuestion}
				beatsPerBar={settings.beatsPerBar}
				paused={settings.inputMode === 'record'}
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
							textPrompt={settings.textPrompt}
							previewTextCard={settings.preview}
						/>
						<div className="w-full max-w-xs">
							<div className="grid grid-cols-2 gap-3">
								<Button onClick={handleReset} className="w-full">
									Reset
								</Button>
								<Button
									onClick={cardId ? handleUpdate : handleAdd}
									disabled={!cardId && !canAdd}
									loading={cardId ? isUpdating : isAdding}
									className="w-full"
								>
									{cardId ? 'Update Card' : addLabel}
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
