import {Component, Input, OnInit} from '@angular/core';
import {Course} from '../../../services/course-data.service';
import {State} from '../../../state';
import {select, Store} from '@ngrx/store';
import {selectNextCourse, selectNextCoursesBySubject} from '../../../state/courses/selectors';
import {Observable} from 'rxjs';
import {courseListRequested} from '../../../state/courses/actions';



@Component({
	selector: 'app-next-course',
	templateUrl: './next-course.component.html',
	styleUrls: ['./next-course.component.less']
})
export class NextCourseComponent implements OnInit {
	@Input() singleColumnLayout = false;

	@Input()
	get requestedSubject() {
		return this._requestedSubject;
	}
	set requestedSubject(value: string) {
		this._requestedSubject = value;
		this.nextCourse$ = this.store.pipe(select(selectNextCoursesBySubject(value)));
	}
	_requestedSubject: string = null;

	nextCourse$: Observable<Course[]> = this.store.pipe(select(selectNextCourse));

	constructor(private store: Store<State>) {
		store.dispatch(courseListRequested());
	}

	ngOnInit() {
	}


}
