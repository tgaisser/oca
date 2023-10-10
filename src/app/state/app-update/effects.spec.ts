import {Observable} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {CustomMocksModule, MockBrowserAbstractionModule} from '../../../test.helpers';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../index';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {AppUpdateEffects} from './effects';
import {RxNgZoneScheduler} from 'ngx-rxjs-zone-scheduler';
import {CheckForUpdateService} from '../../services/check-for-update.service';
import * as actions from './actions';
import * as coursesActions from '../courses/actions';
import * as enrollmentActions from '../enrollment/actions';
import * as notesActions from '../notes/actions';
import * as quizzesActions from '../quizzes/actions';
import * as uiActions from '../ui/actions';
import * as userActions from '../user/actions';
import {UserDataService} from '../../services/user-data.service';
import {ToastrService} from 'ngx-toastr';
import {NavigationStart, provideRoutes, Router} from '@angular/router';
import {ServiceWorkerModule, SwUpdate} from '@angular/service-worker';
import {RouterTestingModule} from '@angular/router/testing';
import {RxjsHelperService} from '../../services/rxjs-helper.service';
import {ApplicationRef} from '@angular/core';
describe('AppUpdate effects', () => {
	let effects: AppUpdateEffects;
	let testScheduler: RxjsTestScheduler;
	let store: Store;
	let actions$ = new Observable<Action>();
	let userDataService: UserDataService;
	let toastr: ToastrService;
	let swUpdate: SwUpdate;
	let service: CheckForUpdateService;
	let appRef: ApplicationRef;

	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				provideMockStore({initialState: mockInitialState}),
				RxNgZoneScheduler,
				provideMockActions(() => actions$),
				CheckForUpdateService,
				SwUpdate,
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn(), info: jest.fn()}},
				RxjsHelperService,
				AppUpdateEffects
			],
			imports: [
				CustomMocksModule,
				MockBrowserAbstractionModule,
				ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }),
				RouterTestingModule,
			]
		});
		appRef = TestBed.inject(ApplicationRef) as ApplicationRef;
		swUpdate = TestBed.inject(SwUpdate) as SwUpdate;
		store = TestBed.inject(Store) as Store;
		toastr = TestBed.inject(ToastrService) as ToastrService;
		swUpdate = TestBed.inject(SwUpdate) as SwUpdate;

		userDataService = TestBed.inject(UserDataService) as UserDataService;
		service = TestBed.inject(CheckForUpdateService) as CheckForUpdateService;
		effects = TestBed.inject(AppUpdateEffects) as AppUpdateEffects;
		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

	});

	afterEach(() => {
	});

	it('should be created', () => {
		expect(effects).toBeTruthy();
	});

	it('userActive$ should emit userActivity action', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('a', {
				a: uiActions.openModal(),
			});
			expectObservable(effects.userActive$).toBe('a', {
				a: actions.userActivity({description: uiActions.openModal.type}),
			});
		});

	});

	// it('userActivityTimeout$ should set userInactive to true after inactivity timeout', () => {
	// 	testScheduler.run(({hot, expectObservable}) => {
	// 		actions$ = hot('a', {
	// 			a: actions.userActivity({description: 'abcdefg'}),
	// 		});
	// 		expectObservable(effects.userActivityTimeout$).toBe('15m a', {
	// 			a: actions.userInactive({userInactive: true}),
	// 		});
	// 	});
	//
	// });

	it('doUpdate$ should not emit', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('a-b', {
				a: actions.updateIsAvailable(),
				b: actions.userInactive({userInactive: true}),
			});
			expectObservable(effects.doUpdate$).toBe('', {
			});
		});
	});




});
