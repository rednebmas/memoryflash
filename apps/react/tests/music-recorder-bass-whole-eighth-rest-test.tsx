import React from 'react';
import { MusicNotation } from '../src/components/MusicNotation';
import '../src/index.css';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { renderApp } from './renderApp';

const recorder = new MusicRecorder('q');
(window as any).recorder = recorder;
(recorder as any).currentBeat = 0.5;
recorder.updateDuration('8', StaffEnum.Treble);
recorder.updateDuration('w', StaffEnum.Bass);

const App: React.FC = () => {
	const [data, setData] = React.useState(recorder.buildQuestion('C'));

	React.useEffect(() => {
		(window as any).update = () => setData(recorder.buildQuestion('C'));
	}, []);

	return <MusicNotation data={data} />;
};

renderApp(<App />);
