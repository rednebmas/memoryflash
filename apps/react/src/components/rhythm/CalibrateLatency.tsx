import React from 'react';
import { rhythmLatencyMsSelector } from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Button } from '../ui/Button';
import { useCalibration } from './useCalibration';

export const CalibrateLatency: React.FC = () => {
	const latencyMs = useAppSelector(rhythmLatencyMsSelector);
	const { active, start, tap } = useCalibration();

	if (active) {
		return (
			<Button variant="outline" onPointerDown={() => tap()}>
				Tap (or play a key) on every click
			</Button>
		);
	}
	return (
		<Button variant="outline" onClick={start}>
			Calibrate latency{latencyMs ? ` (${latencyMs > 0 ? '+' : ''}${latencyMs} ms)` : ''}
		</Button>
	);
};
