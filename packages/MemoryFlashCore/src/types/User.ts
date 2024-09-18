export interface User {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
}
