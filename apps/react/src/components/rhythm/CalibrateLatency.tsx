import React from 'react';
import { rhythmLatencyMsSelector } from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Button } from '../ui/Button';
import { useCalibration } from './useCalibration';
import { instrumentSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';

export const CalibrateLatency: React.FC = () => {
	const latencyMs = useAppSelector(rhythmLatencyMsSelector);
	const { active, start, tap } = useCalibration();
	const sax = useAppSelector(instrumentSelector) === 'sax';

	if (active) {
		return (
			<Button variant="outline" onPointerDown={() => tap()}>
				{sax ? 'Play a short note on every click' : 'Tap (or play a key) on every click'}
			</Button>
		);
	}
	return (
		<Button variant="outline" onClick={start}>
			Calibrate latency{latencyMs ? ` (${latencyMs > 0 ? '+' : ''}${latencyMs} ms)` : ''}
		</Button>
	);
};
