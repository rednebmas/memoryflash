import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NotationInputScreen } from '../src/screens/NotationInputScreen';
import '../src/index.css';
import { renderApp } from './renderApp';

renderApp(
	<BrowserRouter initialEntries={['/study/deck1/edit/card1']}>
		<NotationInputScreen />
	</BrowserRouter>,
);
