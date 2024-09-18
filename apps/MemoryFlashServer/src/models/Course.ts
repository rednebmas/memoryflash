import { Schema, model, Document, Types } from 'mongoose';
import { Course as ICourse } from '../submodules/MemoryFlashCore/src/types/Course';

export type CourseDoc = ICourse & Document;

const courseSchema = new Schema<CourseDoc>({
	name: {
		type: String,
		required: true,
	},
	decks: [
		{
			type: Types.ObjectId,
			ref: 'Deck',
		},
	],
});

const Course = model<CourseDoc>('Course', courseSchema);

export default Course;
