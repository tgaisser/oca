import {createSpyObj, CustomMocksModule} from '../../../test.helpers';
import {Observable} from 'rxjs';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {Action, Store} from '@ngrx/store';
import {fakeAsync, TestBed} from '@angular/core/testing';
import {AnalyticsEffects} from './effects';
import {provideMockActions} from '@ngrx/effects/testing';
import {MockStore} from '@ngrx/store/testing';
import {UserDataService} from '../../services/user-data.service';
import {State} from '../index';
import {RouterTestingModule} from '@angular/router/testing';
import {Angulartics2GoogleTagManager,Angulartics2Module} from 'angulartics2';

import * as courseActions from '../courses/actions';
import {WindowTrackingService} from '../../services/window-tracking.service';
import {tap} from 'rxjs/operators';
import {RxNgZoneScheduler} from 'ngx-rxjs-zone-scheduler';
import {SESSION_STORAGE} from '../../common/models';

describe('Analytics effects', () => {
	let effects;

	let actions$ = new Observable<Action>();
	let testScheduler;
	let store;
	let userDataService;
	let trackingService;


	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				AnalyticsEffects,
				provideMockActions(() => actions$),
				RxNgZoneScheduler,
				{provide: SESSION_STORAGE, useValue: {
					key: num => '',
					getItem: jest.fn(() => null),
					setItem: jest.fn((key, val) => {}),
					clear: jest.fn(() => {}),
					removeItem: jest.fn(key => {}),
					length: 0,
				}
				}
			],
			imports: [
				CustomMocksModule,
				RouterTestingModule,
				Angulartics2Module.forRoot(),
			],
		});

		effects = TestBed.inject<AnalyticsEffects>(AnalyticsEffects);
		store = TestBed.inject<Store>(Store) as MockStore<State>;
		userDataService = TestBed.inject<UserDataService>(UserDataService);
		trackingService = TestBed.inject<WindowTrackingService>(WindowTrackingService);
		jest.spyOn(trackingService, 'trackEvent');

		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

	});
	// {provide: Angulartics2GoogleTagManager, useValue: createSpyObj('Angulartics2GoogleTagManager', ['startTracking'])},

	it.todo('should accountCreate$');

	it.todo('should accountSet$');

	it('landingPageLoad$ should send events for which landing page version was selected', () => {
		expect(true).toBe(true);

		const res = [];

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a-b-c 90s d', {
				a: courseActions.landingPageLoaded({hasUtm: true, version: 'A'}),
				b: courseActions.landingPageLoaded({hasUtm: true, version: 'B'}),
				c: courseActions.landingPageLoaded({hasUtm: true, version: 'C'}),
				d: courseActions.landingPageLoaded({hasUtm: true, version: 'A'})
			}
			);
			expectObservable(effects.landingPageLoad$.pipe(
				//stash the current info to a tracker so that we can check both status and times later
				tap(r => {
					res.push({frame: testScheduler.frame, calls: trackingService.trackEvent.mock.calls.slice()});
					trackingService.trackEvent.mockClear();
				})
			)).toBe('-a-b-c 90s d', {
				a: expect.any(Object),
				b: expect.any(Object),
				c: expect.any(Object),
				d: expect.any(Object)
			});

			testScheduler.flush();
			const createLandingPageTest = version => [[{'Landing-Template-Version': version}], [{event: 'landingPageABView'}]];


			expect(res).toEqual([
				{frame: 1, calls: createLandingPageTest('A')},
				{frame: 3, calls: createLandingPageTest('B')},
				{frame: 5, calls: createLandingPageTest('C')},
				{frame: 90006, calls: createLandingPageTest('A')},
			]);
		});
	});

	it.todo('should accountUpdated$');

	it.todo('should donationClicks$');

	it.todo('should pdfDownloaded$');

	it.todo('should audioDownloaded$');

	it.todo('should userLogIn$');

	it.todo('should landingPageLoad$');

	it.todo('should enrollInCourse$');

	it.todo('should videoPlay$');

	it.todo('should videoProgress$');

	it.todo('should videoComplete$');
});
