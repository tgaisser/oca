import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Course } from '../../services/course-data.service';
import { filter, map, tap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { State } from '../../state';
import { selectCurrentCourseWithProgress } from '../../state/courses/selectors';
import {Observable, Subscription} from 'rxjs';
import { setCurrentCourse, setCurrentLesson } from '../../state/courses/actions';
import { FINAL_QUIZ_LECTURE_ID } from '../../common/constants';
import { Title, Meta } from '@angular/platform-browser';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {WindowBehaviorService} from '../../services/window-behavior.service';
import {setCourseMetaTags} from '../../common/helpers';

@Component({
	selector: 'app-final-quiz',
	templateUrl: './final-quiz.component.html',
	styleUrls: ['./final-quiz.component.less']
})
export class FinalQuizComponent implements OnDestroy, OnInit {
	course$: Observable<Course>;

	paramsSub: Subscription;

	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();

	constructor(
		private route: ActivatedRoute,
		private store: Store<State>,
		private titleService: Title,
		private meta: Meta,
		private windowBehaviorService: WindowBehaviorService
	) {
		this.course$ = this.store.pipe(
			select(selectCurrentCourseWithProgress),
			filter(c => !!c),
			tap(c => {
				//TODO use helper
				// Update the page title to with the Course title
				this.titleService.setTitle('Final Quiz - ' + this.simpleMdPipe.transform(c.title, 'plaintext') + ' | Hillsdale College Online Courses');

				setCourseMetaTags(c, this.meta, this.simpleMdPipe, this.windowBehaviorService.getCurrentUrl(), 'Final Quiz - ' + c.title);
			})
		);
	}

	ngOnInit() {
		this.paramsSub = this.route.params
			.pipe(
				map(p => ({ courseId: p.courseId, contentId: p.contentId })),
				// tap(p => console.log('url params', p)),
				filter(p => p.courseId),
				// tap(p => console.log('course params', p))
				// flatMap(p => this.dataService.getCourseDetails(p.courseId).pipe(map(c => [c, p])))
				// flatMap(courseId => forkJoin(this.dataService.getCourseDetails(courseId), this.dataService.getCourseInstructors(courseId)))
			)
			.subscribe(
				params => {
					this.store.dispatch(setCurrentCourse({ currentCourse: params.courseId }));
					this.store.dispatch(setCurrentLesson({currentLesson: FINAL_QUIZ_LECTURE_ID}));
				},
				/* istanbul ignore next */
				err => console.log('err', err)
			);
	}

	ngOnDestroy() {
		if (this.paramsSub && !this.paramsSub.closed) {
			this.paramsSub.unsubscribe();
			this.paramsSub = null;
		}
	}
}
