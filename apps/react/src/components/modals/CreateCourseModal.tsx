import React from 'react';
import { TextFieldModal } from './TextFieldModal';
import { createCourse } from 'MemoryFlashCore/src/redux/actions/create-course-action';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { isLoading: isCreating } = useNetworkState('createCourse');

  const handleCreateCourse = async (name: string) => {
    await dispatch(createCourse(name));
    onClose();
  };

  return (
    <TextFieldModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Course"
      initialValue=""
      placeholder="Course Name"
      primaryButtonText="Create"
      onSave={handleCreateCourse}
      isLoading={isCreating}
    />
  );
};