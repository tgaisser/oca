import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';

import {CourseComponent, CourseNotesComponent} from './course.component';
import {NgxJsonLdModule} from '@ngx-lite/json-ld';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {Component, CUSTOM_ELEMENTS_SCHEMA, Input} from '@angular/core';
import {CourseDataService, Instructor} from '../services/course-data.service';
import {AngularEditorModule} from '@kolkov/angular-editor';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../state';
import {BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {createSpyObj, getMockCourse, getMockCourseLecture, MockBrowserAbstractionModule} from '../../test.helpers';
import {DonationService} from '../donation/donation.service';
import {Store} from '@ngrx/store';
import {setCurrentCourse, setCurrentLesson} from '../state/courses/actions';
import * as courseSelectors from '../state/courses/selectors';
import * as helpers from '../../test.helpers';
import {closeSidebar, openSidebar} from '../state/ui/actions';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {ActivatedRoute} from '@angular/router';
import {firstValueFrom, from, of} from 'rxjs';
import {getNote, saveNotes} from '../state/notes/actions';
import {take} from 'rxjs/operators';
import {IntroJsService} from '../services/intro-js.service';
import {addMinutes} from '../common/helpers';

@Component({
	selector: 'app-course-donate-links,[app-course-donate-links]',
	template: '[MOCK_COURSE_DONATE_LINKS c={{classes}}, split={{splitText}}, course={{course|json}}]',
	styles: ['']
})
export class MockCourseDonateLinksComponent {
	private _classes = ['btn-group'];


	@Input('class')
		classes: string;

	@Input()
		splitText = false;

	@Input()
		course: any = null;
}

@Component({
	selector: 'app-lesson',
	template: 'LESSON'
})
class MockLessonComponent {
	@Input() courseId: string;
	@Input() lessonNumber: number;
	@Input() sessionNumber: number;
	@Input() lessonId: string;
	@Input() lecture: any;
	@Input() layout = 'card';
	@Input() availableDate: Date;
	@Input() isLive = false;
	@Input() sidebarStatus: any;
}

@Component({
	selector: 'app-social-share',
	template: 'SocialShare'
})
class MockSocialShareComponent {
	@Input() shareURL = '';
	@Input() shareText = '';
	@Input() facebook = false;
	@Input() twitter = false;
	@Input() email = false;
}

@Component({
	selector: 'app-instructor',
	template: 'INST'
})
class MockInstructorComponent {
	@Input() instructor: Instructor = null;
}

describe('CourseComponent', () => {
	let component: CourseComponent;
	let fixture: ComponentFixture<CourseComponent>;
	let store: MockStore<State>;
	let donationService;
	let actRpoute: ActivatedRoute;
	let modalService;
	let dispatchSpy;
	let selectCurCrsProg;
	let selectCurLess;
	let selectCurStudyGroup;

	beforeEach(waitForAsync(() => {
		donationService = createSpyObj('DonationService', ['requestDonationAsk', 'startDonationAsk', 'softClose', 'close']);
		modalService = createSpyObj('ModalService', ['show']);

		TestBed.configureTestingModule({
			declarations: [
				CourseComponent,
				HcSimpleMdPipe,
				MockInstructorComponent,
				MockLessonComponent,
				MockSocialShareComponent,
				CourseNotesComponent,
				MockCourseDonateLinksComponent,
				//helpers.MockAudioDownloadComponent
			],
			imports: [
				NgxJsonLdModule,
				AngularEditorModule,
				RouterTestingModule.withRoutes([]),
				FormsModule,
				helpers.CustomMocksModule,
				ModalModule.forRoot(),
				MockBrowserAbstractionModule
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: DonationService, useValue: donationService},
				{provide: BsModalService, useValue:  modalService}
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		})
			.overrideModule(BrowserDynamicTestingModule, {set: {entryComponents: [CourseNotesComponent]}})
			.compileComponents();
	}));

	beforeEach(() => {
		store = getTestBed().get(Store);
		dispatchSpy = jest.spyOn(store, 'dispatch');
		selectCurCrsProg = store.overrideSelector(courseSelectors.selectCurrentCourseWithProgress, null);
		selectCurLess = store.overrideSelector(courseSelectors.selectCurrentLesson, null);
		selectCurStudyGroup = store.overrideSelector(courseSelectors.selectCurrentStudyGroup, null);

		fixture = TestBed.createComponent(CourseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		actRpoute = getTestBed().get(ActivatedRoute);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should subscribe to currentLesson on construct', async () => {
		expect(dispatchSpy).not.toHaveBeenCalled();

		const crsId = 'crs';

		component['currentCourseId'] = crsId;
		const lesson = {system_id: '12321', url_slug: 'face'};
		selectCurLess.setResult(lesson);
		store.refreshState();
		await component.currentLesson$.pipe(take(1)).toPromise();

		expect(dispatchSpy).toHaveBeenCalledWith(getNote({
			courseId: crsId,
			lectureId: lesson.system_id
		}));
	});

	const setupCourse$Tests = async (course) => {
		const isPreEnrollSpy = jest.spyOn(CourseDataService, 'courseIsPreEnroll').mockImplementation(() => true);
		jest.spyOn(component, 'checkFinalQuizEligibility').mockImplementation(() => true);
		// jest.spyOn(component, 'loadVideo').mockImplementation(() => {});
		const intro = TestBed.inject(IntroJsService);
		const runIntroSpy = jest.spyOn(intro, 'runIntroIfNeeded').mockImplementation(() => {});
		expect(dispatchSpy).not.toHaveBeenCalled();

		selectCurCrsProg.setResult(course);
		store.refreshState();
		await firstValueFrom(component.course$.pipe(take(1)));

		return {isPreEnrollSpy, runIntroSpy};
	};
	it('should subscribe to currentCourseWithProgress on construct', async () => {

		const crsId = 'crs';
		const lectureId = 'lectId';
		const finalQuiz = {
			id: 'fQuiz',
			itemType: 'FinalQuiz',
			completed: true,
		};
		const course = getMockCourse({
			system_id: crsId,
			url_slug: 'face',
			progress: {
				children: [
					finalQuiz,
					{
						itemType: 'Lecture',
						completed: true
					}, {
						itemType: 'Quiz',
						completed: true,
					}, {
						itemType: 'Lecture',
						completed: false,
					}, {
						itemType: 'Lecture',
						completed: true,
					}, {
						itemType: 'Quiz',
						completed: false,
					}, {
						itemType: 'FinalQuiz',
						completed: false,
					},
				]
			},
			lectures: [
				{
					quiz: 1,
				},
				{},
				{quiz: 2}
			],
			final_quiz: 8,
			course_trailer: '12321',
		});

		const {isPreEnrollSpy, runIntroSpy} = await setupCourse$Tests(course);

		expect(component.checkFinalQuizEligibility).toHaveBeenCalledWith(course);

		expect(component['currentCourseId']).toEqual(crsId);
		expect(component.finalQuizEligible).toBe(true);

		expect(component.numCompletedLectures).toBe(2);
		expect(component.numCompletedQuizzes).toBe(1);
		expect(component.numCompletedFinalQuizzes).toBe(1);
		expect(component.finalQuizProgress).toEqual(finalQuiz);


		expect(runIntroSpy).toHaveBeenCalled();
		expect(component.numLectures).toBe(3);
		expect(component.numQuizzes).toBe(2);
		expect(component.numFinalQuizzes).toBe(1);

		//TODO check code in 125-166

		// expect(dispatchSpy).toHaveBeenCalledWith(getNote({
		// 	courseId: crsId,
		// 	lectureId: lesson.system_id
		// }));
		isPreEnrollSpy.mockRestore();
	});

	it('should subscribe to currentCourseWithProgress on construct (null course)', async () => {

		const {isPreEnrollSpy, runIntroSpy} = await setupCourse$Tests(null);

		expect(component.checkFinalQuizEligibility).toHaveBeenCalledWith(null);

		expect(component['currentCourseId']).toBeFalsy();
		expect(component.finalQuizEligible).toBe(true);
		expect(dispatchSpy).not.toHaveBeenCalled();
		expect(runIntroSpy).not.toHaveBeenCalled();
		isPreEnrollSpy.mockRestore();
	});

	it('should subscribe to route params and set current info in ngOnInit', () => {
		const courseId = 'sdfs';
		const contentId = 'cont';
		actRpoute.params = from([
			{contentId, courseId}, //both setCurentCourse and setCurrentLesson
			{contentId}, //ignored (no course)
			{courseId} //only setCurrentCourse
		]);

		component.ngOnInit();

		expect(dispatchSpy.mock.calls).toEqual([
			[setCurrentCourse({currentCourse: courseId})],
			[setCurrentLesson({currentLesson: contentId})],
			[setCurrentCourse({currentCourse: courseId})],
		]);
	});

	it.todo('should subscribe to note save status in ngOnInit');

	it('should ngOnDestroy', () => {
		component.ngOnDestroy();
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentCourse({currentCourse: null}));
	});

	it('should updateActiveLesson', () => {
		const mockLesson = helpers.getMockCourseLecture();
		component.updateActiveLesson(mockLesson);
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentLesson({currentLesson: mockLesson.url_slug}));
	});

	it('should toggleSidebar true', () => {
		component.toggleSidebar(true);
		expect(store.dispatch).toHaveBeenCalledWith(closeSidebar());
	});

	it('should toggleSidebar false', () => {
		component.toggleSidebar(false);
		expect(store.dispatch).toHaveBeenCalledWith(openSidebar());
	});

	it('should trackLesson (null, 1)', () => {
		const mockLesson = helpers.getMockCourseLecture({system_id: 1});
		expect(component.trackLesson(null, mockLesson)).toEqual(1);
	});

	it('should trackLesson (109823, 2)', () => {
		const mockLesson = helpers.getMockCourseLecture({system_id: 2});
		expect(component.trackLesson(109823, mockLesson)).toEqual(2);
	});

	it('should trackLesson (null, null)', () => {
		expect(component.trackLesson(null, null)).toBeFalsy();
	});

	it('should playTrailerVideo', () => {
		component.trailerVideoRef = {nativeElement: helpers.getMockHcVideoPlayer() as any};
		component.playTrailerVideo();
		expect(component.hideTrailerOverlay).toBeTruthy();
		expect(component.trailerVideoRef.nativeElement.play).toHaveBeenCalled();
	});

	it('should storeNotes', () => {
		const courseId = 'cId';
		const lessonId = 'lId';
		const text = 'asdfsafsadf';

		//TODO move these to use selector

		component['currentCourseId'] = courseId;

		component['currentLessonId'] = lessonId;
		component.notesText = text;

		component.storeNotes();
		expect(component.isCleanNotesSave).toBeFalsy();
		expect(store.dispatch).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(saveNotes({
			courseId,
			lectureId: lessonId,
			noteContent: text,
		}));
	});

	it('should getReleaseDate', () => {
		const mockDate = new Date('2011-06-19');
		const mockAccessDate = jest.spyOn(CourseDataService, 'getAccessDateForCurrentUser').mockImplementation(() => mockDate);
		const mockCourse = helpers.getMockCourse();
		const res = component.getReleaseDateForCurrentUser(mockCourse);
		expect(mockAccessDate).toHaveBeenCalledWith(mockCourse);
		expect(res).toBe(mockDate);
		mockAccessDate.mockRestore();
	});

	it('should checkFinalQuizEligibility', () => {
		const mockCourse = helpers.getMockCourse();
		component.checkFinalQuizEligibility(mockCourse);
		if (mockCourse && mockCourse.progress && mockCourse.progress.children) {
			expect(component.numCompletedLectures).toEqual(0);
			expect(component.numCompletedQuizzes).toEqual(0);
			expect(component.checkFinalQuizEligibility(mockCourse)).toBeTruthy();
		} else {
			expect(component.checkFinalQuizEligibility(mockCourse)).toBeFalsy();
		}
	});

	xit('should openOtherNotes', () => {
		component.openOtherNotes();
	});

	test.todo('verify that introJs.runIntroIfNeeded is called');

	xit('should skipToSidebar', () => {
		component.skipToSidebar();
	});

	it.todo('should skipToCurrentLesson');

	/*it('should donateClicked', () => {
		const donateSpy = jest.spyOn(component, 'donateClicked');
		const mouseEvent = new MouseEvent(String('click'));
		const ref = 'www';
		const testEvent = {
			...mouseEvent,
			target: {
				... new EventTarget(),
				href: ref
			}
		};
		component.donateClicked(testEvent);
		expect(donateSpy).toHaveBeenCalled();
	});*/

	it('should getSessionClass', () => {
		const mockStudyGroupSession = helpers.getMockStudyGroupSession();
		mockStudyGroupSession.available_date = addMinutes(new Date(), 1000);
		const mockCourse = helpers.getMockCourse();
		let res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(2);
		expect(res).toContain('future');
		expect(res).toContain('completed');

		const mockCourseLecture = getMockCourseLecture();
		mockCourseLecture.system_id = 'mockLectureId';
		mockCourseLecture.multimedia.duration = 300;
		mockCourse.lectures = [mockCourseLecture];

		res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(2);
		expect(res).toContain('future');
		expect(res).toContain('started');

		mockCourseLecture.progress = null;

		res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(1);
		expect(res).toContain('future');
	});

	it('should getSessionClass - live session', () => {
		const mockStudyGroupSession = helpers.getMockStudyGroupSession();
		mockStudyGroupSession.optional_lectures = [getMockCourseLecture()];
		mockStudyGroupSession.lectures = [];
		mockStudyGroupSession.available_date = addMinutes(new Date(), 1000);
		const mockCourse = helpers.getMockCourse();
		let res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(1);
		expect(res).toContain('future');

		const mockCourseLecture = getMockCourseLecture();
		mockCourseLecture.system_id = 'mockLectureId';
		mockCourse.lectures = [mockCourseLecture];

		res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(1);
		expect(res).toContain('future');

		mockCourseLecture.progress = null;

		res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(1);
		expect(res).toContain('future');

		mockStudyGroupSession.available_date = addMinutes(new Date(), -30);
		mockStudyGroupSession.optional_lectures[0].multimedia.duration = 45 * 60;

		res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(1);
		expect(res).toContain('started');

		mockStudyGroupSession.available_date = addMinutes(new Date(), -61);

		res = component.getSessionClass(mockCourse, mockStudyGroupSession);
		expect(res).toHaveLength(1);
		expect(res).toContain('completed');
	});

	describe("numLecturesAvailableDuringPrereg", () => {
		it('should be 1 by default', async () => {
			const course = getMockCourse();
			const {isPreEnrollSpy, runIntroSpy} = await setupCourse$Tests(course);
			expect(component.numLecturesAvailableDuringPrereg).toBe(1);
		});

		it('should be 1 with bad values', async () => {
			const course = getMockCourse({pre_reg_available_lectures: "foobar"});
			const {isPreEnrollSpy, runIntroSpy} = await setupCourse$Tests(course);
			expect(component.numLecturesAvailableDuringPrereg).toBe(1);
		});

		it('should take course.pre_reg_available_lectures if numeric', async () => {
			const course = getMockCourse({pre_reg_available_lectures: 3});
			const {isPreEnrollSpy, runIntroSpy} = await setupCourse$Tests(course);
			expect(component.numLecturesAvailableDuringPrereg).toBe(3);
		});
	});
});
