import React, { useState, useEffect } from 'react';

interface TimerProps {
	startTime: number;
	className?: string;
}

const Timer: React.FC<TimerProps> = ({ startTime, className }) => {
	const [time, setTime] = useState(startTime > 0 ? (Date.now() - startTime) / 1000 : 0);

	useEffect(() => {
		if (startTime <= 0) return;
		const intervalId = setInterval(() => {
			const currentTime = Date.now();
			const elapsedTime = (currentTime - startTime) / 1000;
			setTime(elapsedTime);
		}, 100);

		return () => clearInterval(intervalId);
	}, [startTime]);

	return (
		<span
			className={className}
			style={{
				fontFamily:
					'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
			}}
		>
			{time.toFixed(1)}
		</span>
	);
};

export default Timer;
