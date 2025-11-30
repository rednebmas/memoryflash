import { XCircleIcon } from '@heroicons/react/20/solid';

interface ErrorCardProps {
	body: React.ReactNode;
}

export const ErrorCard: React.FunctionComponent<ErrorCardProps> = ({ body }) => {
	return (
		<div className="rounded-md bg-red-50 p-4">
			<div className="flex">
				<div className="flex-shrink-0">
					<XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
				</div>
				<div className="ml-3">{body}</div>
			</div>
		</div>
	);
};

export const BasicErrorCard: React.FunctionComponent<{ error: any }> = ({ error }) => {
	if (!error) return null;
	return (
		<ErrorCard
			body={
				<>
					<h3 className="text-sm font-medium text-red-800">Error</h3>
					<div className="mt-2 text-sm text-red-700">{error}</div>
				</>
			}
		/>
	);
};
