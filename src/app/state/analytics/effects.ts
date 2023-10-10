/* istanbul ignore file */
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {State} from '../index';
import {Injectable, NgZone} from '@angular/core';
import {debounceTime, tap, withLatestFrom, sampleTime, take} from 'rxjs/operators';
import {ActivatedRoute,  Router} from '@angular/router';

import * as courses from '../courses/actions';
import * as enrollmentActions from '../enrollment/actions';

import * as user from '../user/actions';
import { FacebookPixelEventTrackerService } from '../../services/facebook-pixel-event-tracker.service';
import { combineLatest } from 'rxjs';

import { Angulartics2Intercom, Angulartics2GoogleTagManager } from 'angulartics2';

import {audioDownloaded, donateClicked, pdfClicked} from '../ui/actions';
import {UserDataService} from '../../services/user-data.service';
import {selectCurrentStateSystemIds} from '../courses/selectors';
import {WindowTrackingService} from '../../services/window-tracking.service';
import {WindowBehaviorService} from '../../services/window-behavior.service';
import {RxNgZoneScheduler} from 'ngx-rxjs-zone-scheduler';
import {UtmService} from '../../services/utm.service';

@Injectable()
export class AnalyticsEffects {
	accountCreate$ = createEffect(() => combineLatest([
		this.actions$.pipe(ofType(user.userSetDetails)),
		this.actions$.pipe(ofType(user.userConfirmComplete)),
	]).pipe(
		debounceTime(1000),
		take(1),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			this.windowTrackingService.trackEvent({
				...this.utmService.getUtmCodes(),
				event: 'accountCreate',
				accountCreateLabel: state.user.currentUser && state.user.currentUser.id || '',
			});
			//TODO this might need to be renamed. It's not really tracking an event here
			this.windowTrackingService.trackEvent({
				firstName: state.user.currentUser?.firstname,
				lastName: state.user.currentUser?.lastname,
				email: state.user.currentUser?.email
			});

			this.facebookPixelEventTracker.trackEvent('CompleteRegistration', { value: state.user.currentUser.email || '' });
			this.intercom.eventTrack('userAccountCreated', {});
		})
	), {dispatch: false});

	accountSet$ = createEffect(() => this.actions$.pipe(
		ofType(user.userSetDetails),
		debounceTime(5000),
		tap(action => {
			this.intercom.setUserProperties({
				email: action.user && action.user.email,
				id: action.user && action.user.id,
				name: `${action.user && action.user.firstname} ${action.user && action.user.lastname}`,
				created_at: 1578441600 //don't have the actual create time on the object
			});
		})
	), {dispatch: false});

	accountUpdated$ = createEffect(() => this.actions$.pipe(
		ofType(user.userProfileUpdate),
		tap(action => {
			this.intercom.eventTrack('userAccountUpdated', {});
		})
	), {dispatch: false});

	donationClicks$ = createEffect(() => this.actions$.pipe(
		ofType(donateClicked),
		tap(action => {
			this.intercom.eventTrack('donateClicked', {donationUrl: action.donateUrl});
		})
	), {dispatch: false});

	pdfDownloaded$ = createEffect(() => this.actions$.pipe(
		ofType(pdfClicked),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			const ids = selectCurrentStateSystemIds(state);
			const courseId = ids.courseId;
			const lectureId = ids.lessonId;
			this.dataService.markFileDownload(courseId, lectureId, action.pdfUrl, action.readingType).subscribe(() => {
				//don't need to do anything
			});
			this.intercom.eventTrack('pdfClicked', {fileUrl: action.pdfUrl, type: action.readingType});
		})
	), {dispatch: false});

	audioDownloaded$ = createEffect(() => this.actions$.pipe(
		ofType(audioDownloaded),
		tap(action => {
			this.dataService.markFileDownload(action.courseId, action.lectureId, action.url, 'audio').subscribe(() => {
				//don't need to do anything
			});
			this.intercom.eventTrack('audioDownloaded', {fileUrl: action.url, courseId: action.courseId, lectureId: action.lectureId});
		})
	), {dispatch: false});

	userLogIn$ = createEffect(() => combineLatest([
		this.actions$.pipe(ofType(user.userSetDetails)),
		this.actions$.pipe(ofType(user.userLogInComplete)),
	]).pipe(
		debounceTime(1000),
		take(1),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			const userId = state.user.currentUser && state.user.currentUser.id;
			const userEmail = state.user.currentUser && state.user.currentUser.email;
			const userFname = state.user.currentUser && state.user.currentUser.firstname;
			const userLname = state.user.currentUser && state.user.currentUser.lastname;

			this.windowTrackingService.trackEvent({
				...this.utmService.getUtmCodes(),
				event: 'userLogin',
				userLoginLabel: state.user.currentUser && state.user.currentUser.id || '',
			});

			this.facebookPixelEventTracker.trackEvent('UserLogin', { value: userEmail || '' }, true);


			this.intercom.eventTrack('userLogin', {});
		})
	), {dispatch: false});

	landingPageLoad$ = createEffect(() => this.actions$.pipe(
		ofType(courses.landingPageLoaded),
		tap(triggerActions => {
			// Tell GTM which landing template the visitor is using in the A/B test
			this.windowTrackingService.trackEvent({ 'Landing-Template-Version': triggerActions.version });

			// NOTE: Due to some changes in how this event is being used in Google Analytics for marketing purposes,
			// the event is no longer strictly used for A/B testing and additionally encompasses any advertised views
			// (i.e. has a utm_source attached).
			// It hasn't been renamed since that would break some of the GA reporting.
			this.windowTrackingService.trackEvent({ event: 'landingPageABView' });
		})
	), {dispatch: false});

	enrollInCourse$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.enrollInCourseRequested),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			this.windowTrackingService.trackEvent({
				...this.utmService.getUtmCodes(),
				event: 'courseInquiry',
				course: action.course.title,
			});
			//TODO this might need to be renamed. It's not really tracking an event here
			this.windowTrackingService.trackEvent({
				firstName: action.firstname,
				lastName: action.lastname,
				email: action.email
			});
		})
	), {dispatch: false});

	enrollInCourseComplete$ = createEffect(() => this.actions$.pipe(
		ofType(enrollmentActions.enrollInCourseComplete),
		withLatestFrom(this.store),
		tap(([action, state]) => {
			// Push a virtual page view to GA for enrollment tracking
			this.windowTrackingService.trackEvent({
				...this.utmService.getUtmCodes(),
				event: 'virtualPageView',
				virtualPagePath: '/enrollment-confirmation',
				virtualPageTitle: 'Enrollment Confirmation'
			});

			this.windowTrackingService.trackEvent({
				...this.utmService.getUtmCodes(),
				event: 'courseEnrollment',
				course: action.course.title
			});

			// Only submit the GTM event if the visitor was advertised to (i.e. has a utm_source)
			if (state.user.hasUtm) this.windowTrackingService.trackEvent({ event: 'landingPageEnrollFormSubmissionSuccess' });

			// Submit enrollment trigger to Facebook
			this.facebookPixelEventTracker.trackEvent('CompleteRegistration', { content_name: action.course.title });
			this.intercom.eventTrack('enrolledInCourse', {course: action.course.title});
		})
	), {dispatch: false});

	videoPlay$ = createEffect(() => this.actions$.pipe(
		ofType(courses.setVideoPlay),
		tap(action => {
			// Submit play event to Facebook
			this.facebookPixelEventTracker.trackEvent('VideoPlay', { video_title: action.title }, true);
		})
	), {dispatch: false});

	videoProgress$ = createEffect(() => this.actions$.pipe(
		ofType(courses.setVideoProgress, courses.setVideoProgressForce),
		sampleTime(10000, this.zoneScheduler.leaveNgZone()),
		tap((action) => {
			this.windowTrackingService.trackEvent({
				event: 'videoProgress',
				videoProgressLabel: this.windowBehaviorService.getCurrentUrl() + '|' + action.videoId,
			});
		})
	), {dispatch: false});

	videoComplete$ = createEffect(() => this.actions$.pipe(
		ofType(courses.setVideoReachedEnd),
		tap(action => {
			this.facebookPixelEventTracker.trackEvent('VideoComplete', { video_id: action.videoId }, true);
		})
	), {dispatch: false});

	constructor(
		private actions$: Actions,
		private router: Router,
		private currentRoute: ActivatedRoute,
		private store: Store<State>,
		private facebookPixelEventTracker: FacebookPixelEventTrackerService,
		private intercom: Angulartics2Intercom,
		private dataService: UserDataService,
		private utmService: UtmService,
		private windowTrackingService: WindowTrackingService,
		private windowBehaviorService: WindowBehaviorService,
		angulartics2GoogleTagManager: Angulartics2GoogleTagManager,
		private zoneScheduler: RxNgZoneScheduler,
	) {
		angulartics2GoogleTagManager.startTracking();
		intercom.startTracking();
	}
}

