import React from 'react';
import { IS_TEST_ENV } from '../../utils/constants';

export const AttemptTime: React.FC<{ time?: number }> = ({ time }) =>
	IS_TEST_ENV || time === undefined ? null : (
		<span className="caption tabular-nums">{time.toFixed(1)}s</span>
	);
