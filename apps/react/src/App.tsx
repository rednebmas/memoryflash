import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StudyScreen } from './components';
import { MidiToRedux } from './components/MidiToRedux';
import { AuthenticatedRoute } from './components/navigation/Routers';
import { CoursesScreen, NotationInputScreen } from './screens';
import { AllDeckCardsScreen } from './screens/AllDeckCardsScreen';
import { DecksScreen } from './screens/DecksScreen';
import { DeckPreviewScreen } from './screens/DeckPreviewScreen';
import { CoursePreviewScreen } from './screens/CoursePreviewScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { loadWebReudxStatePromise, store } from './utils/store';
import { useDarkMode } from './utils/useDarkMode';
import { DeckStatsScreen } from './screens/DeckStatsScreen/DeckStatsScreen';
import { AccountScreen } from './screens/AccountScreen/AccountScreen';
import { AttemptHistoryScreen } from './screens/AttemptHistoryScreen/AttemptHistoryScreen';

export default function App() {
	const forceUpdate = React.useState({})[1].bind(null, {});

	useDarkMode();
	useEffect(() => {
		loadWebReudxStatePromise.then(() => forceUpdate());
	}, []);

	if (!store) return null;

	return (
		<Provider store={store}>
			<MidiToRedux />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<AuthenticatedRoute screen={<CoursesScreen />} />} />
					<Route path="/auth/sign-up" element={<SignUpScreen />} />
					<Route path="/auth/login" element={<LoginScreen />} />
					<Route path="/deck/:deckId/preview" element={<DeckPreviewScreen />} />
					<Route path="/course/:courseId/preview" element={<CoursePreviewScreen />} />
					<Route
						path="/account"
						element={<AuthenticatedRoute screen={<AccountScreen />} />}
					/>
					<Route
						path="/study/:deckId/notation"
						element={<AuthenticatedRoute screen={<NotationInputScreen />} />}
					/>
					<Route
						path="/study/:deckId/edit/:cardId"
						element={<AuthenticatedRoute screen={<NotationInputScreen />} />}
					/>
					<Route
						path="/course/:courseId"
						element={<AuthenticatedRoute screen={<DecksScreen />} />}
					/>
					<Route
						path="/study/:deckId"
						element={<AuthenticatedRoute screen={<StudyScreen />} />}
					/>
					<Route
						path="/study/:deckId/list"
						element={<AuthenticatedRoute screen={<AllDeckCardsScreen />} />}
					/>
					<Route
						path="/study/:deckId/stats"
						element={<AuthenticatedRoute screen={<DeckStatsScreen />} />}
					/>
					<Route
						path="/study/:deckId/attempts"
						element={<AuthenticatedRoute screen={<AttemptHistoryScreen />} />}
					/>
				</Routes>
			</BrowserRouter>
		</Provider>
	);
}
