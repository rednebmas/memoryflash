import React from 'react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReduxState } from 'MemoryFlashCore/src/redux/store';
import { NotationInputScreen } from '../src/screens/NotationInputScreen';
import '../src/index.css';
import { renderApp } from './renderApp';

function getQueryParams() {
	const params = new URLSearchParams(window.location.search);
	const mode = params.get('mode') ?? 'screen';
	const deckId = params.get('deckId') ?? undefined;
	const cardId = params.get('cardId') ?? undefined;
	return { mode, deckId, cardId };
}

function getPreloadedState(deckId: string | undefined): Partial<ReduxState> | undefined {
	if (!deckId) return undefined;
	return {
		scheduler: { deck: deckId } as Partial<ReduxState['scheduler']>,
	};
}

const { mode, deckId, cardId } = getQueryParams();
const preloadedState = getPreloadedState(deckId);

if (mode === 'edit') {
	const editDeckId = deckId ?? 'deck1';
	const editCardId = cardId ?? 'card1';
	renderApp(
		<MemoryRouter initialEntries={[`/study/${editDeckId}/edit/${editCardId}`]}>
			<Routes>
				<Route path="/study/:deckId/edit/:cardId" element={<NotationInputScreen />} />
			</Routes>
		</MemoryRouter>,
		'root',
		preloadedState,
	);
} else {
	renderApp(
		<BrowserRouter>
			<NotationInputScreen />
		</BrowserRouter>,
		'root',
		preloadedState,
	);
}
