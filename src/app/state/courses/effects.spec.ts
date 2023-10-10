import {from, firstValueFrom, lastValueFrom, Observable, of, throwError} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {createRetryableStream, createSpyWithMultipleObservableValues, CustomMocksModule} from '../../../test.helpers';
import {MockStore} from '@ngrx/store/testing';
import {State} from '../index';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {CourseEffects} from './effects';
import {CourseDataService} from '../../services/course-data.service';
import {UserDataService} from '../../services/user-data.service';
import {RxNgZoneScheduler} from 'ngx-rxjs-zone-scheduler';

import * as courseActions from './actions';
import * as offlineActions from '../offline/actions';
import {setCurrentLessonItem, VideoPostInfo} from './actions';
import * as userActions from '../user/actions';

describe('Courses effects', () => {
	let effects;

	let actions$ = new Observable<Action>();
	let testScheduler;
	let store;
	let courseDataService;
	let userDataService;
	let zoneScheduler;


	const mockUser = () => {
		store.setState({
			...store.lastState,
			user: {
				...store.lastState.user,
				currentUser: true,
			}
		});
	};

	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				CourseEffects,
				provideMockActions(() => actions$),
				RxNgZoneScheduler
			],
			imports: [
				CustomMocksModule
			]
		});

		effects = TestBed.inject<CourseEffects>(CourseEffects);
		store = TestBed.inject(Store) as MockStore<State>;
		courseDataService = TestBed.inject(CourseDataService);
		userDataService = TestBed.inject(UserDataService);

		zoneScheduler = TestBed.inject(RxNgZoneScheduler);
		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

	});

	afterEach(() => {
	});

	it('getCourses$ should trigger lookup every 90 sec', () => {
		const courses = [1, 2];
		const req = courseActions.courseListRequested();
		const exp = courseActions.courseListReceived({courses: courses as any});
		const query = {depth: 0, type: 'course'};

		courseDataService.getKenticoObjects = jest.fn(() => of([1, 2]));
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a-b-c 90s d', {a: req, b: req, c: req, d: req});
			expectObservable(effects.getCourses$).toBe('-x 4ms 90s y', {x: exp, y: exp});

			testScheduler.flush();

			expect(courseDataService.getKenticoObjects.mock.calls).toEqual([[query], [query]]);
		});
	});

	it('getCourses$ should swallow errors and retry twice', () => {
		const req = courseActions.courseListRequested();
		const query = {depth: 0, type: 'course'};

		const req1 = createRetryableStream(throwError(() => new Error('')), throwError(() => new Error('')), throwError(() => new Error('')));
		const req2 = createRetryableStream(throwError(() => new Error('')), throwError(() => new Error('')), throwError(() => new Error('')));
		const req3 = createRetryableStream(throwError(() => new Error('')), of([1, 2]));

		let numCallsToMock = 0;
		courseDataService.getKenticoObjects = jest.fn(() => {
			numCallsToMock++;
			if (numCallsToMock === 1) return req1.stream;
			if (numCallsToMock === 2) return req2.stream;
			return req3.stream;
		});

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a 90s b 90s c|', {a: req, b: req, c: req});
			expectObservable(effects.getCourses$).toBe('-- 90s - 90s x|', {x: courseActions.courseListReceived({courses: [1, 2] as any})});

			testScheduler.flush();

			expect(req1.calls).toBe(3);
			expect(req2.calls).toBe(3);
			expect(req3.calls).toBe(2);
			expect(courseDataService.getKenticoObjects.mock.calls).toEqual([[query], [query], [query]]);
		});
	});

	it('getStudyGroup$ should trigger study group retrieval', () => {
		const mm = [1, 2];
		const req = courseActions.getStudyGroups();
		const exp = courseActions.setStudyGroups({studyGroups: mm as any});

		courseDataService.getKenticoObjects = jest.fn(() => of([1, 2]));
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a-b 10m d', {a: req, b: req, d: req});
			expectObservable(effects.getStudyGroups$).toBe('-x 2ms 10m y', {x: exp, y: exp});

			testScheduler.flush();

			expect(courseDataService.getKenticoObjects).toHaveBeenCalledTimes(2);
		});
	});

	it('getMultimedia$ should trigger multimedia retrieval', () => {
		const mm = [1, 2];
		const req = courseActions.getMultimedia();
		const exp = courseActions.setMultimedia({multimedia: mm as any});

		courseDataService.getMultiMediaObjects = jest.fn(() => of([1, 2]));
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a-b 10m d', {a: req, b: req, d: req});
			expectObservable(effects.getMultimedia$).toBe('-x 2ms 10m y', {x: exp, y: exp});

			testScheduler.flush();

			expect(courseDataService.getMultiMediaObjects).toHaveBeenCalledTimes(2);
		});
	});


	it('getMultimedia$ should swallow errors and retry twice', () => {
		const mm = [1, 2];
		const req = courseActions.getMultimedia();
		const exp = courseActions.setMultimedia({multimedia: mm as any});

		const req1 = createRetryableStream(throwError(() => new Error('')), throwError(() => new Error('')), throwError(() => new Error('')));
		const req2 = createRetryableStream(throwError(() => new Error('')), of(mm));

		let numCallsToMock = 0;
		courseDataService.getMultiMediaObjects = jest.fn(() => {
			numCallsToMock++;
			if (numCallsToMock === 1) return req1.stream;
			return req2.stream;
		});

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a 10m b|', {a: req, b: req});
			expectObservable(effects.getMultimedia$).toBe('-- 10m x|', {x: exp});

			testScheduler.flush();

			expect(req1.calls).toBe(3);
			expect(req2.calls).toBe(2);
			expect(courseDataService.getMultiMediaObjects).toHaveBeenCalledTimes(2);
		});
	});

	it('getCoursesProgress$ should translate to progress lookup every 10s and swallow errors', () => {
		const prog = [1, 2];
		const req = courseActions.getCoursesProgress();
		const exp = courseActions.setCoursesProgress({progress: prog as any});

		mockUser();

		let mockCalls = 0;
		userDataService.getCoursesProgress = jest.fn(() => {
			if (++mockCalls === 3) {
				return throwError(() => new Error(''));
			}
			return of(prog);
		});
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a 2s a 4s a 4s a 20s a|', {a: req});
			expectObservable(effects.getCoursesProgress$).toBe('-x - 10s - x 20s -|', {x: exp});

			testScheduler.flush();

			expect(userDataService.getCoursesProgress).toHaveBeenCalledTimes(3);
		});
	});
	it('getCoursesProgress$ should be empty if no user', () => {
		const req = courseActions.getCoursesProgress();

		userDataService.getCourseProgress = jest.fn(() => of([1, 2]));
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a 10s a|', {a: req});
			expectObservable(effects.getCoursesProgress$).toBe('-- 10s -|');

			testScheduler.flush();

			expect(userDataService.getCourseProgress).toHaveBeenCalledTimes(0);
		});
	});

	it('mapCurrentItemToGetDetails$ should translate setCurrentCourse to getCourseDetails', () => {
		const slugs = ['slug1', 'slug2', 'slug', 'slug1'];
		const createSet = idx => courseActions.setCurrentCourse({currentCourse: slugs[idx]});
		const createGet = idx => courseActions.getCourseDetails({courseCodename: 'codename', courseSlug: slugs[idx]});
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-ab-c 90s d', {
				a: createSet(0),
				b: createSet(1),
				c: createSet(2),
				d: createSet(3),
			});
			expectObservable(effects.mapCurrentItemToGetDetails$).toBe('-wx-y 90s z', {
				w: createGet(0),
				x: createGet(1),
				y: createGet(2),
				z: createGet(3),
			});
		});
	});

	it('mapSetDetailsToProgress$ should grab current user progress and mark course open on setCourseDetails', () => {
		userDataService.getCourseProgress = createSpyWithMultipleObservableValues([
			of(42),
			of(32),
			of(null),
			throwError(() => new Error('')),
		]);

		mockUser();

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a--b 5s c 90s d--e 10s f|', {
				a: courseActions.courseOpened({courseId: '1'}),
				b: courseActions.courseOpened({courseId: '2'}),
				c: courseActions.courseOpened({courseId: '3'}),
				d: courseActions.courseOpened({courseId: null}),
				e: courseActions.courseOpened({courseId: '4'}),
				f: courseActions.courseOpened({courseId: '2'}),
			});
			expectObservable(effects.mapSetDetailsToProgress$).toBe('-x--- 5s y 100s -----|', {
				x: courseActions.setCourseProgress({progress: 42 as any}),
				y: courseActions.setCourseProgress({progress: 32 as any}),
			});

			testScheduler.flush();

			expect(userDataService.getCourseProgress.mock.calls).toEqual([['1'], ['3'], ['4'], ['2']]);
		});
	});

	it('handleCourseOpened$ should proxy requests to markCourseOpen', async () => {
		mockUser();
		const actionList = {
			a: courseActions.courseOpened({courseId: '1'}),
			b: courseActions.courseOpened({courseId: '2'}),
			c: courseActions.courseOpened({courseId: '3'}),
			d: courseActions.courseOpened({courseId: null}),
			e: courseActions.courseOpened({courseId: '4'}),
			f: courseActions.courseOpened({courseId: '2'}),
		};

		const timing = '-a--b 5s c 90s d--e 10s f|';

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot(timing, actionList);
			expectObservable(effects.handleCourseOpened$).toBe('-a--- 5s - 90s ---e 10s f|', {
				a: expect.any(Object),
				b: expect.any(Object),
				c: expect.any(Object),
				d: expect.any(Object),
				e: expect.any(Object),
				f: expect.any(Object),
			});

			testScheduler.flush();

			expect(userDataService.markCourseOpen.mock.calls).toEqual([['1'], ['4'], ['2']]);
		});

		// actions$ = from([
		// 	courseActions.courseOpened({courseId: '1'}),
		// 	courseActions.courseOpened({courseId: null}),
		// 	courseActions.courseOpened({courseId: '2'}),
		// ]);

		//await effects.handleCourseOpened$.toPromise();
		//expect(userDataService.markCourseOpen.mock.calls).toEqual([['1'], ['2']]);
	});

	it('handleCourseOpened$ should do nothing if no user', async () => {
		actions$ = from([
			courseActions.courseOpened({courseId: '1'}),
			courseActions.courseOpened({courseId: null}),
		]);

		await firstValueFrom(effects.handleCourseOpened$).catch(e => true);
		expect(userDataService.markCourseOpen.mock.calls).toEqual([]);
	});

	it('mapSetDetailsToProgress$ should do nothing if no user', () => {

		userDataService.getCourseProgress = createSpyWithMultipleObservableValues([
			of(42),
			of(32),
			of(null),
		]);

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-ab-c 90s d', {
				a: courseActions.setCourseDetails({course: {system_id: 1} as any}),
				b: courseActions.setCourseDetails({course: {system_id: 2} as any}),
				c: courseActions.setCourseDetails({course: {system_id: 3} as any}),
				d: courseActions.setCourseDetails({course: null})
			});
			expectObservable(effects.mapSetDetailsToProgress$).toBe('----- 90s -');
			testScheduler.flush();

			expect(userDataService.getCourseProgress).toHaveBeenCalledTimes(0);
			expect(userDataService.markCourseOpen).toHaveBeenCalledTimes(0);
		});
	});


	it('getCourseDetails$ request course info if not already present', () => {
		courseDataService.getKenticoObjects = createSpyWithMultipleObservableValues([
			of([{system_id: '1'}]),
			of([{system_id: '2'}, {system_id: '3'}]),
			throwError(() => new Error('')),
			of([]),
			of([{system_id: '5'}])
		]);

		const exp = {slug: '', depth: 3, type: 'course'};

		//stupid timing https://stackoverflow.com/questions/50406951/how-to-test-observables-which-emit-grouped-events-with-rxjs-marbles
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a 10ms b-c- 90s d--(e|)', {
				a: courseActions.getCourseDetails({courseSlug: '1', courseCodename: ''}),
				b: courseActions.getCourseDetails({courseSlug: '2', courseCodename: ''}),
				c: courseActions.getCourseDetails({courseSlug: '3', courseCodename: ''}),
				d: courseActions.getCourseDetails({courseSlug: '4', courseCodename: ''}),
				e: courseActions.getCourseDetails({courseSlug: '5', courseCodename: ''}),
			});
			expectObservable(effects.getCourseDetails$).toBe('-(xa) 7ms (yb) 90s ---(zc|)', {
				x: courseActions.setCourseDetails({course: {system_id: '1'} as any}),
				a: courseActions.courseOpened({courseId: '1'}),
				y: courseActions.setCourseDetails({course: {system_id: '2'} as any}),
				b: courseActions.courseOpened({courseId: '2'}),
				z: courseActions.setCourseDetails({course: {system_id: '5'} as any}),
				c: courseActions.courseOpened({courseId: '5'}),
			});

			testScheduler.flush();

			expect(courseDataService.getKenticoObjects.mock.calls).toEqual([
				[{...exp, slug: '1'}],
				[{...exp, slug: '2'}],
				[{...exp, slug: '3'}],
				[{...exp, slug: '4'}],
				[{...exp, slug: '5'}],
			]);
		});
	});
	it('getCourseDetails$ should emit opens if course already present', () => {
		store.setState({
			...store.lastState,
			course: {
				...store.lastState,
				courseDetails: {c1: {system_id: '1'}}
			}
		});

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a--- 90s ----|', {
				a: courseActions.getCourseDetails({courseSlug: 'c1', courseCodename: ''}),
			});
			expectObservable(effects.getCourseDetails$).toBe('-x--- 90s ----|', {
				x: courseActions.courseOpened({courseId: '1'})
			});

			testScheduler.flush();

			expect(courseDataService.getKenticoObjects).not.toHaveBeenCalled();
		});
	});

	it('markLectureOpenEvent$ should ping API to mark opens on setCurrentLessonItem', async () => {
		store.setState({
			...store.lastState,
			course: {
				...store.lastState.course,
				courseDetails: {a: {system_id: 42}},
				currentCourse: 'a'
			}
		});

		actions$ = from([
			setCurrentLessonItem({item: {system_id: 1} as any, itemType: 'qa'}),
			setCurrentLessonItem({item: {system_id: 2} as any, itemType: 'nope'}),
			setCurrentLessonItem({item: {system_id: 3} as any, itemType: 'lecture'}),
			setCurrentLessonItem({item: {system_id: 4} as any, itemType: 'nah'}),
		]);

		await lastValueFrom(effects.markLectureOpenEvent$);


		expect(userDataService.markLectureOpen.mock.calls).toEqual([[42, 1], [42, 3]]);
	});

	// eventType: setVideoProgress or setVideoProgressForce
	const runPostTests = (eventType, effect$, mapper, expectedTimeline, expectedMapper, responseType) => {
		jest.spyOn(effects, 'postVideoProgressFn').mockImplementation((a) => of(responseType(a)));

		store.setState({
			...store.lastState,
			course: {
				...store.lastState.course,
				videoPostTimes: {
					a: 1,
					b: 42,
				}
			},
			user: {
				...store.lastState.user,
				currentUser: {
					...store.lastState.user.currentUser,
					id: '1'
				}
			}
		});

		const events = [
			eventType({userId: '1', eventTime: 1, contentId: '1', courseId: '1', videoId: 'a', progress: 2, lectureType: 'lecture'}),
			eventType({userId: '1', eventTime: 2, contentId: '1', courseId: '1', videoId: 'a', progress: 2, lectureType: 'lecture'}),
			eventType({userId: '1', eventTime: 1, contentId: '1', courseId: '1', videoId: 'b', progress: 1, lectureType: 'lecture'}),
			eventType({userId: '1', eventTime: 1, contentId: '1', courseId: '1', videoId: 'c', progress: 1, lectureType: 'lecture'}),
		];

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a- 10s b 20s c 15s d 30s |', {a: events[0], b: events[1], c: events[2], d: events[3]});

			expectObservable(effect$).toBe(expectedTimeline, expectedMapper(events));

			testScheduler.flush();
			expect(effects.postVideoProgressFn.mock.calls).toEqual(
				mapper(events)
			);
		});
	};

	// Stuck on testing an effect that runs sampleTime outside NgZone...
	it.skip('postVideoProgress$ should trigger saveVideoPostInfo Action', fakeAsync( () => {

		jest.setTimeout(14000);

		// const spyer = jest.spyOn(zoneScheduler, 'leaveNgZone');

		store.setState({
			...store.lastState,
			user: {
				...store.lastState.user,
				currentUser: {
					...store.lastState.user.currentUser,
					id: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'
				}
			}
		});

		const testVidPostInfo: VideoPostInfo = {
			userId: null,
			contentId: '8f8e71f6-372a-45dc-aded-8f95c73f2e88',
			videoId: '3ef132b3-eb22-4d3b-9603-c22f364834fa',
			eventTime: 1636143990000,
			progress: 150.176,
			courseId: '',
			lectureType: 'lecture'
		};

		actions$ = from([courseActions.setVideoProgress(testVidPostInfo)]);

		let output;
		effects.postVideoProgress$.subscribe((res) => {
			console.log('yo');
			output = res;
		});

		expect(output).toBeUndefined();

		tick(19000);

		expect(output).toEqual({});

		// expect(spyer).toHaveBeenCalledTimes(1);


		// expect(spyer).toHaveBeenCalledTimes(2);
		// const x = spyer.mock.calls;
		// expect(spyer.mock.calls).toEqual([[expectedResult1], [expectedResult2]]);
		//
		// testScheduler.run(({hot, expectObservable}) => {
		// 	actions$ = hot('-a- 10s -b- 10s -c-', {
		// 		a: courseActions.setVideoProgress(testVidPostInfo),
		// 		b: courseActions.setVideoProgress(testVidPostInfo),
		// 		c: courseActions.setVideoProgress(testVidPostInfo),
		// 	});
		//
		// 	expectObservable(effects.postVideoProgress$).toBe('-x- 10s -y- 10s -z-', {
		// 		x: offlineActions.saveVideoPostInfo({...testVidPostInfo, userId: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'}),
		// 		y: offlineActions.saveVideoPostInfo({...testVidPostInfo, userId: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'}),
		// 		z: offlineActions.saveVideoPostInfo({...testVidPostInfo, userId: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'}),
		// 	});
		// });
	}));


	it('postVideoProgressForce$ should trigger saveVideoPostInfo Action', () => {
		store.setState({
			...store.lastState,
			user: {
				...store.lastState.user,
				currentUser: {
					...store.lastState.user.currentUser,
					id: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'
				}
			}
		});

		const testVidPostInfo: VideoPostInfo = {
			userId: null,
			contentId: '8f8e71f6-372a-45dc-aded-8f95c73f2e88',
			videoId: '3ef132b3-eb22-4d3b-9603-c22f364834fa',
			eventTime: 1636143990000,
			progress: 150.176,
			courseId: '',
			lectureType: 'lecture'
		};
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a- 10s -b- 10s -c-', {
				a: courseActions.setVideoProgressForce(testVidPostInfo),
				b: courseActions.setVideoProgressForce(testVidPostInfo),
				c: courseActions.setVideoProgressForce(testVidPostInfo),
			});

			expectObservable(effects.postVideoProgressForce$).toBe('-x- 10s -y- 10s -z-', {
				x: offlineActions.saveVideoPostInfo({...testVidPostInfo, userId: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'}),
				y: offlineActions.saveVideoPostInfo({...testVidPostInfo, userId: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'}),
				z: offlineActions.saveVideoPostInfo({...testVidPostInfo, userId: '1fbf9d8b-c4ce-44d9-a6e1-be9099f6cec6'}),
			});
		});
	});

	it.todo('should postVideoProgressForce$');

	it('loginToProgress$ should map userLoginCompete and userSetDetails to getCoursesProgress', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a---b 34s c--|', {
				a: userActions.userLogInComplete({allowNavigate: false}),
				b: userActions.userSetDetails({user: {} as any}),
				c: userActions.userSetDetails({user: {} as any})
			});

			expectObservable(effects.loginToProgress$).toBe('-x---x 34s x--|', {
				x: courseActions.getCoursesProgress()
			});
		});
	});

	it('clearProgressOnLogout$ should trigger emptying of video progress and course progress', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a--------a-------|', {
				a: userActions.userLogOutCompleted(),
			});

			//note: something about the switchMap in the effect and/or the '()' in the marbles appears to be changing timing (shrug)
			expectObservable(effects.clearProgressOnLogout$).toBe('-(xyzab)--(xyzab)-|', {
				x: courseActions.setVideoProgressList({list: []}),
				y: courseActions.setCoursesProgress({progress: []}),
				z: courseActions.setCurrentCourse({currentCourse: null}),
				a: courseActions.setCurrentLesson({currentLesson: null}),
				b: courseActions.setCurrentLessonItem({item: null, itemType: null})
			});
		});
	});
});
