import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components';
import { EmptyState, Spinner } from '../components/feedback';
import { getDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-action';
import { editCardSelector } from 'MemoryFlashCore/src/redux/selectors/editCardSelector';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { NotationInputScreen } from './NotationInputScreen';

export const EditCardScreen = () => {
	const dispatch = useAppDispatch();
	const { deckId = '', cardId = '' } = useParams();
	const status = useAppSelector((state) => editCardSelector(state, deckId, cardId));

	useEffect(() => {
		dispatch(getDeck(deckId));
	}, [deckId]);

	if (typeof status === 'object') return <NotationInputScreen card={status} />;
	return (
		<Layout subtitle="Edit Card">
			<Spinner show={status === 'loading'} />
			{status === 'missing' && <EmptyState message="Card not found" />}
		</Layout>
	);
};
