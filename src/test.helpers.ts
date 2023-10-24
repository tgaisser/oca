/* istanbul ignore file */
import { Component, ElementRef, EventEmitter, Input, NgModule, NgZone, Output, Pipe, PipeTransform, Injectable } from '@angular/core';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from './app/state';
import {UserDataService} from './app/services/user-data.service';
import {EMPTY, Observable, of} from 'rxjs';
import { CourseDataService } from './app/services/course-data.service';
import {switchMap} from 'rxjs/operators';
import {WindowBehaviorService} from './app/services/window-behavior.service';
import {CourseEnrollment, LOCAL_STORAGE, SESSION_STORAGE} from './app/common/models';
import {WindowTrackingService} from './app/services/window-tracking.service';
import {Components} from 'hc-video-player/dist/types/components';
import { User, UserType } from './app/services/user.service';

// https://stackoverflow.com/a/45319913
export const createSpyObj = (baseName, methodNames): { [key: string]: jest.Mock<any> } => {
	const obj: any = {};

	for (const item of methodNames) {
		obj[item] = jest.fn();
	}

	return obj;
};

export function createRetryableStream(...resp$: Observable<any>[]) {
	const ret = {
		calls: 0,
		stream: of(undefined).pipe(switchMap(_ => {
			return resp$[ret.calls++];
		}))
	};

	return ret;
}

export function createSpyWithMultipleObservableValues(values, defaultValue = EMPTY) {
	return createSpyWithMultipleValues(values, defaultValue);
}
export function createSpyWithMultipleValues<T>(values: any[], defaultValue = null) {
	let numCalls = -1;

	return jest.fn(() => {
		numCalls++;

		if (values[numCalls]) return values[numCalls];

		return defaultValue;
	});
}

export function mockJquery() {
	const fakeJquery = (selector) => {
		return {
			on: (handler) => {
			}
		};
	};

	beforeAll(() => {

		window['$'] = fakeJquery;
	});
	afterAll(() => {

		delete window['$'];
	});

	return fakeJquery;
}

export function getMockKenticoFilters(value?: any) {
	return {
		itemId: 'mockItemId',
		type: 'mockType',
		elements: ['mockElements'],
		depth: 1,
		slug: 'mockSlug',
		...value
	};
}

export function getMockKenticoObject(value?: any) {
	return {
		system_id: 'mockSystemId',
		system_type: 'mockSystemType',
		system_name: 'mockSystemName',
		system_codename: 'mockSystemCodeName',
		system_last_modified: '',
		...value
	};
}

export function getMockKenticoAsset(value?: any) {
	return {
		name: '',
		type: '',
		size: 0,
		description: '',
		url: '',
		width: 0,
		height: 0,
		...value
	};
}

export function getMockCourse(value?: any) {
	const ead = new Date();
	ead.setMonth(ead.getMonth() - 1);
	return {
		...getMockKenticoObject(),
		meta_description: '',
		publication_date: new Date(),
		early_access_date: new Date(ead),
		title: 'mockCourseTitle',
		url_slug: 'mockCourse_urlSlug',
		hubspot_key: '',
		featured_course: [],
		course_subject: [],
		catalog_image: getMockKenticoAsset(),
		course_trailer_id: '',
		course_trailer: getMockMultimediaItem(),
		overview: '',
		estimated_course_ttc: 0,
		instructors: [],
		lectures: [],
		final_quiz: {
			quiz_id: '',
			questions: []
			//questions: QuizQuestion[];
		},
		study_guide: getMockKenticoAsset(),
		cta_embed_code: '',
		course_donation_url: '',
		course_companion_donation_url: '',
		course_dvd_donation_url: '',
		course_study_guide_donation_url: '',
		dvd_catalog_image: getMockKenticoAsset(),
		course_sponsor: '',
		enrolled: false,
		userHasEarlyAccess: false,
		progress: getMockProgress(),
		study_group_headline: '',
		study_group_body_text: '',
		study_group_cta_text: '',
		...value
	};
}

export function getMockStudyGroupSession(value?: any) {
	return {
		...getMockKenticoObject(),
		title: 'mockTitle',
		available_date: new Date(),
		lecture_ids: ['mockLectureId'],
		lectures: [getMockCourseLecture()],
		optional_lectures: [],
		podcast_id: '',
		podcast: getMockMultimediaItem(),
		discussion_board_post_url: 'mockDiscussionBoardPostUrl',
		recommended_readings: getMockKenticoAsset(),
		discussion_questions: 'mockDiscussionQuestions',
		...value
	};
}

export function getMockStudyGroup(value?: any) {
	return {
		...getMockKenticoObject(),
		course_id: 'mockCourseId',
		introductory_body_text: 'introduction_text',
		intro_video_id: 'mockVideoId_Intro',
		start_date: new Date(),
		end_date: new Date(),
		discussion_board_section_url: 'discussionBoardSectionUrl',
		study_group_syllabus: getMockKenticoAsset(),
		pre_course_test_url: 'preCourseTextUrl',
		midterm_survey_url: 'midtermSurveyUrl',
		midterm_survey_availability_date: new Date(),
		essay_contest_description: 'essayContestDescription',
		essay_contest_pdf: getMockKenticoAsset(),
		sessions: [ getMockStudyGroupSession() ],
		...value
	};
}

export function getMockCourseContent(value?: any) {
	return {
		...getMockKenticoObject(),
		title: 'mockTitle',
		url_slug: 'mockUrlSlug',
		...value
	};
}


export function getMockTestimonials() { 
	return [
		getMockTestimonial(),
		getMockTestimonial({user_name: ''})
	];
}

export function getMockTestimonial(value?: any) {
	return {
		title: 'mockTitle',
		user_name: 'mockUser_name',
		user_location: 'mockUser_location',
		message: 'mockTestimonialMessage',
		referenced_course_id: '',
		...value
	};
}

export function getMockCourses() {
	return [
		getMockCourse({title: 'History 101'}),
		getMockCourse({title: 'Math'})
	];
}

export function getMockKenticoButton(value?: any) {
	return {
		...getMockKenticoObject(),
		text: 'mockText',
		link: 'mockLink',
		open_in_new_tab: false,
		...value
	};
}

export function getMockProgress(value?: any) {
	return {
		itemType: 'MockItem',
		itemId: 'Mock',
		itemName: 'Mock item',
		progressPercentage: .25,
		started: true,
		completed: false,
		lastActivityDate: new Date(),
		children: [],
		...value
	};
}

export function getMockMultimediaItem(value?: any) {
	return {
		id: '1',
		duration: 0,
		soundcloud_track_id: '',
		soundcloud_track_secret_token: '',
		audio_download_filename: '',
		brightcove_id: 0,
		vimeo_id: 0,
		mux_id: '',
		cloudflare_id: '',
		...value
	};
}

export function getMockQuizResult(value?: any) {
	return {
		quizId: 'mockQuizId',
		quizName: 'Mock Quiz',
		courseId: 'mockCourseId',
		lectureId: 'mockLectureId',
		results: [
			{id: 'mockQuizQuestionId', correct: true, selectedOption: 'mockOption1'},
			{id: 'mockQuizQuestionId', correct: false, selectedOption: 'mockOption2'},
		],
		correctQuestions: 1,
		percentageCorrect: 50,
		completeTime: new Date(),
		...value
	};
}

export function getMockQuizQuestion(value?: any) {
	return {
		...getMockKenticoObject({system_id: 'mockQuizQuestionId'}),
		question: 'mockQuizQuestion',
		option_1: 'mockOption1',
		option_2: 'mockOption2',
		option_3: 'mockOption3',
		option_4: 'mockOption4',
		option_5: 'mockOption5',
		answer: 'mockAnswer'
	};
}

export function getMockQuiz(value?: any) {
	return {
		...getMockCourseContent({system_id: 'mockQuizId'}),
		quiz_id: 'mockQuizId',
		questions: [
			getMockQuizQuestion({system_id: 'question1'}),
			getMockQuizQuestion({system_id: 'question2'})
		],
		...value
	};
}

export function getMockCourseEnrollment(value?: any): CourseEnrollment {
	return {
		id: 0,
		userId: 'mockUserId',
		courseId: 'mockCourseId',
		enrollmentDate: new Date(),
		withdrawalDate: new Date(),
		userHasEarlyAccess: false,
		studyGroupId: '',
		...value
	};
}

export function getMockCourseLecture(value?: any) {
	return {
		...getMockKenticoObject(),
		title: 'mockLectureTitle',
		url_slug: 'mockUrlSlug',
		progress: getMockProgress(),
		multimedia: getMockMultimediaItem(),
		multimedia_id: 'mockMultimediaId',
		study_guide: getMockKenticoAsset(),
		overview: 'mockOverview',
		duration: '1:00:00',
		video_service: '',
		video_id: '',
		cloudflare_video_id: '',
		mux_video_id: '',
		vimeo_video_id: '',
		audio_url: '',
		soundcloud_track_id: '',
		soundcloud_track_secret_token: '',
		recommended_readings: [getMockKenticoAsset()],
		discussion_questions: '',
		instructors: [],
		supplementary_videos: [],
		quiz: {
			quiz_id: 'mockQuizId',
			questions: [getMockQuizQuestion()]
		},
		...value
	};
}

@Component({
	selector: 'app-audio-player',
	template: 'AUDIO|{{audioStartPosition}}|{{courseId}}'
})
class MockAudioDownloadComponent {
	@Output()
		audioDownloaded = new EventEmitter();

	@Input()
		audioStartPosition: number; //requires watch

	@Input()
		courseId: string;
	@Input()
		multimedia: any;
	@Input()
		contentItem: any;

	@Input()
		enableDownloadNotice = true;
	@Input()
		trackProgress = false; //requires watch
}

@Component({
	selector: 'app-course-catalog-entry',
	template: 'ENTRY({{catalogEntry}})'
})
class MockCourseCatalogEntryComponent {
	@Input() catalogEntry: any;
	@Input() showSubjects: any;
}

@Component({
	selector: 'app-complete-cert-button',
	template: 'BUTTON'
})
class MockCompleteCertButtonComponent {
	@Input() courseId: any;
	@Input() showAsButton: any;
}

@Component({
	selector: 'app-course-progress',
	template: 'AppProgress({{course}})'
})
class MockCourseProgressComponent {
	@Input() course: any;
}
@Component({
	selector: 'app-kentico-button',
	template: 'KENTICO BUTTON'
})
class MockKenticoButtonComponent {
	@Input() button: any;
	@Input() buttonClasses: any;
}
@Component({
	selector: 'app-password-validate-list',
	template: 'PasswordValidate({{passwordInput}}'
})
class MockPasswordValidateListComponent {
	@Input() passwordInput: any;
}
@Component({
	selector: 'app-sticky-element',
	template: 'STICKY'
})
class MockStickyElementComponent {
	private elementRef: ElementRef;
	private zone: NgZone;

	public bottomMarkerRef: ElementRef;
	public topMarkerRef: ElementRef;

	private isBottomMarkerVisible: boolean;
	private isTopMarkerVisible: boolean;
	public isStuck: boolean;

	private observer: IntersectionObserver | null;
	public stickyClass = 'stuck';
}

@Component({
	selector: 'app-next-course',
	template: '[app-next-course singleColumnLayout={{singleColumnLayout}} requestedSubject={{requestedSubject}}]'
})
export class MockNextCourseComponent {
	@Input()
		singleColumnLayout: boolean;

	@Input()
		requestedSubject: string;
}

@Pipe({
	name: 'simpleMd'
})
class MockSimpleMdPipe implements PipeTransform {
	transform(value: any, ...args: any[]): any {
		return `simple-md(${value}, ${args ? args.join(',') : ''})`;
	}
}


@Injectable()
class MockUserDataService {
	enrollInCourse = jest.fn(() => of({}));
	inquireInCourse = jest.fn(() => of({}));
	unenrollFromCourse = jest.fn(() => of({}));
	getCoursesProgress = jest.fn(() => of([]));
	getEnrolledCourses = jest.fn(() => of([]));
	getCourseProgress = jest.fn(() => of({}));
	getWithdrawalReasons = jest.fn(() => of([]));
	markCourseOpen = jest.fn(() => of(true));
	markFileDownload = jest.fn(() => of(true));
	markLectureOpen = jest.fn(() => of(true));
	mergeAccounts = jest.fn(() => of(true));
	markAccountIgnored = jest.fn(() => of(true));
	markAccountVerified = jest.fn(() => of({}));
	markCourseInquiry = jest.fn(() => of({}));
	markCourseStudyGroup = jest.fn(() => of({}));
	markProfileSubmit = jest.fn(() => of({}));
	postVideoProgress = jest.fn(() => of(42));
	getNoteInfo = jest.fn(() => of([]));
	getNote = jest.fn(() => of({}));
	getNotes = jest.fn(() => of([]));
	saveNote = jest.fn(() => of({}));
	getQuizResult = jest.fn(() => of({}));
	getQuizResults = jest.fn(() => of([]));
	recordQuiz = jest.fn(() => of({}));
	postBulkVideoProgress = jest.fn(() => of({}));
	processDiscourseSSO = jest.fn(() => of({}));
	getUserPreferences = jest.fn(() => of({}));
	saveUserPreferences = jest.fn(() => of({}));
	setUtmCodes = jest.fn();
}

@Injectable()
class MockCourseDataService {
	getKenticoObject = jest.fn(() => of(null));
	getKenticoObjects = jest.fn(() => of([]));
	getMultiMediaObjects = jest.fn(() => of([]));

	getPageAbout = jest.fn(() => of({meta_description: ''}));
	getPageDvdCatalog = jest.fn(() => of(null));
	getPageHelp = jest.fn(() => of(null));
	getPageHome = jest.fn(() => of(null));
	getPageLearn = jest.fn(() => of(null));
	getPagePolicies = jest.fn(() => of(null));
}

@NgModule({
	declarations: [
		MockAudioDownloadComponent,
		MockCourseCatalogEntryComponent,
		MockSimpleMdPipe,
		MockCompleteCertButtonComponent,
		MockCourseProgressComponent,
		MockKenticoButtonComponent,
		MockPasswordValidateListComponent,
		MockStickyElementComponent,
	],
	providers: [
		provideMockStore({initialState: mockInitialState}),
		{provide: CourseDataService, useClass: MockCourseDataService},
		{provide: UserDataService, useClass: MockUserDataService},
	],
	exports: [
		MockAudioDownloadComponent,
		MockCourseCatalogEntryComponent,
		MockSimpleMdPipe,
		MockCompleteCertButtonComponent,
		MockCourseProgressComponent,
		MockKenticoButtonComponent,
		MockPasswordValidateListComponent,
		MockStickyElementComponent,
	]
})
export class CustomMocksModule {}


export class MockStorage {
	key = jest.fn(num => '');
	getItem = jest.fn(() => {
		// console.log('called');
		return null;
	});
	setItem = jest.fn();
	clear = jest.fn();
	removeItem = jest.fn();
	length = 0;
}


@NgModule({
	declarations: [],
	providers: [
		{
			provide: LOCAL_STORAGE,
			useClass: MockStorage
		},
		{
			provide: SESSION_STORAGE,
			useClass: MockStorage
		},
		{
			provide: WindowBehaviorService,
			useValue: {
				isDesktop: jest.fn(() => false),
				setNewUrlHash: jest.fn(),
				loadNewUrl: jest.fn(),
				getCurrentUrl: jest.fn(() => ''),
				getPageYOffset: jest.fn(() => 0),
				scrollTo: jest.fn(),
			}
		},
		{
			provide: WindowTrackingService,
			useValue: {
				trackUrlChange: jest.fn(),
				trackUserIdentity: jest.fn(),
				trackEvent: jest.fn(),
			}
		},
		/*{
			provide: DOCUMENT,
			useValue: {
				title: '',
				body: {className: ''},
				head: {
					appendChild: jest.fn(),
				},
				getElementById: jest.fn(() => null),
				defaultView: null,
				querySelector: jest.fn(() => null),
				querySelectorAll: jest.fn(() => []),
				createElement: jest.fn(() => ({})),
			}
		}*/
	],
	exports: [],
})
export class MockBrowserAbstractionModule {}




export interface MockHcVideoPlayer extends Components.HcVideoPlayer {
	addEventListener: (event, handler) => void;
}

export function getMockHcVideoPlayer(): MockHcVideoPlayer {
	let _paused = false;

	return {
		playerTypePreference: ['v'],
		chapterStyle: 'popover-chapters',
		multimedia: null,
		multimediaId: '',

		getDuration: jest.fn(() => Promise.resolve(0)),

		getTime: jest.fn(() => {
			return Promise.resolve(0);
		}),

		getTitle: jest.fn(() => {
			return Promise.resolve('');
		}),

		isPaused: jest.fn(() => {
			return Promise.resolve(_paused);
		}),


		onAvailable: jest.fn(() => {
			console.log('called onAvailable');
			return Promise.resolve(undefined);
		}),

		pause: jest.fn(() => {
			_paused = true;
			return Promise.resolve(undefined);
		}),

		play: jest.fn(() => {
			_paused = false;
			return Promise.resolve(undefined);
		}),

		setControlsEnabled: jest.fn((enabled) => {
			return Promise.resolve(undefined);
		}),

		setTime: jest.fn((timestamp) => {
			return Promise.resolve(undefined);
		}),

		addEventListener: jest.fn((event, handler) => {}),

		getPlaybackRate: jest.fn(() => Promise.resolve(1)),
		setPlaybackRate: jest.fn(r => Promise.resolve(r)),
		getVolume: jest.fn(() => Promise.resolve(1)),
		setVolume: jest.fn(r => Promise.resolve(r)),
		getCaptionLanguage: jest.fn(() => Promise.resolve(null)),
		setCaptionLanguage: jest.fn(r => Promise.resolve(r)),
		force360p: false
	};
}

export function getMockUser(value: any): User {
	return {
		id: 'face',
		email: '',
		username: 'face@test.com',
		firstname: '',
		lastname: '',
		address: '',
		city: '',
		state: '',
		zip: '',
		title: '',
		userType: UserType.Email,
		...value
	};
}

