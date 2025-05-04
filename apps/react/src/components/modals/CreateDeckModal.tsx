import React from 'react';
import { TextFieldModal } from './TextFieldModal';
import { createDeck } from 'MemoryFlashCore/src/redux/actions/create-deck-action';
import { getCourse } from 'MemoryFlashCore/src/redux/actions/get-course-action';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  isOpen,
  onClose,
  courseId
}) => {
  const dispatch = useAppDispatch();
  const { isLoading: isCreating } = useNetworkState('createDeck');

  const handleCreateDeck = async (name: string) => {
    await dispatch(createDeck({
      courseId,
      name,
      section: 'Custom', // Default section
      sectionSubtitle: ''
    }));
    
    // Refresh the course data to show the newly created deck
    await dispatch(getCourse(courseId));
    
    onClose();
  };

  return (
    <TextFieldModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Deck"
      initialValue=""
      placeholder="Deck Name"
      primaryButtonText="Create"
      onSave={handleCreateDeck}
      isLoading={isCreating}
    />
  );
};