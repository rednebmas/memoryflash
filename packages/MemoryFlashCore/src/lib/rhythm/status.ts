import { capitalize, StepGrade } from './types';

export const stepVerdict = (step: StepGrade) => {
	if (step.offsetMs === null) return 'Missed';
	const tier = capitalize(step.tier);
	if (step.offsetMs === 0) return `${tier} · on the beat`;
	return `${tier} · ${Math.abs(step.offsetMs)} ms ${step.offsetMs < 0 ? 'early' : 'late'}`;
};

export const timingSummary = (steps: StepGrade[]) => {
	const offsets = steps.flatMap((s) => (s.offsetMs === null ? [] : [s.offsetMs]));
	if (offsets.length === 0) return '';
	const mean = Math.round(offsets.reduce((a, b) => a + b, 0) / offsets.length);
	const trend = mean > 10 ? 'dragging' : mean < -10 ? 'rushing' : 'steady';
	return `avg ${mean > 0 ? '+' : ''}${mean} ms · ${trend}`;
};
