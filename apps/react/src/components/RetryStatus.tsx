import { retryStatusSelector } from 'MemoryFlashCore/src/redux/selectors/retryStatusSelector';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';

export const RetryStatus: React.FC = () => {
	const status = useAppSelector(retryStatusSelector);
	if (!status) return null;
	return (
		<p className="caption absolute top-full inset-x-0 mt-1 text-center whitespace-nowrap">
			{status}
		</p>
	);
};
