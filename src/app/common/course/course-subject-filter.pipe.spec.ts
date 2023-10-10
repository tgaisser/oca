import {CourseSubjectFilterPipe} from './course-subject-filter.pipe';
import {getMockCourse} from '../../../test.helpers';

describe('CourseSubjectFilterPipe', () => {
	const pipe = new CourseSubjectFilterPipe();
	//const subjectB = [{codename: 'b', name: 'Math'}];
	const subjectB = 'b';
	//const subjectAll = [{codename: 'all', name: 'all'}];
	const subjectAll = 'all';
	const courses = [
		{...getMockCourse({system_id: 'mockCourse1'})},
		{...getMockCourse({system_id: 'mockCourse2', course_subject: [{codename: 'a', name: 'History'}]})},
		{...getMockCourse({system_id: 'mockCourse3', course_subject: [{codename: 'b', name: 'Math'}]})},
		{...getMockCourse({system_id: 'mockCourse4', course_subject: [{codename: 'b', name: 'Math'}]})},
		{...getMockCourse({system_id: 'mockCourse5', course_subject: [{codename: 'c', name: 'Science'}]})}
	];
	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return [] with empty courses[]', () => {
		expect(pipe.transform([], [])).toEqual([]);
	});

	it('should return [] with empty subject', () => {
		expect(pipe.transform(courses, null)).toEqual(courses);
	});

	it('should return courses with subjects = all', () => {
		expect(pipe.transform(courses, subjectAll)).toEqual(courses);
	});

	it('should return filtered courses', () => {
		const filteredCourses = pipe.transform(courses, subjectB);
		expect(filteredCourses.length).toEqual(2);
	});
});
