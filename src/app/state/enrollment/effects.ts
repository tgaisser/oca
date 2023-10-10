import {Actions, createEffect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';
import {select, Store} from '@ngrx/store';
import {State} from '../index';
import {UserDataService} from '../../services/user-data.service';
import {Inject, Injectable} from '@angular/core';
import * as courseActions from '../courses/actions';
import * as userActions from '../user/actions';
import * as userSelectors from '../user/selectors';
import {catchError, concatMap, filter, map, mergeMap, tap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {defer, EMPTY, of} from 'rxjs';

import * as enrollmentActions from './actions';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {UserService} from '../../services/user.service';
import {LoadingService} from '../../common/loading.service';
import {setPendingEnroll} from './actions';
import {Course, CourseDataService} from '../../services/course-data.service';
import {LOCAL_STORAGE} from '../../common/models';
import { BsModalService } from 'ngx-bootstrap.local/modal';
import { DonationPortalComponent } from '../../common/donation-portal/donation-portal.component';

@Injectable()
export class EnrollmentEffects {
	public static readonly PENDING_ENROLL_KEY = 'PendingEnrollment';
	public static readonly PENDING_ENROLL_STUDY_GROUP_KEY = 'PendingEnrollmentStudyGroup';

	reloadPendingEnrollment$ = createEffect(() => this.actions$.pipe(
		ofType(ROOT_EFFECTS_INIT),
		mergeMap(() => {
			try {
				const pendingEnroll = this.localStorage.getItem(EnrollmentEffects.PENDING_ENROLL_KEY);
				if (pendingEnroll) {
					return of(enrollmentActions.setPendingEnroll({
						course: JSON.parse(pendingEnroll),
						studyGroupId: this.localStorage.getItem(EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY)
					}));
				}
			} catch (e) {
				console.error('unable to restore enrollment');
			}
			return EMPTY;
		})
	));

	getEnrolledCourses$ = createEffect(() => this.actions$.pipe(
		ofType(courseActions.courseListRequested, userActions.userSetDetails, courseActions.setCurrentCourse),
		withLatestFrom(this.store),
		filter(([action, state]) => !!state.user.currentUser), //if there is no user, we don't need to retrieve current info
		throttleTime(10000),
		mergeMap(([action, state]) => {
			//get the enrolled courses
			return this.progressSvc.getEnrolledCourses()
				.pipe(
					map(result => enrollmentActions.setEnrolledCourses({courses: result})), //TODO update to include all
					catchError(e => {
						console.error('enrollment error', e, state);

						this.toastr.error('Unable to retrieve enrollment information. Please try again later');
						// this.router.navigateByUrl('/'); //TODO is this needed?

						return EMPTY;
					}) //of(courseActions.userLoginError({message: 'An error occurred during login.'})))
				);
		})
	)
	);

	clearEnrollmentStatusOnLogout$ = createEffect(() => this.actions$.pipe(
		ofType(userActions.userLogOutCompleted),
		map(a => enrollmentActions.setEnrolledCourses({courses: []}))
	));

	getStudySessionDetails$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.setEnrolledCourses),
		tap(action => {
			action.courses.filter(c => c.studyGroupId).forEach(c => {
				this.store.dispatch(courseActions.getStudyGroup({studyGroupID: c.studyGroupId}));
			});
		})
	), {dispatch: false});

	courseEnroller$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.enrollInCourseRequested),
		throttleTime(5 * 1000), //once you get one enroll request, ignore any further ones for 5 seconds (prevents double clicks)
		concatMap(action => of(action).pipe(
			withLatestFrom(this.store.pipe(select(userSelectors.selectCurrentUser)))
		)),
		tap(([action, currentUser]) => {
			//if the user is not signed in, then navigate to the signin/up page.
			const userEmail = (currentUser && currentUser.email) || action.email;

			if (userEmail) {
				//mark this as an inquiry
				if (action.studyGroupId) {
					this.progressSvc.markCourseStudyGroup(userEmail, action.course).subscribe(
						res => console.log('marked study group', res),
						err => console.error('error marking study group', err)
					);
				} else {
					this.progressSvc.markCourseInquiry(userEmail, action.course).subscribe(
						res => console.log('marked inquiry', res),
						err => console.error('error marking inquiry', err)
					);
				}
			}
			if (!currentUser) {
				// Should this crs just be a full copy of action.course?
				const crs = {
					system_id: action.course.system_id, title: action.course.title, url_slug: action.course.url_slug, publication_date: action.course.publication_date
				} as Course;
				this.store.dispatch(setPendingEnroll({
					email: action.email,
					studyGroupId: action.studyGroupId,
					course: crs,
					isFirstLoad: true,
				}));
				//save the current enrollment request in case they have to re-open the browser (then we can reload it)
				this.localStorage.setItem(EnrollmentEffects.PENDING_ENROLL_KEY, JSON.stringify(crs));

				if (action.studyGroupId) {
					this.localStorage.setItem(EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY, action.studyGroupId);
				} else {
					this.localStorage.removeItem(EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY);
				}

				if (!action.email) {
					this.router.navigate(['/', 'auth', 'signup'], {queryParamsHandling: 'preserve'}).then(r => {
						if (!r) console.log('navigation failed');
					});
					return;
				}

				//check the availability of the username. If it's available, start them at sign-up. If not, start at login
				this.userService.isUsernameAvailable(action.email).pipe(withLatestFrom(this.store)).subscribe(([isAvailable, state]) => {
					if (isAvailable) {
						if (state.enrollment.isAccountCreationOnLandingPageEnabled) {
							this.store.dispatch(enrollmentActions.setLandingPageAccountCreationForm({showLandingPageAccountCreationForm: true}));
						} else {
							this.router.navigate(
								['/', 'auth', 'signup'],
								{
									queryParams: {
										title: action.title || null,
										firstname: action.firstname || null,
										lastname: action.lastname || null,
										email: action.email,
									},
									queryParamsHandling: 'merge'
								}
							).then(r => {
								if (!r) console.log('navigation failed');
							});
						}
					} else {
						this.toastr.info('This email is connected to an existing account. Please sign in to complete enrollment.');
						this.router.navigate(
							['/', 'auth', 'signin'],
							{
								queryParams: {
									email: action.email,
								},
								queryParamsHandling: 'merge'
							}
						).then(r => {
							if (!r) console.log('navigation failed');
						});
					}
				});
				return;
			}


			this.loadingService.show();
			//if the user is signed in, just enroll them and dispatch the enrollment complete event
			this.progressSvc.enrollInCourse(action.course.system_id, action.studyGroupId).subscribe(r => {
				this.store.dispatch(enrollmentActions.enrollInCourseComplete({course: action.course, enrollment: r}));
				this.loadingService.hide();
			}, err => {
				console.error('enrollment error', err);
				this.toastr.error('Unable to enroll in course. Please try again later.');
				this.store.dispatch(enrollmentActions.enrollInCourseCancelled({course: action.course}));
				this.loadingService.hide();
			});
		})
	), {dispatch: false});

	courseInquiry$ = createEffect(() => this.actions$.pipe(
		ofType(setPendingEnroll),
		filter(a => !!a.email && a.isFirstLoad),
		throttleTime(5 * 1000), //once you get one enroll request, ignore any further ones for 5 seconds (prevents double clicks)
		mergeMap(action => this.progressSvc.inquireInCourse(
			action.course.system_id,
			action.email,
			action.studyGroupId
		).pipe(
			map(res => enrollmentActions.inquireInCourseComplete({inquiry: res})),
			catchError(err => {
				console.error('error marking course inquiry (DB)', err);
				return EMPTY;
			}),
		)
		)
	));

	courseEnrollerOnLogin$ = createEffect(() => this.actions$.pipe(
		ofType(userActions.userLogInComplete, userActions.userConfirmComplete),
		withLatestFrom(this.store),
		filter(([action, state]) => action.allowNavigate && !!state.enrollment.pendingEnroll),
		// when a new user confirms, we only care about _either_ the login or the confirm (not both),
		// ignore any further ones for 5 seconds (prevents duplicate enroll on signup)
		throttleTime(5 * 1000),
		mergeMap(([action, state]) => {
			//Now that a user is logged in, we can enroll in this course
			return this.progressSvc.enrollInCourse(
				state.enrollment.pendingEnroll.system_id,
				state.enrollment.pendingStudyGroupId
			).pipe(
				map(r => {
					console.log('Enrolled in course', r);
					return enrollmentActions.enrollInCourseComplete({course: state.enrollment.pendingEnroll, enrollment: r});
				}),
				catchError(err => {
					console.error('enrollment error', err);
					this.router.navigate(['/', 'landing', state.enrollment.pendingEnroll.url_slug], {queryParamsHandling: 'preserve'}).then(r => {
						if (!r) console.log('failed to navigate to /landing/', state.enrollment.pendingEnroll.url_slug);
					});
					return EMPTY;
				})
			);
		})
	));

	//on enroll complete, navigate to course page
	courseEnrollCompleteNav$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.enrollInCourseComplete),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			this.localStorage.removeItem(EnrollmentEffects.PENDING_ENROLL_KEY);
			this.localStorage.removeItem(EnrollmentEffects.PENDING_ENROLL_STUDY_GROUP_KEY);
			if (state.enrollment.doDonationInquiry && state.enrollment.donationInquiryType === 'tab')  {
				this.store.dispatch(enrollmentActions.setDonationTab());
			} else {
				this.toastr.success('You\'ve enrolled in ' + this.simpleMdPipe.transform(action.course.title) + '.'
				+ (CourseDataService.hasPublicationDatePassed(action.course) ? ' Click lecture 1 to begin.' : ''), '', {enableHtml: true});
				this.router.navigate(['/', 'courses', action.course.url_slug], {queryParamsHandling: 'preserve'}).then(r => {

					if (state.enrollment.doDonationInquiry) {
						if (state.enrollment.donationInquiryType === 'modal') this.store.dispatch(enrollmentActions.setDonationModal());
					}

					// if the first navigation get rejected (likely something to do with the enrollment guard), just try again in half a second
					if (!r) {
						setTimeout(() => {
							this.router.navigate(['/', 'courses', action.course.url_slug], {queryParamsHandling: 'preserve'}).then(r2 => console.log('navigate (second attempt)', r2));
						}, 500);
					}
				});
			}
		})
	), {dispatch: false});

	/*Withdrawal*/
	courseWithdrawalReasonsRequested$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.getWithdrawalReasons),
		throttleTime(60 * 60 * 1000), //only get a new set of reasons once an hour
		mergeMap(action => this.progressSvc.getWithdrawalReasons().pipe(
			map(r => enrollmentActions.setWithdrawalReasons({reasons: r})),
			catchError(err => {
				console.log('error getting withdrawalReasons', err);
				return EMPTY;
			})
		))
	));

	//withdrawal can only happen when logged in
	courseWithdrawalRequested$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.withdrawFromCourseRequested),
		throttleTime(500), //once you get one withdraw request, ignore any further ones for 1/2 seconds (prevents double clicks)
		mergeMap(action => this.progressSvc.unenrollFromCourse(action.course.system_id, action.reason).pipe(
			map(r => {
				return enrollmentActions.withdrawFromCourseComplete({course: action.course, enrollment: r});
			}),
			catchError(err => {
				console.error('withdrawal error', err);
				return EMPTY;
			})
		)
		)
	));
	//on withdrawal complete, pop open success toast
	courseWithdrawalCompleteNav$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.withdrawFromCourseComplete),
		tap(action => {
			this.toastr.success('You\'ve successfully withdrawn from ' + this.simpleMdPipe.transform(action.course.title), '', {enableHtml: true});
		})
	), {dispatch: false});

	donationInquiryModal$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.setDonationModal),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			this.modalRef.show(
				DonationPortalComponent,
				{
					initialState: {url: state.enrollment.donationLink},
					class: 'modal-lg modal-dialog-centered modal-dialog-scrollable'
				}
			);
			this.store.dispatch(enrollmentActions.setDoDonationInquiry({doDonationInquiry: false}));  // set to false, it must be true to have gotten here.
			this.store.dispatch(enrollmentActions.setAccountCreationOnLandingPage({isAccountCreationOnLandingPageEnabled: false}));
		})
	), {dispatch: false});

	donationInquiryTab$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.setDonationTab),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			console.log('open tab');
			//window.open(state.enrollment.donationLink, '_blank');
			//window.open(`courses/${state.course.currentCourse}`, '_blank');

			//this.router.navigateByUrl(state.enrollment.donationLink);
			//this.store.dispatch(enrollmentActions.setAccountCreationOnLandingPage({isAccountCreationOnLandingPageEnabled: false}));
			window.location.href = state.enrollment.donationLink;
		})
	), {dispatch: false});
	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();

	constructor(
		private actions$: Actions,
		private store: Store<State>,
		private progressSvc: UserDataService,
		private userService: UserService,
		private loadingService: LoadingService,
		private router: Router,
		private toastr: ToastrService,
		private modalRef: BsModalService,
		@Inject(LOCAL_STORAGE) private localStorage: Storage
	) {	}
}
