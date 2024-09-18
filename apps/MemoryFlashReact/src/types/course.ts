export interface Course {
	segments?: {
		[key: string]: string;
	};
	sections: CourseSection[];
}

interface CourseSection {
	title: string;
	subTitle?: string;
	subSections: CourseSubSection[];
}

interface CourseSubSection {
	title: string;
	subTitle?: string;
	link?: string;
}
