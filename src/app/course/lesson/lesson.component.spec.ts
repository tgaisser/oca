import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import * as helpers from '../../../test.helpers';
import {LessonComponent} from './lesson.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../../state';
import {InstructorNamePipe} from '../../common/course/instructor-name.pipe';
import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CourseLecture, SupplementalVideo} from '../../services/course-data.service';
import {Subscription} from 'rxjs';
import {HttpClientModule} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {setCurrentLessonItem, setCurrentLesson} from '../../state/courses/actions';
import {MockBrowserAbstractionModule} from '../../../test.helpers';
import {WindowBehaviorService} from '../../services/window-behavior.service';
import {BrowserTransferStateModule} from '@angular/platform-browser';
import {DurationPipe} from '../../common/course/duration.pipe';
import * as uiActions from '../../state/ui/actions';


@Component({
	selector: 'app-lecture',
	template: 'LECTURE'
})
class MockLectureComponent {
	@Input() courseId: string;
	@Input() lecture: CourseLecture = null;
	@Input() layout = 'main';
	@Input() showVideo = true;

	playerControlsDisabled = false;

	currentSelection = 'lecture';

	private curLocationLookupSub: Subscription;
	private modalWatcherSub: Subscription;

	@ViewChild('lectureVideo')
	get lectureVideoRef(): ElementRef {
		return null;
	}

}

@Component({
	selector: 'app-qa',
	template: 'QA'
})
class MockQAComponent {
	@Input() suppVids: SupplementalVideo[] = null;
	@Input() layout = 'main';
	@Input() courseId: string;
	@Input() showVideo: boolean;

	currentVideo: SupplementalVideo;
	playerControlsDisabled = false;
	showDownloadNotice = false;

	public soundcloudAudioSrc;
	public soundcloudDownloadSrc;

	@ViewChild('qaVideo')
	get qaVideoRef(): ElementRef {
		return null;
	}

}

@Component({
	selector: 'app-quiz',
	template: 'QUIZ'
})
class MockQuizComponent {
	@Input() quiz: any;
}


describe('LessonComponent', () => {
	let component: LessonComponent;
	let fixture: ComponentFixture<LessonComponent>;
	let store: MockStore<State>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [
				LessonComponent,
				HcSimpleMdPipe,
				InstructorNamePipe,
				MockLectureComponent,
				MockQAComponent,
				MockQuizComponent,
				DurationPipe
			],
			imports: [HttpClientModule, MockBrowserAbstractionModule, BrowserTransferStateModule],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LessonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = TestBed.inject(Store) as MockStore<State>;
		jest.spyOn(store, 'dispatch');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	function createFakeEvent(isCardCollapsed) {
		const closestObj = {
			classList: {
				contains: jest.fn(() => isCardCollapsed)
			},
			click: jest.fn(),
			getBoundingClientRect: jest.fn(() => ({top: 5})),
		};
		const clickEvent = {
			stopPropagation: jest.fn(),
			target: {
				closest: jest.fn(() => closestObj)
			}
		};

		return {
			event: clickEvent,
			closestObj
		};
	}

	function runSetSelectionTests(expectType: string, expectedItem: any, isCardCollapsed = true) {

		const {closestObj, event: clickEvent} = createFakeEvent(isCardCollapsed);

		component.setSelection(clickEvent, expectType);
		expect(component.selected).toBeTruthy();
		expect(closestObj.classList.contains).toHaveBeenCalledWith('collapsed');
		expect(clickEvent.target.closest).toHaveBeenCalledWith('.card-header');

		if (isCardCollapsed) {
			expect(closestObj.click).toHaveBeenCalled();
		} else {
			expect(closestObj.click).not.toHaveBeenCalled();
		}
		expect(clickEvent.stopPropagation).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentLessonItem({itemType: expectType, item: expectedItem}));
	}

	it('should setSelection where type = lecture', () => {
		component.lecture = helpers.getMockCourseLecture({multimedia_id: 'mockVideoId'});
		runSetSelectionTests('lecture', component.lecture);
	});

	it('should setSelection where type = quiz', () => {
		component.lecture = helpers.getMockCourseLecture({multimedia_id: 'mockVideoId', quiz: 'quiz'});
		runSetSelectionTests('quiz', component.lecture.quiz);
	});

	it('should setSelection where type = quiz and isCardCollapsed = false', () => {
		component.lecture = helpers.getMockCourseLecture({multimedia_id: 'mockVideoId', quiz: 'quiz'});
		runSetSelectionTests('quiz', component.lecture.quiz, false);
	});

	it('should open where isCardCollapsed = true', () => {
		component.lecture = helpers.getMockCourseLecture({multimedia_id: 'mockVideoId', quiz: 'quiz'});
		jest.spyOn(component, 'collapseOtherStudyGroupLectures');
		jest.useFakeTimers();
		const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {
		});
		const {closestObj, event: clickEvent} = createFakeEvent(true);

		component.open(clickEvent);
		expect(component.collapseOtherStudyGroupLectures).toHaveBeenCalledWith(clickEvent.target);
		expect(clickEvent.target.closest).toHaveBeenCalled();
		expect(closestObj.classList.contains).toHaveBeenCalledWith('collapsed');
		expect(store.dispatch).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentLesson({currentLesson: component.lecture.url_slug}));
		if (!component.ignoreOpenItemSubmit) {
			expect(store.dispatch).toHaveBeenCalledWith(setCurrentLessonItem({
				itemType: component.lecture.system_type,
				item: component.lecture
			}));
		}
		jest.advanceTimersByTime(500);
		expect(closestObj.getBoundingClientRect).toHaveBeenCalled();
		expect(TestBed.inject(WindowBehaviorService).scrollTo).toHaveBeenCalled();
		jest.useRealTimers();
		scrollSpy.mockReset();
	});

	it('collapseOtherStudyGroupLectures should collapse other study group lectures', () => {
		const header = {click: jest.fn()};
		const panel = {parentNode: {querySelector: jest.fn(() => header)}};

		const otherElems = [
			{querySelector: jest.fn(() => null)},
			{querySelector: jest.fn(() => panel)}
		];
		const querySpy = jest.spyOn(document, 'querySelectorAll').mockImplementation(() => otherElems as any);
		const target = {
			closest: jest.fn(() => 1)
		};
		component.collapseOtherStudyGroupLectures(target);
		expect(target.closest).toHaveBeenCalledWith('.session-date-group');
		expect(document.querySelectorAll).toHaveBeenCalledWith('.session-date-group');
		expect(header.click).toHaveBeenCalled();
		querySpy.mockRestore();
	});
	it('collapseOtherStudyGroupLectures should do nothing if not part of study group', () => {
		const querySpy = jest.spyOn(document, 'querySelectorAll');
		const target = {
			closest: jest.fn(() => null)
		};
		component.collapseOtherStudyGroupLectures(target);
		expect(target.closest).toHaveBeenCalledWith('.session-date-group');
		expect(document.querySelectorAll).not.toHaveBeenCalled();
		querySpy.mockRestore();
	});

	it('should open where isCardCollapsed = false and isCollapsing = true', () => {
		component.lecture = helpers.getMockCourseLecture({multimedia_id: 'mockVideoId', quiz: 'quiz'});
		const {closestObj, event: clickEvent} = createFakeEvent(false);
		component.open(clickEvent);
		expect(clickEvent.target.closest).toHaveBeenCalled();
		expect(closestObj.classList.contains).toHaveBeenCalledWith('collapsing');
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentLesson({currentLesson: null}));
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentLessonItem({itemType: null, item: null}));
	});

	it('test openSidebar()', () => {
		component.openSidebar(false);
		expect(store.dispatch).toHaveBeenCalledWith(uiActions.openSidebar());
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		component.openSidebar(true);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
	});

	it('should remove unbounce-survey-trigger class', () => {
		jest.useFakeTimers();
		jest.spyOn(global, 'setTimeout');
		component.lessonNumber = 4;
		component.ngOnInit();

		component.lecture = helpers.getMockCourseLecture({multimedia_id: 'mockVideoId', quiz: 'quiz'});
		const {closestObj, event: clickEvent} = createFakeEvent(false);
		component.open(clickEvent);

		expect(setTimeout).toHaveBeenCalledTimes(1);
		jest.useRealTimers();
	});

});
