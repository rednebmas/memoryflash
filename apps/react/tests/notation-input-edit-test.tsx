import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NotationInputScreen } from '../src/screens/NotationInputScreen';
import '../src/index.css';
import { renderApp } from './renderApp';

renderApp(
	<MemoryRouter initialEntries={['/study/deck1/edit/card1']}>
		<Routes>
			<Route path="/study/:deckId/edit/:cardId" element={<NotationInputScreen />} />
		</Routes>
	</MemoryRouter>,
);
