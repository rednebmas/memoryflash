import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MusicRecorder } from './components/MusicRecorder';
import { createStore } from 'MemoryFlashCore/src/redux/store';

const store = createStore({ scheduler: { multiPartCardIndex: 0 } } as any, () => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<MusicRecorder />
		</Provider>
	</React.StrictMode>,
);
