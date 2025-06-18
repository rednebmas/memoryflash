import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { createStore } from 'MemoryFlashCore/src/redux/store';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';

const store = createStore({ scheduler: { multiPartCardIndex: 0 } } as any, () => {});
(window as any).store = store;

const recorder = new MusicRecorder('q');
(window as any).recorder = recorder;

const App: React.FC = () => {
	const [data, setData] = React.useState(recorder.buildQuestion('C'));

	React.useEffect(() => {
		(window as any).update = () => setData(recorder.buildQuestion('C'));
	}, []);

	return <MusicNotation data={data} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
);
