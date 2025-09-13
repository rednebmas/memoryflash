import React, { useEffect, useState } from 'react';
import { Layout, Button } from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { questionsForAllMajorKeys } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
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
	ScoreEditor,
} from '../components/notation';
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
	const { isLoading: isUpdating, error: updateError } = useNetworkState('updateCard');
	const { isLoading: isAdding, error: addError } = useNetworkState('addCardsToDeck');
	useEffect(() => {
		if (card && card.type === CardTypeEnum.MultiSheet) {
			const text = card.question.presentationModes?.find((p) => p.id === 'Text Prompt');
			const idx = majorKeys.indexOf(card.question.key);
			setSettings((prev) => ({
				...prev,
				keySig: card.question.key,
				selected: majorKeys.map((_, i) => i === idx),
				cardType: text ? 'Text Prompt' : 'Sheet Music',
				textPrompt: text?.text || '',
				// If editing a Text Prompt card, default to previewing the text prompt
				preview: !!text,
			}));
		}
	}, [card]);
	const previewsAll = questionsForAllMajorKeys(question, settings.lowest, settings.highest);
	const previews = previewsAll.filter((_, i) => settings.selected[i]);

	const handleAdd = () => {
		if (deckId) {
			if (!complete) return;
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
		setResetCount((c) => c + 1);
	};

	const error = updateError || addError;

	return (
		<Layout subtitle="Notation Input">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div>
					<NotationSettings settings={settings} onChange={setSettings} />
				</div>
				<div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
					<ScoreEditor
						keySig={settings.keySig}
						resetSignal={resetCount}
						onChange={(q: MultiSheetQuestion, full: boolean) => {
							setQuestion(q);
							setComplete(full);
						}}
					/>
					<NotationPreviewList
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
			<BasicErrorCard error={error} />
		</Layout>
	);
};
