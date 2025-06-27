import React from 'react';
import { MusicNotation } from '../../src/components/MusicNotation';
import '../../src/index.css';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';
import { renderApp } from '../renderApp';

const recorder = new MusicRecorder('q');
(window as any).recorder = recorder;

const App: React.FC = () => {
	const [data, setData] = React.useState(recorder.buildQuestion('C'));

	React.useEffect(() => {
		(window as any).update = () => setData(recorder.buildQuestion('C'));
	}, []);

	return <MusicNotation data={data} />;
};

renderApp(<App />);
