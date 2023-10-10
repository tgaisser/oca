import {Component, Input, OnInit, Output, EventEmitter, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {CourseContent, CourseDataService, CourseLecture} from '../../services/course-data.service';
import {LoadingService} from '../../common/loading.service';
import {select, Store} from '@ngrx/store';
import {State} from '../../state';
import {Subscription} from 'rxjs';
import {selectCurrentLessonId} from '../../state/courses/selectors';
import {setCurrentLesson, setCurrentLessonItem} from '../../state/courses/actions';
import {WindowBehaviorService} from '../../services/window-behavior.service';
import * as uiActions from '../../state/ui/actions';

@Component({
	selector: 'app-lesson',
	templateUrl: './lesson.component.html',
	styleUrls: ['./lesson.component.less']
})
export class LessonComponent implements OnInit, OnDestroy  {

	@Input() courseId: string;
	@Input() lessonNumber: number;
	@Input() lessonId: string;
	@Input() lecture: CourseLecture;
	@Input() layout = 'card';
	@Input() availableDate: Date;
	@Input() isLive = false;
	@Input() allowAccess = true;
	@Input() sidebarStatus: { hasSidebar: boolean, isOpen: boolean };

	@Input()
		sessionNumber = 0;

	selected = false;
	currentLessonId = null;
	currentLessonSub: Subscription;

	ignoreOpenItemSubmit = false; //TODO remove them when move to Angular/State based collapse

	@Output() activeLessonChange: EventEmitter<CourseLecture> = new EventEmitter<CourseLecture>();

	currentSelection = 'lecture';
	applyUnbounceSurveyTriggerClass = false;

	constructor(
		private courseData: CourseDataService,
		private loading: LoadingService,
		private store: Store<State>,
		private windowBehaviorService: WindowBehaviorService,
		private cd: ChangeDetectorRef,
	) {
		this.currentLessonSub = this.store.pipe(select(selectCurrentLessonId)).subscribe(s => this.currentLessonId = s);
	}

	ngOnInit() {
		// make lecture 4 a trigger for the unbounce survey:
		this.applyUnbounceSurveyTriggerClass = (this.lessonNumber === 4);
	}

	ngOnDestroy(): void {
		if (this.currentLessonSub && !this.currentLessonSub.closed) {
			this.currentLessonSub.unsubscribe();
		}
	}

	setSelection(event: any, type: string) {
		event.stopPropagation();

		//Tell the component to ignore the open function (about to be manually called) since we'll be handling it ourselves
		this.ignoreOpenItemSubmit = true; //TODO remove when move to state based collapse
		setTimeout(() => this.ignoreOpenItemSubmit = false, 50); //re-enable the click handling

		const target = event.target || event.srcElement || event.currentTarget;
		const cardHeader = target.closest('.card-header');

		if (cardHeader.classList.contains('collapsed')) {
			cardHeader.click();
		}

		this.selected = !this.selected;
		this.currentSelection = type;

		// dispatch event indicating this element was selected
		let item: CourseContent;
		if (type === 'lecture' && this.lecture.multimedia_id) {
			item = this.lecture;
		// } else if (type === 'qa' && this.lesson.supplementary_videos && this.lesson.supplementary_videos.length) {
		// 	item = this.lesson.supplementary_videos;
		} else if (type === 'quiz' && this.lecture.quiz) {
			item = this.lecture.quiz;
		}
		if (item) {
			this.store.dispatch(setCurrentLessonItem({itemType: type, item}));
		}
	}

	collapseOtherStudyGroupLectures(elem) {
		const thisSess = elem.closest('.session-date-group');
		if (!thisSess) return;
		Array.from(
			document.querySelectorAll('.session-date-group')
		)
			.filter(i => i !== thisSess)
			.forEach(s => {
				const panel = s.querySelector('.accordion-panel.show');
				const header = panel && panel.parentNode.querySelector('.card-header') as any;
				if (header) {
					header.click();
				}
			});
	}

	open(event) {
		// prevent unbounce survey from popping up after it has displayed one time:
		setTimeout( () => {
			this.applyUnbounceSurveyTriggerClass = false;
			this.cd.detectChanges();
		}, 2000);

		//TODO replace this trash with a real angular component!!!
		const target = event.target || event.srcElement || event.currentTarget;
		const cardHeader = target.closest('.card-header');

		this.collapseOtherStudyGroupLectures(target);

		//console.log('card header', cardHeader);
		if (cardHeader.classList.contains('collapsed')) {
			const elem = this.lecture && this.lecture.multimedia_id
				? this.lecture
				: (this.lecture.quiz ? this.lecture.quiz : null);
			if (elem) {
				this.store.dispatch(setCurrentLesson({currentLesson: this.lecture.url_slug}));
				//if we didn't get triggered by a type click //TODO when move to state-based collapse
				if (!this.ignoreOpenItemSubmit) {
					this.store.dispatch(setCurrentLessonItem({itemType: elem.system_type, item: elem}));
				}
			}

			setTimeout(() => {
				const yCoordinate = cardHeader.getBoundingClientRect().top + this.windowBehaviorService.getPageYOffset();
				const yOffset = -79;
				this.windowBehaviorService.scrollTo({
					top: yCoordinate + yOffset,
					behavior: 'smooth'
				});
			}, 500);
		} else if (!cardHeader.classList.contains('collapsing')) {
			this.store.dispatch(setCurrentLesson({currentLesson: null}));
			this.store.dispatch(setCurrentLessonItem({itemType: null, item: null}));
		}
	}

	openSidebar(sidebarIsOpen) {
		if (!sidebarIsOpen){
			this.store.dispatch(uiActions.openSidebar());
		}
	}
}
