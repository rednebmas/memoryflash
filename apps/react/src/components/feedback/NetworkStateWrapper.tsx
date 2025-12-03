import React from 'react';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { Spinner } from './Spinner';
import { BasicErrorCard } from './ErrorCard';

interface NetworkStateWrapperProps {
	networkKey: string;
	children: React.ReactNode;
	showSpinnerWhen?: 'always' | 'no-children';
	hasData?: boolean;
}

export const NetworkStateWrapper: React.FC<NetworkStateWrapperProps> = ({
	networkKey,
	children,
	showSpinnerWhen = 'no-children',
	hasData = true,
}) => {
	const { isLoading, error } = useNetworkState(networkKey);
	const showSpinner =
		isLoading &&
		(showSpinnerWhen === 'always' || (showSpinnerWhen === 'no-children' && !hasData));
	const showChildren = !isLoading || hasData;

	return (
		<>
			<Spinner show={showSpinner} />
			<BasicErrorCard error={error} />
			{showChildren && children}
		</>
	);
};
