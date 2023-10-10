require('fake-indexeddb/auto');
import * as actions from './actions';
import {lastValueFrom, from, Observable} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {CustomMocksModule, MockBrowserAbstractionModule} from '../../../test.helpers';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../index';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {OfflineDbEffects} from './effects';
import {UserDataService} from '../../services/user-data.service';
import {ToastrService} from 'ngx-toastr';
import {RouterTestingModule} from '@angular/router/testing';
import {RxjsHelperService} from '../../services/rxjs-helper.service';
import {ApplicationRef} from '@angular/core';
import {HttpClient, HttpHandler} from '@angular/common/http';


describe('Offline effects tests', () => {
	let effects: OfflineDbEffects;
	let testScheduler: RxjsTestScheduler;
	let store;
	let actions$: Observable<Action> = new Observable<Action>();
	let userDataService: UserDataService;
	let toastr: ToastrService;
	let appRef: ApplicationRef;
	let httpService: HttpClient;


	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				provideMockStore({initialState: mockInitialState}),
				provideMockActions(() => actions$),
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn(), info: jest.fn()}},
				RxjsHelperService,
				OfflineDbEffects,
				HttpClient,
				HttpHandler
			],
			imports: [
				CustomMocksModule,
				MockBrowserAbstractionModule,
				RouterTestingModule,
			]
		});
		appRef = TestBed.inject(ApplicationRef) as ApplicationRef;
		store = TestBed.inject(Store) as MockStore<State>;
		store.setState({
			...store.lastState,
			user: {
				...store.lastState.user,
				currentUser: {
					...store.lastState.user.currentUser,
					id: 'MockUserId'
				}
			}
		});
		toastr = TestBed.inject(ToastrService) as ToastrService;
		httpService = TestBed.inject(HttpClient) as HttpClient;
		TestBed.inject(HttpHandler);
		userDataService = TestBed.inject(UserDataService) as UserDataService;
		effects = TestBed.inject(OfflineDbEffects) as OfflineDbEffects;
		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});


	});

	afterEach(() => {
	});

	const vpi = {
		userId: 'MockUserId',
		courseId: 'MockCourseId',
		contentId: 'MockContentId',
		videoId: 'MockVideoId',
		progress: 50,
		eventTime: Date.now(),
		lectureType: 'lecture'
	};

	it('should be created', () => {
		expect(effects).toBeTruthy();
	});

	it('saveVideoPostInfo$ should return UploadVideoPostInfos', async () => {

		const spyer = jest.spyOn(effects.db, 'saveVideoPostInfo');

		actions$ = from([actions.saveVideoPostInfo(vpi), actions.saveVideoPostInfo(vpi)]);

		await lastValueFrom(effects.saveVideoPostInfo$);

		const expectedResult1 = {
			...vpi,
			synced: false,
			type: '[Offline] Sync VideoPostInfo',
			id: 1
		};

		const expectedResult2 = {
			...expectedResult1,
			id: 2
		};

		expect(spyer).toHaveBeenCalledTimes(2);
		const x = spyer.mock.calls;
		expect(spyer.mock.calls).toEqual([[expectedResult1], [expectedResult2]]);
	});

	it('groupByArray test - using property name', () => {
		const test = [
			{category: 'fruit', name: 'orange'},
			{category: 'fruit', name: 'apple'},
			{category: 'fruit', name: 'pear'},
			{category: 'vegetable', name: 'cucumber'},
			{category: 'vegetable', name: 'carrot'},
			{category: 'vegetable', name: 'broccoli'},
			{category: 'meat', name: 'beef'},
			{category: 'meat', name: 'chicken'}];

		const groups = effects.groupByArray(test, 'category');

		expect(groups.length).toEqual(3);
		expect(groups.filter(x => x.key === 'fruit')[0].values.length).toEqual(3);
		expect(groups.filter(x => x.key === 'vegetable')[0].values.length).toEqual(3);
		expect(groups.filter(x => x.key === 'meat')[0].values.length).toEqual(2);
	});

	it('groupByArray test - using projection function', () => {
		const test = [
			{category: 'fruit', name: 'orange'},
			{category: 'fruit', name: 'apple'},
			{category: 'fruit', name: 'pear'},
			{category: 'vegetable', name: 'cucumber'},
			{category: 'vegetable', name: 'carrot'},
			{category: 'vegetable', name: 'broccoli'},
			{category: 'meat', name: 'beef'},
			{category: 'meat', name: 'chicken'}];

		const projectionFunction = (x: {category: string, name: string}) => x.category.charAt(1);

		const groups = effects.groupByArray(test, projectionFunction);

		expect(groups.length).toEqual(2);
		expect(groups.filter(x => x.key === 'r')[0].values.length).toEqual(3);
		expect(groups.filter(x => x.key === 'e')[0].values.length).toEqual(5);
	});



});

