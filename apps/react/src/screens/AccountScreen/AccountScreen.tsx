// AccountScreen.tsx
import React from 'react';
import { Layout } from '../../components';
import { ProfileRow } from './ProfileRow';
import { InputModal } from '../../components/modals/InputModal';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { logout } from 'MemoryFlashCore/src/redux/actions/logout-action';

interface AccountScreenProps {}

export const AccountScreen: React.FC<AccountScreenProps> = () => {
	const dispatch = useAppDispatch();
	const user = useAppSelector((s) => s.auth.user);
	const timezone = useAppSelector((s) => s.userStats.userStats?.timezone ?? 'UTC');
	const [profileData, setProfileData] = React.useState({
		firstName: user?.firstName ?? '',
		lastName: user?.lastName ?? '',
	});

	React.useEffect(() => {
		if (user) {
			setProfileData({ firstName: user.firstName, lastName: user.lastName });
		}
	}, [user]);

	const [modalState, setModalState] = React.useState({
		isOpen: false,
		field: '',
		label: '',
		value: '',
	});

	const openModal = (field: string, label: string, value: string) => {
		setModalState({
			isOpen: true,
			field,
			label,
			value,
		});
	};

	const closeModal = () => {
		setModalState({
			...modalState,
			isOpen: false,
		});
	};

	const handleSave = (newValue: string) => {
		setProfileData({
			...profileData,
			[modalState.field]: newValue,
		});
	};

	return (
		<Layout>
			<main>
				<h3 className="px-4 mb-2 lg:px-8 text-sm font-normal leading-6 text-muted">
					PROFILE
				</h3>
				<div className="px-4 py-2 lg:px-6 lg:py-3 bg-surface mx-4 border border-default rounded-lg">
					<div className="mx-auto md:px-2 ">
						<div>
							<dl className="mt-0 divide-y divide-default text-sm leading-6">
								<ProfileRow
									label="First name"
									value={profileData.firstName}
									onUpdate={() =>
										openModal('firstName', 'First name', profileData.firstName)
									}
								/>
								<ProfileRow
									label="Last name"
									value={profileData.lastName}
									onUpdate={() =>
										openModal('lastName', 'Last name', profileData.lastName)
									}
								/>
								<ProfileRow label="Email address" value={user?.email ?? ''} />
								<ProfileRow label="Timezone" value={timezone ?? 'UTC'} />
							</dl>
						</div>
					</div>
				</div>
			</main>
			<div className="text-center">
				<button
					type="button"
					className="rounded-full bg-surface mt-4 px-6 py-1.5 text-sm font-semibold text-fg ring-1 ring-inset ring-default hover:bg-lm-elevated dark:hover:bg-dm-elevated"
					onClick={() => dispatch(logout())}
				>
					Logout
				</button>
			</div>

			<InputModal
				isOpen={modalState.isOpen}
				onClose={closeModal}
				label={modalState.label}
				value={modalState.value}
				onSave={handleSave}
			/>
		</Layout>
	);
};
