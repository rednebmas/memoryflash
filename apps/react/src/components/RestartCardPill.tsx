import { restartCard } from 'MemoryFlashCore/src/redux/actions/restart-card-action';
import { canRestartCardSelector } from 'MemoryFlashCore/src/redux/selectors/retryStatusSelector';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Pill } from './ui/Pill';

export const RestartCardPill: React.FC = () => {
	const dispatch = useAppDispatch();
	const canRestart = useAppSelector(canRestartCardSelector);
	if (!canRestart) return null;
	return <Pill text="Restart card" theme="gray" onClick={() => dispatch(restartCard())} />;
};
