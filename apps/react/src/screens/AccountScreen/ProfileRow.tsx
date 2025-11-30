// ProfileRow.tsx
import React from 'react';

interface ProfileRowProps {
	label: string;
	value: string;
	onUpdate?: () => void;
}

export const ProfileRow: React.FC<ProfileRowProps> = ({ label, value, onUpdate }) => (
	<div className="py-4 sm:flex">
		<dt className="font-medium text-muted sm:w-64 sm:flex-none sm:pr-6">{label}</dt>
		<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
			<div className="text-fg">{value}</div>
			{onUpdate && (
				<button
					type="button"
					className="font-semibold text-accent hover:text-blue-400"
					onClick={onUpdate}
				>
					Update
				</button>
			)}
		</dd>
	</div>
);
