import {TestBed} from '@angular/core/testing';

import {RxjsHelperService, ServerRxjsHelperService} from './rxjs-helper.service';
import * as uiActions from '../state/ui/actions';
import * as actions from '../state/app-update/actions';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {Observable} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {AppUpdateEffects} from '../state/app-update/effects';
import {provideMockActions} from '@ngrx/effects/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../state';
import {RxNgZoneScheduler} from 'ngx-rxjs-zone-scheduler';
import {ServiceWorkerModule, SwUpdate} from '@angular/service-worker';
import {RouterTestingModule} from '@angular/router/testing';
import * as userActions from '../state/user/actions';
import * as courseActions from '../state/courses/actions';
import * as quizActions from '../state/quizzes/actions';
import {QuizEffects} from '../state/quizzes/effects';
import {UserDataService} from './user-data.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {UtmService} from './utm.service';
import {InjectFlags, InjectionToken} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

jest.mock('./user-data.service');

describe('Rxjs Helper Services', () => {
	let service: RxjsHelperService;
	let testScheduler: RxjsTestScheduler;
	let actions$ = new Observable<Action>();

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				RxjsHelperService,
				ServerRxjsHelperService,
				provideMockActions(() => actions$),

				// throttle
				provideMockStore({initialState: mockInitialState}),
				RxNgZoneScheduler,
				AppUpdateEffects,
				SwUpdate,

				// debounce
				{provide: Storage, useValue: new InjectionToken('SessionStorage')},
				QuizEffects,
				HttpClient,
				HttpHandler,
				{provide: UtmService, useValue: jest.mocked(UtmService)},
				UserDataService,
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn()}},
			],
			imports: [
				ServiceWorkerModule.register('ngsw-worker.js', {enabled: true}),
				RouterTestingModule,
			]
		});
		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});
	});

	describe('RxjsHelperService - throttle', () => {
		const testName = 'should do throttle';
		const inputMarbles = 'a 1s a 1s a';
		const expectedMarbles = 'a';
		const injectRxjsHelperService = () => {
			service = TestBed.inject(RxjsHelperService);
		};

		let effects: AppUpdateEffects;

		beforeEach(() => {
			injectRxjsHelperService();
			effects = TestBed.inject(AppUpdateEffects) as AppUpdateEffects;
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		it(testName, () => {
			testScheduler.run(({hot, expectObservable}) => {
				actions$ = hot(inputMarbles, {
					a: uiActions.openModal(),
				});
				expectObservable(effects.userActive$).toBe(expectedMarbles, {
					a: actions.userActivity({description: uiActions.openModal.type}),
				});
			});
		});
	});

	describe('ServerRxjsHelperService - throttle', () => {
		const testName = 'Server version: should NOT do throttle';
		const inputMarbles = 'a 1s a 1s a';
		const expectedMarbles = 'a 1s a 1s a';
		const injectRxjsHelperService = () => {
			// Override the RxjsHelperService with the server version to test the difference
			TestBed.overrideProvider(RxjsHelperService, {useValue: new ServerRxjsHelperService()});
			service = TestBed.inject(RxjsHelperService);
		};

		let effects: AppUpdateEffects;

		beforeEach(() => {
			injectRxjsHelperService();
			effects = TestBed.inject(AppUpdateEffects) as AppUpdateEffects;
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		it(testName, () => {
			testScheduler.run(({hot, expectObservable}) => {
				actions$ = hot(inputMarbles, {
					a: uiActions.openModal(),
				});
				expectObservable(effects.userActive$).toBe(expectedMarbles, {
					a: actions.userActivity({description: uiActions.openModal.type}),
				});
			});
		});

	});

	describe('RxjsHelperService - debounce', () => {
		const testName = 'debounce should prevent second setCourseDetails';
		const inputMarbles = 'a 1s b 200ms c';
		const expectedMarbles = '2202ms c';
		const injectRxjsHelperService = () => {
			service = TestBed.inject(RxjsHelperService);
		};

		let effects: QuizEffects;
		let store;
		let userDataService;
		let sessionStorage;

		beforeEach(() => {
			injectRxjsHelperService();
			store = TestBed.inject(Store) as MockStore<State>;
			sessionStorage = TestBed.inject(Storage);
			userDataService = TestBed.inject(UserDataService);
			effects = TestBed.inject<QuizEffects>(QuizEffects);
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		const setupQuizLoaderActions = hot => {
			actions$ = hot(inputMarbles, {
				a: userActions.userSetDetails({user: {id: '1'} as any}),
				b: courseActions.setCourseDetails({course: {system_id: '1'} as any}),
				c: courseActions.setCourseDetails({course: {system_id: '234'} as any}),
			});
		};
		it(testName, () => {
			store.setState({
				...store.lastState,
				user: {
					currentUser: {
						id: '1',
					}
				}
			});
			testScheduler.run(({hot, expectObservable}) => {
				setupQuizLoaderActions(hot);
				expectObservable(effects.quizLoader$).toBe(expectedMarbles, {
					b: quizActions.getCourseQuizResults({courseId: '1'}),
					c: quizActions.getCourseQuizResults({courseId: '234'}),
				});
			});
		});
	});

	describe('ServerRxjsHelperService - debounce', () => {
		const testName = 'Server version: debouncing should NOT happen';
		const inputMarbles = 'a 1s b 200ms c';
		const expectedMarbles = '1s - b 200ms c';
		const injectRxjsHelperService = () => {
			// Override the RxjsHelperService with the server version to test the difference
			TestBed.overrideProvider(RxjsHelperService, {useValue: new ServerRxjsHelperService()});
			service = TestBed.inject(RxjsHelperService);
		};

		let effects: QuizEffects;
		let store;
		let userDataService;
		let sessionStorage;

		beforeEach(() => {
			injectRxjsHelperService();
			store = TestBed.inject(Store) as MockStore<State>;
			sessionStorage = TestBed.inject(Storage);
			userDataService = TestBed.inject(UserDataService);
			effects = TestBed.inject<QuizEffects>(QuizEffects);
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		const setupQuizLoaderActions = hot => {
			actions$ = hot(inputMarbles, {
				a: userActions.userSetDetails({user: {id: '1'} as any}),
				b: courseActions.setCourseDetails({course: {system_id: '1'} as any}),
				c: courseActions.setCourseDetails({course: {system_id: '234'} as any}),
			});
		};
		it(testName, () => {
			store.setState({
				...store.lastState,
				user: {
					currentUser: {
						id: '1',
					}
				}
			});
			testScheduler.run(({hot, expectObservable}) => {
				setupQuizLoaderActions(hot);
				expectObservable(effects.quizLoader$).toBe(expectedMarbles, {
					b: quizActions.getCourseQuizResults({courseId: '1'}),
					c: quizActions.getCourseQuizResults({courseId: '234'}),
				});
			});
		});
	});


});
