import { Layout } from '../components/Layout';
import { MusicRecorder } from '../components/MusicRecorder';

export const CreateFlashCardScreen = () => {
	return (
		<Layout subtitle="Create Flashcard" back="/">
			<MusicRecorder />
		</Layout>
	);
};
