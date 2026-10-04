import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EditCardScreen } from '../src/screens/EditCardScreen';
import '../src/index.css';
import { renderApp } from './renderApp';

const entities = <T extends { _id: string }>(item: T) => ({
	ids: [item._id],
	entities: { [item._id]: item },
});

renderApp(
	<MemoryRouter initialEntries={['/study/deck1/edit/card1']}>
		<Routes>
			<Route path="/study/:deckId/edit/:cardId" element={<EditCardScreen />} />
		</Routes>
	</MemoryRouter>,
	'root',
	{
		auth: { user: { _id: 'user1' } },
		courses: entities({ _id: 'course1', userId: 'user1' }),
		decks: entities({ _id: 'deck1', courseId: 'course1' }),
	} as never,
);
