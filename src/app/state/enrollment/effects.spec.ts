import {firstValueFrom, from, Observable, of, throwError} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ToastrService} from 'ngx-toastr';
import * as helpers from '../../../test.helpers';
import {createSpyWithMultipleObservableValues, CustomMocksModule, MockBrowserAbstractionModule} from '../../../test.helpers';
import {RouterTestingModule} from '@angular/router/testing';
import {MockStore} from '@ngrx/store/testing';
import {State} from '../index';
import {Router} from '@angular/router';
import {UserDataService} from '../../services/user-data.service';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {EnrollmentEffects} from './effects';
import * as enrollmentActions from './actions';
import * as userActions from '../user/actions';
import * as courseActions from '../courses/actions';
import {UserService} from '../../services/user.service';
import {LoadingService} from '../../common/loading.service';
import {Course} from '../../services/course-data.service';
import {CourseEnrollment, LOCAL_STORAGE} from '../../common/models';
import {ROOT_EFFECTS_INIT} from '@ngrx/effects';
import { DonationPortalComponent } from '../../common/donation-portal/donation-portal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap.local/modal';
import { Component } from '@angular/core';

describe('Enrollment effects', () => {
	let effects;

	let actions$ = new Observable<Action>();
	let testScheduler;
	let store;
	let userDataService;
	let toastr;
	let router;
	let userService;
	let loading;
	let modal;

	let getItemSpy;
	let setItemSpy;
	let removeItemSpy;
	let simpleMdSpy;

	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				EnrollmentEffects,
				provideMockActions(() => actions$),
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn(), info: jest.fn()}},
				{provide: UserService, useValue: helpers.createSpyObj('UserService', ['isUsernameAvailable'])},
				{provide: LoadingService, useValue: helpers.createSpyObj('LoadingService', ['show', 'hide'])},
				{provide: BsModalService, useValue: helpers.createSpyObj('BsModalService', ['show', 'hide'])},
				// override the local storage value that would come from MockBrowserAbstractionModule (we need to have ti mocked in the constructor)
				// {provide: LOCAL_STORAGE, useValue: localStor},
			],
			imports: [
				CustomMocksModule,
				MockBrowserAbstractionModule,
				RouterTestingModule.withRoutes([]),
			]
		});

		store = TestBed.inject(Store) as MockStore<State>;
		router = TestBed.inject(Router);
		userDataService = TestBed.inject(UserDataService);
		toastr = TestBed.inject(ToastrService);
		userService = TestBed.inject(UserService);
		loading = TestBed.inject(LoadingService);
		modal = TestBed.inject(BsModalService);

		const storage = TestBed.inject(LOCAL_STORAGE) as jest.MockedClass<any>;
		getItemSpy = storage.getItem;
		setItemSpy = storage.setItem;
		removeItemSpy = storage.removeItem;

		effects = TestBed.get<EnrollmentEffects>(EnrollmentEffects);

		simpleMdSpy = jest.spyOn(effects.simpleMdPipe, 'transform');

		jest.spyOn(store, 'dispatch');
		jest.spyOn(router, 'navigateByUrl').mockImplementation((r) => Promise.resolve(r));
		jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve());

		//NOTE: to get contructor tests to pass, we are NOT `get`ing the effects from TestBed here.
		//There is an inner describe that does that for most tests. However a couple tests need to go the `get` at some point after test start

		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

	});

	afterEach(() => {
		if (getItemSpy) getItemSpy.mockRestore();
		if (setItemSpy) setItemSpy.mockRestore();
		if (removeItemSpy) removeItemSpy.mockRestore();
	});


	it('should create and dispatch pending enrollment if in localStorage', async () => {
		const obj = {foo: 'bar'};
		const studyGroupId = 'stuff';
		getItemSpy.mockImplementationOnce(() => JSON.stringify(obj))
			.mockImplementationOnce(() => studyGroupId);

		actions$ = of({type: ROOT_EFFECTS_INIT});
		const res = await effects.reloadPendingEnrollment$.toPromise();

		expect(getItemSpy.mock.calls).toEqual([
			[EnrollmentEffects.PENDING_ENROLL_KEY],
			[EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY]
		]);
		expect(res).toEqual(enrollmentActions.setPendingEnroll({
			course: obj as any,
			studyGroupId
		}));
	});
	it('should create and do nothing if enrollment not in localStorage', async () => {
		actions$ = of({type: ROOT_EFFECTS_INIT});
		const res = await effects.reloadPendingEnrollment$.toPromise();

		expect(getItemSpy.mock.calls).toEqual([[EnrollmentEffects.PENDING_ENROLL_KEY]]);
		expect(res).toBeFalsy();
	});
	it('should create even if localStorage throws an error', async () => {
		getItemSpy.mockImplementationOnce(() => {
			throw new Error('Testing fail condition!');
		});

		actions$ = of({type: ROOT_EFFECTS_INIT});
		const res = await effects.reloadPendingEnrollment$.toPromise();

		expect(getItemSpy.mock.calls).toEqual([[EnrollmentEffects.PENDING_ENROLL_KEY]]);
		expect(res).toBeFalsy();
	});

	it('courseInquiry$ should make calls to inquireInCourse and handle errors', () => {
		const course1 = {system_id: '1'} as any;
		const course2 = {system_id: '2'} as any;
		const course3 = {system_id: '3'} as any;
		const res1 = '1' as any;
		const res2 = '2' as any;
		const res3 = '3' as any;

		userDataService.inquireInCourse = createSpyWithMultipleObservableValues([
			of(res1),
			throwError(''),
			of(res2),
			of(res3),
		]);

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('za-b 9999ms c 1s d 9s e 10s f', {
				//skipped for no email
				z: enrollmentActions.setPendingEnroll({course: course1, studyGroupId: null, isFirstLoad: true}),
				//skipped for isFirstLoad=false
				a: enrollmentActions.setPendingEnroll({email: 'z', course: course1, studyGroupId: null, isFirstLoad: false}),
				//successful call
				b: enrollmentActions.setPendingEnroll({email: 'a', course: course1, studyGroupId: null, isFirstLoad: true}),
				//call to getEnrolledCourses resulting in error
				c: enrollmentActions.setPendingEnroll({email: 'a', course: course1, studyGroupId: null, isFirstLoad: true}),
				//ignored by throttle
				d: enrollmentActions.setPendingEnroll({email: 'b', course: course2, studyGroupId: null, isFirstLoad: true}),
				//successful call
				e: enrollmentActions.setPendingEnroll({email: 'b', course: course2, studyGroupId: null, isFirstLoad: true}),
				//successful call
				f: enrollmentActions.setPendingEnroll({email: 'c', course: course3, studyGroupId: null, isFirstLoad: true}),
			});
			expectObservable(effects.courseInquiry$).toBe('---a 9999ms - 1s - 9s b 10s c', {
				a: enrollmentActions.inquireInCourseComplete({inquiry: res1}), //`a`
				b: enrollmentActions.inquireInCourseComplete({inquiry: res2}), //`e`
				c: enrollmentActions.inquireInCourseComplete({inquiry: res3}), //`f`
			});

			testScheduler.flush();

			expect(userDataService.inquireInCourse).toHaveBeenCalledTimes(4);

			expect(toastr.error).not.toHaveBeenCalled();
		});
	});

	it('getEnrolledCourses$ should make calls to getEnrolledCourses and handle errors', () => {
		const res1 = '1' as any;
		const res2 = '2' as any;
		const res3 = '3' as any;

		userDataService.getEnrolledCourses = createSpyWithMultipleObservableValues([
			of(res1),
			throwError(''),
			of(res2),
			of(res3),
		]);

		//put user in store
		store.setState({
			...store.lastState,
			user: {
				...store.lastState.user,
				currentUser: 1
			}
		});

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a-b 9999ms c 1s d 9s e 10s f', {
				a: courseActions.courseListRequested(), //successful call to getEnrolledCourses
				b: courseActions.courseListRequested(), //ignored by throttle
				c: userActions.userSetDetails({user: {} as any}), //call to getEnrolledCourses resulting in error
				d: courseActions.setCurrentCourse({currentCourse: 'test'}), //ignored by throttle
				e: courseActions.courseListRequested(), //successful call to getEnrolledCourses
				f: courseActions.setCurrentCourse({currentCourse: 'test1'}), //successful call to getEnrolledCourses
			});
			expectObservable(effects.getEnrolledCourses$).toBe('-a-- 9999ms - 1s - 9s b 10s c', {
				a: enrollmentActions.setEnrolledCourses({courses: res1}), //`a`
				b: enrollmentActions.setEnrolledCourses({courses: res2}), //`e`
				c: enrollmentActions.setEnrolledCourses({courses: res3}), //`f`
			});

			testScheduler.flush();

			expect(userDataService.getEnrolledCourses).toHaveBeenCalledTimes(4);

			expect(toastr.error.mock.calls).toEqual([
				['Unable to retrieve enrollment information. Please try again later']
			]);
		});
	});

	it('getEnrolledCourses$ should do nothing while no user', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a 10s b', {
				a: courseActions.courseListRequested(), //successful call to getEnrolledCourses
				b: courseActions.courseListRequested(), //ignored by throttle
			});
			expectObservable(effects.getEnrolledCourses$).toBe('-- 10s -');

			testScheduler.flush();

			expect(userDataService.getEnrolledCourses).not.toHaveBeenCalled();

			expect(toastr.error).not.toHaveBeenCalled();
		});
	});

	it('clearEnrollmentStatus$ should translate logouts to enrolledCourses = []', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('----a---------a', {
				a: userActions.userLogOutCompleted(),
			});
			expectObservable(effects.clearEnrollmentStatusOnLogout$).toBe('----a---------a', {
				a: enrollmentActions.setEnrolledCourses({courses: []}),
			});
		});

	});

	const enrollerMockState = (email: string) => {
		store.setState({
			...store.lastState,
			user: {
				...store.lastState.user,
				currentUser: {
					id: 'sdfs',
					email,
				}
			}
		});
	};

	const enrollerValidateNormalFormsCall = async (email, course, studyGroupId: string = null) => {
		await effects.courseEnroller$.toPromise();

		if (studyGroupId) {
			expect(userDataService.markCourseStudyGroup).toHaveBeenCalledWith(email, course);
			expect(userDataService.markCourseInquiry).not.toHaveBeenCalled();
		} else {
			expect(userDataService.markCourseInquiry).toHaveBeenCalledWith(email, course);
			expect(userDataService.markCourseStudyGroup).not.toHaveBeenCalled();
		}
		enrollerExpectEnrollCall(course, studyGroupId);
	};
	const enrollerExpectEnrollCall = (course, studyGroupId: string = null) => {
		expect(loading.show).toHaveBeenCalled();
		expect(userDataService.enrollInCourse).toHaveBeenCalledWith(course.system_id, studyGroupId);
		expect(loading.hide).toHaveBeenCalled();
	};

	const enrollerSigninNormalTest = async (studyGroupId: string = null) => {
		const resEnr = '1' as any;
		userDataService.enrollInCourse.mockImplementation(() => of(resEnr));
		const crs = {system_id: 272} as any;
		const email = 'a@b.c';

		enrollerMockState(email);

		actions$ = from([enrollmentActions.enrollInCourseRequested({
			course: crs,
			email,
			studyGroupId
		})]);

		await enrollerValidateNormalFormsCall(email, crs, studyGroupId);
		expect(store.dispatch).toHaveBeenCalledWith(enrollmentActions.enrollInCourseComplete({course: crs, enrollment: resEnr}));
	};
	it('courseEnroller$ should enroll the user if signed in', async () => {
		await enrollerSigninNormalTest();
	});
	it('courseEnroller$ should enroll the user if signed in (study group)', async () => {
		await enrollerSigninNormalTest('studyGroupId');
	});


	it('courseEnroller$ should enroll the user and open donation modal', waitForAsync( () => {
		jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

		store.setState({
			...store.lastState,
			enrollment: {
				...store.lastState.enrollment,
				doDonationInquiry: true,
				donationInquiryType: 'modal',
			},
		});
		actions$ = from([enrollmentActions.enrollInCourseComplete({
			course: helpers.getMockCourse(),
			enrollment: helpers.getMockCourseEnrollment(),
		})]);
		firstValueFrom(effects.courseEnrollCompleteNav$).then(() => {
			expect(store.dispatch).toHaveBeenCalledWith(enrollmentActions.setDonationModal());
		});
	}));

	describe('When the course is not published yet', () => {
		it('courseEnrollerComplete$ should enroll the user and open donation tab', waitForAsync( () => {
			jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
			store.setState({
				...store.lastState,
				enrollment: {
					...store.lastState.enrollment,
					doDonationInquiry: true,
					donationInquiryType: 'tab',
				},
			});
			actions$ = from([enrollmentActions.enrollInCourseComplete({
				course: helpers.getMockCourse({publication_date: new Date(3000, 1, 1)}),
				enrollment: helpers.getMockCourseEnrollment(),
			})]);

			firstValueFrom(effects.courseEnrollCompleteNav$).then(() => {
				expect(store.dispatch).toHaveBeenCalledWith(enrollmentActions.setDonationTab());
			});
		}));
	});

	describe('When the course is already published', () => {
		it('courseEnrollerComplete$ should enroll the user but should NOT open the donation tab', waitForAsync( () => {
			jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
			store.setState({
				...store.lastState,
				enrollment: {
					...store.lastState.enrollment,
					doDonationInquiry: true,
					donationInquiryType: 'tab',
				},
			});
			actions$ = from([enrollmentActions.enrollInCourseComplete({
				course: helpers.getMockCourse({publication_date: new Date(2000, 1, 1)}),
				enrollment: helpers.getMockCourseEnrollment(),
			})]);

			firstValueFrom(effects.courseEnrollCompleteNav$).then(() => {
				expect(store.dispatch).toHaveBeenCalledWith(enrollmentActions.setDonationTab());
			});
		}));
	});

	it('courseEnroller$ should enroll the user if signed in (and inquiry throws error)', async () => {
		userDataService.markCourseInquiry.mockImplementation(() => throwError(''));
		await enrollerSigninNormalTest();
	});
	it('courseEnroller$ should enroll the user if signed in (and study group throws error)', async () => {
		userDataService.markCourseStudyGroup.mockImplementation(() => throwError(''));
		await enrollerSigninNormalTest('studyGroupId');
	});

	it('courseEnroller$ should enroll the user if signed in (no email in state)', async () => {
		const resEnr = '1' as any;
		userDataService.enrollInCourse.mockImplementation(() => of(resEnr));
		const crs = {system_id: 272} as any;
		const email = 'a@b.c';

		enrollerMockState(null);

		actions$ = from([enrollmentActions.enrollInCourseRequested({course: crs, email, studyGroupId: null})]);

		await enrollerValidateNormalFormsCall(email, crs);
		expect(store.dispatch).toHaveBeenCalledWith(enrollmentActions.enrollInCourseComplete({course: crs, enrollment: resEnr}));
	});
	it('courseEnroller$ should enroll the user if signed in (no email at all)', async () => {
		const resEnr = '1' as any;
		userDataService.enrollInCourse.mockImplementation(() => of(resEnr));
		const crs = {system_id: 272} as any;
		const email = null;

		enrollerMockState(email);

		actions$ = from([enrollmentActions.enrollInCourseRequested({course: crs, email, studyGroupId: null})]);

		await effects.courseEnroller$.toPromise();

		expect(userDataService.markCourseInquiry).not.toHaveBeenCalled();
		await enrollerExpectEnrollCall(crs);
		expect(store.dispatch).toHaveBeenCalledWith(enrollmentActions.enrollInCourseComplete({course: crs, enrollment: resEnr}));
	});
	it('courseEnroller$ should handle error if enroll fail the user if signed in', async () => {
		userDataService.enrollInCourse.mockImplementation(() => throwError(''));
		const crs = {system_id: 272} as any;
		const email = 'a@b.c';

		enrollerMockState(email);

		actions$ = from([enrollmentActions.enrollInCourseRequested({course: crs, email, studyGroupId: null})]);

		await enrollerValidateNormalFormsCall(email, crs);
		expect(store.dispatch).toHaveBeenCalledWith(enrollmentActions.enrollInCourseCancelled({course: crs}));
		expect(toastr.error).toHaveBeenCalledWith('Unable to enroll in course. Please try again later.');
	});

	const enrollerExpectLocalStorageSaves = (crs, token) => {
		expect(setItemSpy.mock.calls).toEqual([
			[EnrollmentEffects.PENDING_ENROLL_KEY, JSON.stringify(crs)],
			// [EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY, null], //TODO pass group to test as well
		]);
	};
	const expectNoUserCalls = () => {
		expect(loading.show).not.toHaveBeenCalled();
		expect(store.dispatch.mock.calls).toEqual([[
			expect.objectContaining({type: enrollmentActions.setPendingEnroll.type})
		]]);
		expect(userDataService.enrollInCourse).not.toHaveBeenCalled();
	};
	const enrollerGetCourseAndToken = () => ({
		crs: {
			system_id: '1',
			title: 'A',
			url_slug: 'slug'
		},
		preToken: 'sdfsdf',
	});
	it('courseEnroller$ should set kick out no email actions if no user', async () => {
		const {crs, preToken} = enrollerGetCourseAndToken();

		actions$ = from([enrollmentActions.enrollInCourseRequested({
			course: crs as any,
			email: null,
			studyGroupId: null
		})]);

		await effects.courseEnroller$.toPromise();

		enrollerExpectLocalStorageSaves(crs, preToken);
		expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'signup'], {queryParamsHandling: 'preserve'});

		expectNoUserCalls();
		expect(userDataService.markCourseInquiry).not.toHaveBeenCalled();
		expect(userDataService.markCourseStudyGroup).not.toHaveBeenCalled();
	});

	const enrollerTestAnonymousUser = async (knownEmail: boolean) => {
		userService.isUsernameAvailable.mockImplementation(() => of(!knownEmail));
		const {crs, preToken} = enrollerGetCourseAndToken();
		const title = 'Mr.';
		const firstname = 'a';
		const lastname = 'b';
		const email = 'a+b@c.d';
		actions$ = from([enrollmentActions.enrollInCourseRequested({
			course: crs as any,
			title,
			firstname,
			lastname,
			email,
			studyGroupId: null
		})]);

		await effects.courseEnroller$.toPromise();

		expect(userService.isUsernameAvailable).toHaveBeenCalledWith(email);
		enrollerExpectLocalStorageSaves(crs, preToken);
		if (knownEmail) {
			expect(toastr.info).toHaveBeenCalledWith('This email is connected to an existing account. Please sign in to complete enrollment.');
			expect(router.navigate).toHaveBeenCalledWith(
				['/', 'auth', 'signin'],
				{queryParams: {email: 'a+b@c.d'}, queryParamsHandling: 'merge'}
			);
		} else {
			expect(router.navigate).toHaveBeenCalledWith(
				['/', 'auth', 'signup'],
				{
					queryParams: {
						title: 'Mr.',
						firstname: 'a',
						lastname: 'b',
						email: 'a+b@c.d'
					},
					queryParamsHandling: 'merge'
				}
			);
		}

		expectNoUserCalls();
	};
	it('courseEnroller$ should reroute unknown anonymous user to signup', async () => {
		await enrollerTestAnonymousUser(false);
	});
	it('courseEnroller$ should reroute known anonymous user to signin', async () => {
		await enrollerTestAnonymousUser(true);
	});

	it('courseEnrollerOnLogin$ should enroll the user upon login if there is a pending login', () => {
		const enr1 = '1' as any;
		const enr2 = '2' as any;
		userDataService.enrollInCourse = createSpyWithMultipleObservableValues([
			of(enr1),
			throwError(''),
			of(enr2),
		]);

		const pending = {system_id: '1', url_slug: 'slug1'} as any;
		store.setState({
			...store.lastState,
			enrollment: {
				...store.lastState.enrollment,
				pendingEnroll: pending,
			},
		});

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a--b 5s c 5s d -- e 5s f', {
				a: userActions.userLogInComplete({allowNavigate: false }), //ignored for no nav
				b: userActions.userLogInComplete({allowNavigate: true }), //successful call to enrollInCourse (x)
				c: userActions.userConfirmComplete({allowNavigate: false, email: 'test' }), //ignored for no nav
				d: userActions.userConfirmComplete({allowNavigate: true, email: 'test' }), //errored call to enrollInCourse
				e: userActions.userLogInComplete({allowNavigate: true}), //ignored by throttle
				f: userActions.userLogInComplete({allowNavigate: true }), //successful call to enrollInCourse (y)
			});

			expectObservable(effects.courseEnrollerOnLogin$).toBe('----x 5s - 5s ---- 5s y', {
				x: enrollmentActions.enrollInCourseComplete({course: pending, enrollment: enr1}), //`b`
				y: enrollmentActions.enrollInCourseComplete({course: pending, enrollment: enr2}) // `f`
			});

			testScheduler.flush();

			expect(userDataService.enrollInCourse.mock.calls).toEqual([
				[pending.system_id, null],
				[pending.system_id, null],
				[pending.system_id, null],
			]);

			expect(router.navigate.mock.calls).toEqual([[['/', 'landing', pending.url_slug], {queryParamsHandling: 'preserve'}]]);
		});
	});

	it('courseEnrollerOnLogin$ should do nothing if no pendingEnroll', () => {
		store.setState({
			...store.lastState,
			enrollment: {
				...store.lastState.enrollment,
				pendingEnroll: null,
			},
		});

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a 5s b', {
				a: userActions.userLogInComplete({allowNavigate: true }), //ignored for no nav
				b: userActions.userConfirmComplete({allowNavigate: true, email: 'test' }), //ignored for no nav
			});

			expectObservable(effects.courseEnrollerOnLogin$).toBe('-- 5s -');

			testScheduler.flush();

			expect(userDataService.enrollInCourse).not.toHaveBeenCalled();
			expect(router.navigateByUrl).not.toHaveBeenCalled();
		});
	});

	it('courseEnrollCompleteNav$ should clear localStorage, pop a toast, and navigate to new URL', async () => {
		const yesterday = new Date();
		const tomorrow = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const course1 = {title: 'Course 1', url_slug: 'slug1', publication_date: tomorrow} as Course;
		const course2 = {title: 'Course 2', url_slug: 'slug2', publication_date: yesterday} as Course;
		const enroll = new CourseEnrollment();

		actions$ = from([
			enrollmentActions.enrollInCourseComplete({course: course1, enrollment: enroll}),
			enrollmentActions.enrollInCourseComplete({course: course2, enrollment: enroll})
		]);


		await effects.courseEnrollCompleteNav$.toPromise();

		expect(removeItemSpy.mock.calls).toEqual([
			[EnrollmentEffects.PENDING_ENROLL_KEY],
			[EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY],
			[EnrollmentEffects.PENDING_ENROLL_KEY],
			[EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY],
		]);

		const toasterOps = {enableHtml: true};
		expect(toastr.success.mock.calls).toEqual([
			[`You've enrolled in ${course1.title}.`, '', toasterOps],
			[`You've enrolled in ${course2.title}. Click lecture 1 to begin.`, '', toasterOps],
		]);

		expect(simpleMdSpy.mock.calls).toEqual([[course1.title], [course2.title]]);

		expect(router.navigate.mock.calls).toEqual([
			[['/', 'courses', course1.url_slug], {queryParamsHandling: 'preserve'}],
			[['/', 'courses', course2.url_slug], {queryParamsHandling: 'preserve'}],
		]);
	});

	it('courseWithdrawalReasonsRequested$ should reliably get withdraw reasons', () => {
		const firstVals = [1, 2, 3] as any;
		const secondVals = [2, 3, 4] as any;
		userDataService.getWithdrawalReasons = createSpyWithMultipleObservableValues([
			of(firstVals),
			throwError(''),
			of(secondVals),
		]);
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('----a 2m a 10m a 8m a 40m a 60m a', {
				a: enrollmentActions.getWithdrawalReasons(),
			});
			expectObservable(effects.courseWithdrawalReasonsRequested$).toBe('----a 120m ----b', {
				a: enrollmentActions.setWithdrawalReasons({reasons: firstVals}),
				b: enrollmentActions.setWithdrawalReasons({reasons: secondVals}),
			});
		});
	});

	it('courseWithdrawalRequested$ should make translate action to unenrollFromCourse', () => {
		const course1 = {system_id: 1} as any;
		const course2 = {system_id: 2} as any;
		const reason1 = 'a' as any;
		const reason2 = 'b' as any;

		const responseA = 'x' as any;
		const responseB = 'y' as any;

		userDataService.unenrollFromCourse = createSpyWithMultipleObservableValues([
			throwError(''),
			of(responseB),
			of(responseA),
		]);

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a--a 5s b 5s a', {
				a: enrollmentActions.withdrawFromCourseRequested({course: course1, reason: reason1 }),
				b: enrollmentActions.withdrawFromCourseRequested({course: course2, reason: reason2 }),
			});

			expectObservable(effects.courseWithdrawalRequested$).toBe('----- 5s b 5s a', {
				b: enrollmentActions.withdrawFromCourseComplete({course: course2, enrollment: responseB}),
				a: enrollmentActions.withdrawFromCourseComplete({course: course1, enrollment: responseA})
			});

			testScheduler.flush();

			expect(userDataService.unenrollFromCourse.mock.calls).toEqual([
				[course1.system_id, reason1],
				[course2.system_id, reason2],
				[course1.system_id, reason1],
			]);
		});
	});

	it('courseWithdrawalCompleteNav$ should show toast', async () => {
		const course1 = {title: 'Course 1'} as Course;
		const course2 = {title: 'Course 2'} as Course;

		const enroll = new CourseEnrollment();

		actions$ = from([
			enrollmentActions.withdrawFromCourseComplete({course: course1, enrollment: enroll}),
			enrollmentActions.withdrawFromCourseComplete({course: course2, enrollment: enroll})
		]);

		await effects.courseWithdrawalCompleteNav$.toPromise();

		const toasterOps = {enableHtml: true};
		expect(toastr.success.mock.calls).toEqual([
			[`You've successfully withdrawn from ${course1.title}`, '', toasterOps],
			[`You've successfully withdrawn from ${course2.title}`, '', toasterOps],
		]);

		expect(simpleMdSpy.mock.calls).toEqual([[course1.title], [course2.title]]);

	});

	it('donationInquiryModal$ should open modal', waitForAsync( () => {
		const spy = jest.spyOn(modal, 'show');

		actions$ = from([enrollmentActions.setDonationModal]);

		firstValueFrom(effects.donationInquiryModal$).then(() => {
			expect(spy).toHaveBeenCalled();
		});
	}));

	it('donationInquiryTab$ should not open new tab', waitForAsync( () => {
		window.open = jest.fn();
		actions$ = from([enrollmentActions.setDonationTab]);
		firstValueFrom(effects.donationInquiryTab$).then(() => {
			expect(window.open).not.toHaveBeenCalled();
		});
	}));

});
