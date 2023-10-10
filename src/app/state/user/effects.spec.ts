import {firstValueFrom, from, Observable, of, ReplaySubject, Subject, throwError} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ToastrService} from 'ngx-toastr';
import {createSpyObj, createSpyWithMultipleValues, CustomMocksModule, MockStorage, MockBrowserAbstractionModule} from '../../../test.helpers';
import {MockStore} from '@ngrx/store/testing';
import {State} from '../index';
import {UserDataService} from '../../services/user-data.service';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {BsModalService} from 'ngx-bootstrap/modal';
import {RouterTestingModule} from '@angular/router/testing';

import Auth from '@aws-amplify/auth';

import * as userActions from './actions';
import {Router} from '@angular/router';

/**
 * NOTE: THESE TESTS CHEAT.
 * Auth.blah actually returns a promise, but the testScheduler seems to screw that up when using from(Promise.resolve).
 * As a result, when mocking these calls, we're just returning Observable to make it match behavior in the browser.
 * TODO Figure out why and make these real
 */

class MockAuth {
	static signOut = jest.fn().mockResolvedValue(1);
	static currentAuthenticatedUser = jest.fn().mockResolvedValue(2);
	static currentUserInfo = jest.fn().mockResolvedValue(3);
	static currentSession = jest.fn().mockResolvedValue({});
	static currentUserPoolUser = jest.fn().mockResolvedValue({});
}


import {UserEffects} from './effects';
import {MatchingAccountsComponent} from '../../matching-accounts/matching-accounts.component';
import {LOCAL_STORAGE, SESSION_STORAGE} from '../../common/models';


describe('User effects', () => {
	let effects;

	let actions$ = new Observable<Action>();
	let testScheduler;
	let store;
	let userDataService;
	let toastr;
	let router;
	let modal;

	beforeEach(() => {

		jest.mock('@aws-amplify/auth', () => ({
			__esModule: true,
			default: MockAuth,
			Auth: MockAuth
		}));

		TestBed.configureTestingModule({
			providers: [
				UserEffects,
				provideMockActions(() => actions$),
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn()}},
				{provide: BsModalService, useValue: createSpyObj('BsModalService', ['show', 'onHide'])},
				{provide: SESSION_STORAGE, useClass: MockStorage},
			],
			imports: [
				CustomMocksModule,
				MockBrowserAbstractionModule,
				RouterTestingModule.withRoutes([]),
			]
		});

		effects = TestBed.inject<UserEffects>(UserEffects);
		store = TestBed.inject(Store) as MockStore<State>;
		router = TestBed.inject(Router);
		userDataService = TestBed.inject(UserDataService);
		toastr = TestBed.inject(ToastrService);
		modal = TestBed.inject(BsModalService);

		jest.spyOn(store, 'dispatch');
		jest.spyOn(router, 'navigateByUrl').mockImplementation((r) => Promise.resolve(r));
		jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve());

		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

	});

	it('loginUser$ should translate userLoginComplete to userGetDetails', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('----a-----b', {
				a: userActions.userLogInComplete({allowNavigate: true}),
				b: userActions.userLogInComplete({allowNavigate: false}),
			});

			expectObservable(effects.loginUser$).toBe('----a-----a', {
				a: userActions.userGetDetails()
			});
		});
	});

	it('logoutUser$ should log out user and pass on an error action if an error is encountered', () => {
		jest.spyOn(Auth, 'signOut').mockImplementation(createSpyWithMultipleValues([
			of(1),
			throwError('face'),
			of(2),
		]));
		testScheduler.run(({hot, expectObservable}) => {

			actions$ = hot('----a--a---a|', {
				a: userActions.userLogOutRequested(),
			});

			expectObservable(effects.logoutUser$).toBe('----a--b---a|', {//'----a--b---a|', {
				a: userActions.userLogOutCompleted(),
				b: userActions.userLoginError({message: 'An error occurred during logout.'}),
			});

			testScheduler.flush();

			expect(Auth.signOut).toHaveBeenCalledTimes(3);
			expect(router.navigate).toHaveBeenCalledWith(['auth/signin']);
			expect(toastr.success).toHaveBeenCalledWith('Logged Out');
		});
	});

	it('loadUser$', () => {
		const spy = jest.spyOn(UserEffects, 'cognitoUserToUser').mockImplementation(() => 1 as any);
		Auth.currentAuthenticatedUser = createSpyWithMultipleValues([
			of(1),
			throwError(''),
			of(2),
			// Promise.resolve(1),
			// Promise.reject(new Error('face')),
			// Promise.resolve(2),
		]);
		Auth.currentUserInfo = createSpyWithMultipleValues([
			of('u1'),
			throwError('face'),
			of('u2'),
			// Promise.resolve('u1'),
			// Promise.reject(new Error('face')),
			// Promise.resolve('u2'),
		]);

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('--a----a---a--', {
				a: userActions.userGetDetails(),
			});

			expectObservable(effects.loadUser$).toBe('--(aa)-----(aa)', { //'--aa--------aa--', {
				a: userActions.userSetDetails({user: 1 as any}),
			});

			testScheduler.flush();
			expect(spy.mock.calls).toEqual([
				[1],
				['u1'],
				[2],
				['u2']
			]);
		});
		//since this is static, it doesn't to get reset automatically. Hence, we need to explicitly remove the mock.
		(UserEffects.cognitoUserToUser as any).mockRestore();
	});

	it('refreshToken$ should handle calling Cognito refresh functions 5 minutes before use token expires', (done) => {
		//const expiration = jest.fn();
		const refreshToken = 'rtok';

		Auth.currentSession = jest.fn().mockResolvedValue({
			getAccessToken: () => ({
				getExpiration: () => ((Date.now() / 1000) + 600)//expiration
			}),
			getRefreshToken() {
				console.log('getting token');
				return refreshToken;
			}
		});

		const refreshSpy = jest.fn(() => console.log('refresh'));
		Auth.currentUserPoolUser = jest.fn().mockImplementation(() => Promise.resolve({//.mockResolvedValue(({
			refreshSession: refreshSpy,
		}));

		// actions$ = from([]);
		const sub = new Subject<Action>();
		actions$ = sub.asObservable();
		// actions$ = new ReplaySubject<Action>(1);

		jest.useFakeTimers();

		firstValueFrom(effects.refreshToken$).then(r => {
			done();
		});

		sub.next(userActions.userSetDetails({user: {} as any}));

		const advanceSeconds = seconds => {
			console.log('advancing', seconds * 1000);
			jest.advanceTimersByTime(seconds * 1000);
		};

		//https://stackoverflow.com/a/52196951/442596/
		const flushTimers = () => Promise.resolve(); //new Promise(resolve => setImmediate(resolve));

		advanceSeconds(2);
		expect(Auth.currentSession).not.toHaveBeenCalled();

		//after 3 seconds the session should be called
		advanceSeconds(1);
		expect(Auth.currentSession).toHaveBeenCalled();

		flushTimers().then(() => {
			try {
				advanceSeconds(4 * 60); //advance 4 minutes
				expect(Auth.currentUserPoolUser).not.toHaveBeenCalled();

				advanceSeconds(60); //advance 1 minute
				expect(Auth.currentUserPoolUser).toHaveBeenCalled();

				flushTimers().then(() => {
					console.log('checking');
					expect(refreshSpy).toHaveBeenCalled();
					expect(refreshSpy).toHaveBeenCalledWith(refreshToken, expect.any(Function));
					const [token, dispatchFunction]: any[] = refreshSpy.mock.calls[0];
					// await flushTimers();

					expect(store.dispatch).not.toHaveBeenCalled();
					dispatchFunction(new Error('face'));
					expect(store.dispatch).not.toHaveBeenCalled();
					dispatchFunction(null, 1);
					expect(store.dispatch).toHaveBeenCalled();
					expect(store.dispatch.mock.calls.slice(-1)[0][0].type).toEqual(userActions.userSessionRefreshed.type);
				});
			} catch (e) {
				done(e);
			}
			sub.complete();
		});


	});
	it.todo('refreshToken$ should reset timer when a new userSetDetails is pushed');
	it.todo('refreshToken$ should should gracefully handle errors in currentUserPoolUser');

	it('loginUserRedirect$ should do nothing if allowNavigate = false', async () => {
		actions$ = from([userActions.userLogInComplete({allowNavigate: false}), userActions.userLogInComplete({allowNavigate: false})]);

		await effects.loginUserRedirect$.toPromise();

		expect(router.navigateByUrl).not.toHaveBeenCalled();
		expect(store.dispatch).not.toHaveBeenCalled();
		expect(toastr.success).not.toHaveBeenCalled();
	});

	it('loginUserRedirect$ should redirect if pending enroll', async () => {
		actions$ = from([userActions.userLogInComplete({allowNavigate: true})]);

		jest.spyOn(effects.simpleMdPipe, 'transform').mockImplementation(() => 'TEST1');

		const url = 'http://face';
		store.setState({
			...store.lastState,
			enrollment: {
				...store.lastState.enrollment,
				pendingEnroll: {title: 'TEST'},
			},
		});

		await effects.loginUserRedirect$.toPromise();

		expect(effects.simpleMdPipe.transform).toHaveBeenCalledWith('TEST');
		expect(router.navigateByUrl).not.toHaveBeenCalledWith(url);
		expect(store.dispatch).not.toHaveBeenCalled();
		expect(toastr.success).toHaveBeenCalledWith('Enrolling in TEST1', '', {enableHtml: true, timeOut: 1000});
	});

	it('loginUserRedirect$ should redirect if pending redirect', async () => {
		actions$ = from([userActions.userLogInComplete({allowNavigate: true})]);

		const url = 'http://face';
		store.setState({
			...store.lastState,
			user: {
				...store.lastState.user,
				pendingRedirectUrl: url,
			},
		});

		await effects.loginUserRedirect$.toPromise();

		expect(router.navigateByUrl).toHaveBeenCalledWith(url);
		expect(store.dispatch).toHaveBeenCalledWith(userActions.userSetPostLoginUrl({url: null}));
		expect(toastr.success).not.toHaveBeenCalled();
	});

	it('loginUserRedirect$ should redirect home if allowNavigate and no other settings', async () => {
		actions$ = from([userActions.userLogInComplete({allowNavigate: true})]);

		await effects.loginUserRedirect$.toPromise();

		expect(router.navigateByUrl).toHaveBeenCalledWith('/');
		expect(store.dispatch).not.toHaveBeenCalled();
		expect(toastr.success).not.toHaveBeenCalled();
	});

	const testAccountConfirm = async () => {
		actions$ = from([userActions.userConfirmComplete({allowNavigate: false, email: 'a@a'})]);

		await effects.accountConfirmed$.toPromise();

		expect(userDataService.markAccountVerified).toHaveBeenCalledWith('a@a');
	};
	it('accountConfirmed$', async () => {
		await testAccountConfirm();
	});
	it('accountConfirmed$ should gracefully handle error', async () => {
		userDataService.markAccountVerified = jest.fn(() => throwError(''));
		await testAccountConfirm();
	});


	const userWithMatches = {
		id: '123',
		email: 'test@a.b',
		userType: 'Email',
		matchedAccounts: [{
			status: 'found',
			userId: '1',
			email: 'a@b.c',
			type: 'Facebook'
		}]
	};
	const testMergePopup = async (hideFunc, onHideExtras = () => {}) => {
		const setUserWithMatches = userActions.userSetDetails({
			user: userWithMatches as any
		});

		modal.show = jest.fn(() => ({
			hide: hideFunc,
		}));
		modal.onHide = new Subject<string>();
		actions$ = from([setUserWithMatches]);

		await effects.accountMergeCheck$.toPromise();


		expect(modal.show).toHaveBeenCalledWith(
			MatchingAccountsComponent,
			{
				initialState: {
					matchingAccounts: [
						{
							status: userWithMatches.matchedAccounts[0].status,
							userId: userWithMatches.matchedAccounts[0].userId,
							email: userWithMatches.matchedAccounts[0].email,
							type: userWithMatches.matchedAccounts[0].type,
							selected: false,
							current: false,
						},
						{
							status: 'linked',
							userId: userWithMatches.id,
							current: true,
							selected: true,
							email: userWithMatches.email,
							type: userWithMatches.userType
						}
					]
				},
				class: 'modal-lg modal-dialog-centered modal-dialog-scrollable',
			}
		);

		if (onHideExtras) {
			onHideExtras();
		}

		modal.onHide.next('test');
		expect(store.dispatch).toHaveBeenCalledWith(userActions.userMergeModalAccountClosed());
		expect(effects.mergeAccountModalState.ref).toBeNull();
		expect(hideFunc).not.toHaveBeenCalled();
	};

	it('accountMergeCheck$ should call popup if has matched', async () => {
		const hide = jest.fn();
		await testMergePopup(hide);
	});

	it('accountMergeCheck$ should call popup if has matched and close previous if exists', async () => {
		const hide = jest.fn();
		effects.mergeAccountModalState.ref = {
			hide,
		};
		await testMergePopup(hide, () => {
			expect(effects.mergeAccountModalState.shouldIgnoreUpcomingClose).toBeTruthy();
			effects.mergeAccountModalState.shouldIgnoreUpcomingClose = false;
			expect(hide).toHaveBeenCalled();
			hide.mockReset();
		});
	});

	it('accountMergeCheck$ should call just close popup if has no matches and close previous exists', async () => {
		const hide = jest.fn();
		effects.mergeAccountModalState.ref = {
			hide,
		};
		actions$ = from([userActions.userSetDetails({user: {...userWithMatches, matchedAccounts: []} as any})]);
		await effects.accountMergeCheck$.toPromise();
		expect(effects.mergeAccountModalState.shouldIgnoreUpcomingClose).toBeTruthy();
		effects.mergeAccountModalState.shouldIgnoreUpcomingClose = false;
		expect(hide).toHaveBeenCalled();
	});

	it('accountMergeCheck$ should do nothing if has no matched', async () => {
		const hide = jest.fn();
		modal.show = jest.fn(() => ({
			hide,
		}));
		modal.onHide = new Subject<string>();
		actions$ = from([userActions.userSetDetails({user: {...userWithMatches, matchedAccounts: []} as any})]);

		await effects.accountMergeCheck$.toPromise();


		expect(modal.show).not.toHaveBeenCalled();

		modal.onHide.next('test');
		expect(store.dispatch).not.toHaveBeenCalledWith();
		expect(effects.mergeAccountModalState.ref).toBeNull();
	});

	it('signoutOnMergeModalCloseWithChanges$ should request signout if state.user.madeAccountMergeChanges', () => {
		store.setState({
			user: {
				madeAccountMergeChanges: true,
			}
		});
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('--a-', {
				a: userActions.userMergeModalAccountClosed()
			});
			expectObservable(effects.signoutOnMergeModalCloseWithChanges$).toBe('--a-', {
				a: userActions.userLogOutRequested()
			});
		});
	});
	it('signoutOnMergeModalCloseWithChanges$ should do nothing if not state.user.madeAccountMergeChanges', () => {
		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('--a-', {
				a: userActions.userMergeModalAccountClosed()
			});
			expectObservable(effects.signoutOnMergeModalCloseWithChanges$).toBe('----');
		});
	});

	const testProfileUpdateToHubspot = async () => {
		const user = {a: 'b'} as any;
		actions$ = from([userActions.userProfileUpdate({user})]);

		await effects.profileUpdateToHubspot$.toPromise();

		expect(userDataService.markProfileSubmit).toHaveBeenCalledWith(user);
	};

	it('profileUpdateToHubspot$ should call hubspot API on userProfileUpdate', async () => {
		await testProfileUpdateToHubspot();
	});
	it('profileUpdateToHubspot$ should call hubspot API on userProfileUpdate (and gracefully handle error)', async () => {
		userDataService.markProfileSubmit = jest.fn(() => throwError(''));
		await testProfileUpdateToHubspot();
	});

	const testTranslate = (testObj, expectedExtras) => {
		// UserEffects.cognitoUserToUser.removeMock()

		expect(UserEffects.cognitoUserToUser(testObj)).toEqual({
			id: testObj.attributes.sub,
			userType: 'Email',
			email: testObj.attributes.email,
			username: testObj.attributes.username, //TODO fix this if we use to an email alias
			firstname: testObj.attributes.given_name,
			lastname: testObj.attributes.family_name,
			title: testObj.attributes['custom:title'],
			address: testObj.attributes['custom:address_line1'], //curUser.attributes.address,
			city: testObj.attributes['custom:address_city'], //TODO
			state: testObj.attributes['custom:address_state'], //'MI',
			zip: testObj.attributes['custom:address_postal_code'],
			matchedAccounts: [],
			hasMergeAccounts: false,
			...expectedExtras,
		});
	};

	const baseCogUserObj = {
		attributes: {
			sub: '1',
			email: 'a@b.c',
			username: 'uname',
			given_name: 'fname',
			family_name: 'lname',
			'custom:title': 'Title',
			'custom:address_line1': '123 F',
			'custom:address_city': 'City',
			'custom:address_state': 'State',
			'custom:address_postal_code': '1234'
		},
	};

	it('cognitoUserToUser should translate the response from the Cognito API to a local User object (Email)', () => {
		testTranslate(baseCogUserObj, {});
	});

	it('cognitoUserToUser should translate the response from the Cognito API to a local User object (Facebook)', () => {
		testTranslate(
			{...baseCogUserObj, username: 'Facebook_123'},
			{userType: 'Facebook'}
		);
	});

	it('cognitoUserToUser should translate the response from the Cognito API to a local User object (Google)', () => {
		testTranslate(
			{...baseCogUserObj, username: 'Google_123'},
			{userType: 'Google'}
		);
	});

	it('cognitoUserToUser should translate the response from the Cognito API to a local User object (bad usernames)', () => {
		testTranslate(
			{...baseCogUserObj, username: ''},
			{}
		);
		testTranslate(
			{...baseCogUserObj, username: 'junk'},
			{}
		);
		testTranslate(
			{...baseCogUserObj, username: 'Facebook_'},
			{}
		);
		testTranslate(
			{...baseCogUserObj, username: 'Google_'},
			{}
		);
	});

	it('cognitoUserToUser should translate the response from the Cognito API to a local User object (matched)', () => {
		testTranslate(
			{
				...baseCogUserObj,
				attributes: {
					...baseCogUserObj.attributes,
					'custom:matched_accounts': JSON.stringify([{
						prov: 'Facebook',
						email: 'test@1.2',
						state: 'thing',
						sub: '123'
					}, {
						prov: 'Cognito',
						email: 'test@2.3',
						state: 'found',
						sub: '456'
					}])
				}
			},
			{
				matchedAccounts: [{
					type: 'Facebook',
					email: 'test@1.2',
					status: 'thing',
					userId: '123'
				}, {
					type: 'Email',
					email: 'test@2.3',
					status: 'found',
					userId: '456',
				}]
			}
		);
	});
	it('cognitoUserToUser should translate the response from the Cognito API to a local User object (handle bad match gracefully)', () => {
		testTranslate(
			{
				...baseCogUserObj,
				attributes: {
					...baseCogUserObj.attributes,
					'custom:matched_accounts': '1243241234' //invalid json
				}
			},
			{ }
		);
	});
});
