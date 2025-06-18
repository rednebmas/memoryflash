import { Document, model, PopulatedDoc, Schema } from 'mongoose';
import { UserDoc } from './User';

export interface ForgotPasswordDoc extends Document {
	user: PopulatedDoc<UserDoc>;
	reset?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const ForgotPasswordSchema = new Schema<ForgotPasswordDoc>(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		reset: {
			type: Boolean,
			default: false,
		},
	},
	{
		toJSON: {
			transform: (_, ret: Partial<ForgotPasswordDoc>) => {
				delete ret.updatedAt;
			},
		},
		timestamps: true,
	},
);

export const ForgotPassword = model<ForgotPasswordDoc>('ForgotPassword', ForgotPasswordSchema);
