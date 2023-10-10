import {Inject, Injectable, NgZone} from '@angular/core';
import {Actions, createEffect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';
import {EMPTY, from, of, Subscription} from 'rxjs';
import {catchError, debounceTime, delay, filter, map, mergeAll, mergeMap, take, tap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {User, UserMatch, UserType} from '../../services/user.service';
import * as actions from './actions';
import {Auth} from 'aws-amplify';
// import Auth from '@aws-amplify/auth';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Store} from '@ngrx/store';
import {State} from '../index';
import {UserDataService} from '../../services/user-data.service';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal'; //TODO ngx-bootstrap
import {MatchingAccountsComponent, UserMatchSelection} from '../../matching-accounts/matching-accounts.component';
import Timeout = NodeJS.Timeout;
import {socialLogInComplete, userInitPlaybackRate, userSetPreferences} from './actions';
import {LOCAL_STORAGE} from '../../common/models';

const PLAYBACKRATE_KEY = 'user-playback-rate';
const USER_PREFERENCES_INTERVAL = 60 * 60 * 1000;
import {SESSION_STORAGE} from '../../common/models';
import {HAS_PENDING_LEARN_SUBMISSION} from '../../common/constants';

@Injectable()
export class UserEffects {

	constructor(
		private actions$: Actions, private store: Store<State>,
		private userDataSvc: UserDataService,
		private router: Router, private toastrService: ToastrService,
		private modalService: BsModalService,
		private ngZone: NgZone,
		@Inject(LOCAL_STORAGE) private localStorage: Storage,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage
	) {}
	private tokenRefreshTimeout: Timeout;

	initToUser$ = createEffect(() => this.actions$.pipe(
		ofType(ROOT_EFFECTS_INIT),
		map(() => actions.userGetDetails())
	));

	initToUserRate$ = createEffect(() => this.actions$.pipe(
		ofType(ROOT_EFFECTS_INIT),
		tap(() => {
			const savedVal = this.localStorage.getItem(PLAYBACKRATE_KEY);
			if (savedVal) {
				this.store.dispatch(userInitPlaybackRate({rate: +savedVal}));
			}
		})
	), {dispatch: false});

	saveUserPlaybackRate$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userSetPlaybackRate),
		tap(action => {
			this.localStorage.setItem(PLAYBACKRATE_KEY, action.rate.toString());
		}),
	), {dispatch: false});

	loginUser$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userLogInComplete),
		map(action => actions.userGetDetails())
	));
	getUserPreferences$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userSetDetails),
		filter(a => !!a.user),
		throttleTime(USER_PREFERENCES_INTERVAL),
		mergeMap(action => {
			return this.userDataSvc.getUserPreferences().pipe(
				map(p => userSetPreferences({preferences: p})),
			);
		})
	));

	logoutUser$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userLogOutRequested),
		mergeMap(() => from(Auth.signOut())
			.pipe(
				tap(r => console.log('signout', r)),
				map(() => {
					this.router.navigate(['auth/signin']);
					this.toastrService.success('Logged Out');

					return actions.userLogOutCompleted();
				}),
				catchError(() => of(actions.userLoginError({message: 'An error occurred during logout.'})))
			))
	)
	);

	loadUser$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userGetDetails),
		mergeMap(() => from([Auth.currentAuthenticatedUser(), Auth.currentUserInfo()])//Auth.currentAuthenticatedUser())
			.pipe(
				mergeAll(),
				map(curUser => UserEffects.cognitoUserToUser(curUser)),
				map(user => actions.userSetDetails({user})),
				catchError(() => EMPTY) //TODO
			))
	)
	);

	refreshToken$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userSetDetails),
		debounceTime(3000),
		tap(() => {
			Auth.currentSession().then(s => {
				//Get the expire date of the current token and calculate a time 5 minutes before it expires to refresh the current session
				const expirationDate = s.getAccessToken().getExpiration() * 1000; //get the expiration timestamp
				// console.log('got expire date', expirationDate, new Date(expirationDate));
				const fromNow = expirationDate - Date.now();
				const scheduledTimeout = fromNow - (5 * 60 * 1000);

				//if we have a previous watcher, clear it (e.g. we got a new token via a different mechanism)
				if (this.tokenRefreshTimeout) {
					clearTimeout(this.tokenRefreshTimeout);
					this.tokenRefreshTimeout = null;
				}

				// schedule the refresh of the token
				// console.log('scheduling refresh for', new Date(Date.now() + scheduledTimeout));
				this.ngZone.runOutsideAngular(() => {
					this.tokenRefreshTimeout = global.setTimeout(() => {
						console.log('token about to expire. Reloading user.');

						Auth.currentUserPoolUser().then(u => {
							return u.refreshSession(s.getRefreshToken(), (err, res) => {
								console.log('refreshed session', !err);
								if (!err) {
									this.ngZone.run(() => {
										this.store.dispatch(actions.userSessionRefreshed());
									});
								}
							});
						}, err => console.log('unable to refresh user session', err));
					}, scheduledTimeout);
				});
			});
		})
	), {dispatch: false});

	loginUserRedirect$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userLogInComplete),
		withLatestFrom(this.store),
		tap(([action, store]) => {
			if (!action.allowNavigate) return;

			if (store.user.pendingRedirectUrl) {
				console.log('post login redirect', store.user.pendingRedirectUrl);
				//window.location.href = store.user.pendingRedirectUrl;
				this.router.navigateByUrl(store.user.pendingRedirectUrl).then(r => console.log('navigated to ', r));
				this.store.dispatch(actions.userSetPostLoginUrl({url: null}));
			} else if (store.enrollment.pendingEnroll) {
				//don't need to redirect the enroll effect will take care of that
				this.toastrService.success(
					'Enrolling in ' + this.simpleMdPipe.transform(store.enrollment.pendingEnroll.title),
					'',
					{ enableHtml: true, timeOut: 1000}
				);
			} else {
				//if there is no redirect url, then a login should nagivate back to home
				this.router.navigateByUrl('/');
			}
		})
	), {dispatch: false});


	socialSignIn$ = createEffect(() => this.actions$.pipe(
		ofType(actions.socialLogInComplete),
		tap(i => {
			this.userDataSvc.markSocialSigninComplete().subscribe(r => {
				console.log('marked social signin', r);
				if (this.sessionStorage.getItem(HAS_PENDING_LEARN_SUBMISSION)) {
					this.router.navigateByUrl('/learn/thank-you').then(navigateSucceeded => {
						console.log('navigated', navigateSucceeded);
					});
				}
			});
		})
	), {dispatch: false});

	accountConfirmed$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userConfirmComplete),
		filter(action => !!action.email),
		tap(action => {
			this.userDataSvc.markAccountVerified(action.email).subscribe(
				res => console.log('marked account verified', res),
				err => console.log('error marking account verified', err)
			);
		})
	), {dispatch: false});

	accountIsStillMergingCheck$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userSetDetails),
		filter(a => a.user.hasMergeAccounts),
		delay(10001),
		map(a => actions.userGetDetails()),
		take(3),
	));

	accountMergeCheck$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userSetDetails),
		tap(action => {
			const unlinkedAccounts = action.user.matchedAccounts && action.user.matchedAccounts.filter(a => a.status === 'found');
			if (unlinkedAccounts && unlinkedAccounts.length) {

				const matchingAccounts: UserMatchSelection[] = [];

				//put together accounts to show the user (note, these create a copy of the matchingAccounts list, so this won't impact the actual value)
				matchingAccounts.push(...unlinkedAccounts.map(i => ({
					...i,
					selected: false,
					current: false
				})));
				matchingAccounts.push({
					status: 'linked',
					userId: action.user.id,
					current: true,
					selected: true,
					email: action.user.email,
					type: action.user.userType
				});

				//if we have an old version of this popup, close it.
				this.cleanUpPopupModalIfExists();

				this.mergeAccountModalState.ref = this.modalService.show(MatchingAccountsComponent, {
					initialState: { matchingAccounts },
					class: 'modal-lg modal-dialog-centered modal-dialog-scrollable'
				});

				this.mergeAccountModalState.subscription = this.modalService.onHide.subscribe(res => {
					console.log('modal closed with', res, this.mergeAccountModalState.shouldIgnoreUpcomingClose);
					if (!this.mergeAccountModalState.shouldIgnoreUpcomingClose) {
						this.store.dispatch(actions.userMergeModalAccountClosed());
						this.mergeAccountModalState.ref = null;
					}
					this.mergeAccountModalState.shouldIgnoreUpcomingClose = false;
				});
			} else if (this.mergeAccountModalState.ref) {
				this.cleanUpPopupModalIfExists();
			}
		})
	), {dispatch: false});

	signoutOnMergeModalCloseWithChanges$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userMergeModalAccountClosed),
		withLatestFrom(this.store),
		filter(([a, state]) => state.user.madeAccountMergeChanges),
		map(() => actions.userLogOutRequested())));

	profileUpdateToHubspot$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userProfileUpdate),
		tap(action => {
			this.userDataSvc.markProfileSubmit(action.user).subscribe(
				res => console.log('marked account profile updated', res),
				err => console.log('error marking profile update', err)
			);
		})
	), {dispatch: false});

	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();
	private mergeAccountModalState: {
		ref: BsModalRef,
		shouldIgnoreUpcomingClose: boolean,
		subscription: Subscription
	} = {
			ref: null,
			shouldIgnoreUpcomingClose: false,
			subscription: null
		};

	static cognitoUserToUser(curUser: any): User|null {
		if (!curUser) return null;

		const parsedAddress = (curUser.attributes.address && curUser.attributes.address.split('\n')) || [];
		const cityLine = (parsedAddress[1] && parsedAddress[1].split(/[,\s]+/)) || []; //TODO fix

		let matchedAccounts: UserMatch[] = [];
		if (curUser.attributes['custom:matched_accounts']) {
			try {
				const parsedAccounts = JSON.parse(curUser.attributes['custom:matched_accounts']);
				matchedAccounts = parsedAccounts.map(i => ({
					type: i.prov !== 'Cognito' ? i.prov : 'Email',
					email: i.email,
					status: i.state,
					userId: i.sub
				}));
			} catch (e) {
				console.log('Unable to parse matched accounts', curUser.attributes['custom:matched_accounts']);
			}
		}

		let hasMergeAccounts = false;
		if (curUser.attributes['custom:merge_with_users']) {
			try {
				const users = JSON.parse(curUser.attributes['custom:merge_with_users']);
				hasMergeAccounts = users && users.length > 0;
			} catch (e) {
				console.log('Unable to parse merge_with_users', e, curUser.attributes['custom:merge_with_users']);
			}
		}
		let userType: UserType;
		if (/^Google_(\d+)$/i.test(curUser.username)) {
			userType = UserType.Google;
		} else if (/^Facebook_(\d+)$/i.test(curUser.username)) {
			userType = UserType.Facebook;
		} else {
			userType = UserType.Email;
		}

		// console.log('got matched accounts', matchedAccounts);
		return {
			id: curUser.attributes.sub,
			userType,
			email: curUser.attributes.email,
			username: curUser.attributes.username, //TODO fix this if we use to an email alias
			firstname: curUser.attributes.given_name,
			lastname: curUser.attributes.family_name,
			title: curUser.attributes['custom:title'],
			address: curUser.attributes['custom:address_line1'], //curUser.attributes.address,
			city: curUser.attributes['custom:address_city'], //TODO
			state: curUser.attributes['custom:address_state'], //'MI',
			zip: curUser.attributes['custom:address_postal_code'], //'49283',,
			matchedAccounts,
			hasMergeAccounts
		};
	}

	private cleanUpPopupModalIfExists() {
		if (this.mergeAccountModalState.ref) {
			if (this.mergeAccountModalState.subscription) {
				this.mergeAccountModalState.subscription.unsubscribe();
				this.mergeAccountModalState.subscription = null;
			}

			this.mergeAccountModalState.shouldIgnoreUpcomingClose = true;

			this.mergeAccountModalState.ref.hide();
			this.mergeAccountModalState.ref = null;
		}
	}
}
