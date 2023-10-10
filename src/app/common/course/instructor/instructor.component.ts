import { Component, Input, OnInit } from '@angular/core';
import { Instructor, CourseDataService } from '../../../services/course-data.service';

@Component({
	selector: 'app-instructor',
	templateUrl: './instructor.component.html',
	styleUrls: ['./instructor.component.less']
})
export class InstructorComponent implements OnInit {
	@Input() instructor: Instructor = null;

	constructor() {}

	ngOnInit() {}
}
