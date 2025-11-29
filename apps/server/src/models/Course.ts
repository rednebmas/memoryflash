import { Schema, model, Document, Types } from 'mongoose';
import { Course as ICourse } from 'MemoryFlashCore/src/types/Course';
import { VISIBILITIES } from 'MemoryFlashCore/src/types/Deck';

export type CourseDoc = ICourse & Document;

const courseSchema = new Schema<CourseDoc>({
	name: {
		type: String,
		required: true,
	},
	userId: {
		type: Types.ObjectId,
		ref: 'User',
	},
	decks: [
		{
			type: Types.ObjectId,
			ref: 'Deck',
		},
	],
	visibility: {
		type: String,
		enum: VISIBILITIES,
		default: 'private',
	},
	importedFromCourseId: {
		type: String,
		required: false,
	},
});

const Course = model<CourseDoc>('Course', courseSchema);

export default Course;
