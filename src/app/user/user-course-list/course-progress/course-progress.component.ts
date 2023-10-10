import {Component, Input, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {select, Store} from '@ngrx/store';
import {State} from '../../../state';
import {getCourseDetails, getCoursesProgress} from '../../../state/courses/actions';
import {Course} from '../../../services/course-data.service';
import {Observable} from 'rxjs';
import * as courseSelectors from '../../../state/courses/selectors';
import { faVideo } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-course-progress',
	templateUrl: './course-progress.component.html',
	styleUrls: ['./course-progress.component.less']
})
export class CourseProgressComponent implements OnInit {
	faVideo = faVideo;
	courseInfo$: Observable<Course>;
	@Input()
	set course(value: Course) {
		this.store.dispatch(getCourseDetails({courseSlug: value.url_slug, courseCodename: value.system_codename}));
		this.courseInfo$ = this.store.pipe(select(courseSelectors.selectCourseWithProgress, {courseSlug: value.url_slug}));
	}

	constructor(private store: Store<State>) {
		store.dispatch(getCoursesProgress());
	}

	ngOnInit() {
	}

}
