import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';

export const StudyHintBanner: React.FC = () => {
	const { deckId, cardId } = useParams();
	const { isLoading: isAdding, error: addError } = useNetworkState('addCardsToDeck');
	const [visible, setVisible] = useState(false);
	const wasAddingRef = useRef(isAdding);

	useEffect(() => {
		if (!cardId && wasAddingRef.current && !isAdding && !addError) setVisible(true);
		wasAddingRef.current = isAdding;
	}, [isAdding, addError, cardId]);

	if (!visible || !deckId || cardId) return null;

	return (
		<div className="mt-4 flex justify-center">
			<div className="w-full max-w-xl rounded-md bg-green-50 p-4">
				<div className="flex items-center">
					<CheckCircleIcon aria-hidden="true" className="h-5 w-5 text-green-500" />
					<div className="ml-3 flex w-full items-center justify-between text-sm text-green-800">
						<p className="m-0">Card added! Ready to study your deck?</p>
						<Link
							to={`/study/${deckId}`}
							className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
						>
							Start Studying
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
