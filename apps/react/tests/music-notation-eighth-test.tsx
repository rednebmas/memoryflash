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
				{ notes: [{ name: 'C', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'D', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'E', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'F', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'G', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'A', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'B', octave: 4 }], duration: '8' },
				{ notes: [{ name: 'C', octave: 5 }], duration: '8' },
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
