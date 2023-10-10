import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'courseSubjectFilter'
})
export class CourseSubjectFilterPipe implements PipeTransform {
	transform(courses: any[], courseSubject: any): any {
		if (!courses || !courseSubject || courseSubject === 'all') {
			return courses;
		}

		return courses.filter(course => course.course_subject.find(s => s.codename === courseSubject));
	}
}
