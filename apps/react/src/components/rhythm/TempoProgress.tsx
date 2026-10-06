import { tempoProgressSelector } from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { ProgressBar } from '../ui/ProgressBar';

export const TempoProgress: React.FC = () => {
	const progress = useAppSelector(tempoProgressSelector);
	if (!progress) return null;

	return (
		<div className="flex flex-col items-center gap-1 pt-1" data-testid="tempo-progress">
			<p className="caption">{progress.label}</p>
			<ProgressBar progress={progress.fraction} className="w-64 h-1.5" />
		</div>
	);
};
