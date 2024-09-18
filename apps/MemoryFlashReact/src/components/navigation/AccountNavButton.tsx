import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { CircleHover } from '../CircleHover';

interface AccountNavButtonProps {}

export const AccountNavButton: React.FunctionComponent<AccountNavButtonProps> = ({}) => {
	return (
		<CircleHover link={`/account`}>
			<UserCircleIcon className='w-6 h-6 stroke-2' />
		</CircleHover>
	);
};
