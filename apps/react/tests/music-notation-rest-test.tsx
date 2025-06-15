import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { createStore } from 'MemoryFlashCore/src/redux/store';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

const indexParam = new URLSearchParams(window.location.search).get('index');
const multiPartCardIndex = indexParam ? parseInt(indexParam, 10) : 0;

const store = createStore({ scheduler: { multiPartCardIndex } } as any, () => {});
(window as any).store = store;

const data: MultiSheetQuestion = {
	key: 'C',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [
				{ notes: [], duration: '8', rest: true },
				{ notes: [], duration: 'q', rest: true },
				{ notes: [], duration: 'h', rest: true },
				{ notes: [], duration: '8', rest: true },
			],
		},
	],
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<MusicNotation data={data} highlightClassName="highlight" />
		</Provider>
	</React.StrictMode>,
);
