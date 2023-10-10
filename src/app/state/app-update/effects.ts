import {Inject, Injectable, NgZone} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, timer} from 'rxjs';
import {filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import * as actions from './actions';
import * as coursesActions from '../courses/actions';
import * as enrollmentActions from '../enrollment/actions';
import * as notesActions from '../notes/actions';
import * as quizzesActions from '../quizzes/actions';
import * as uiActions from '../ui/actions';
import * as userActions from '../user/actions';
import {Store} from '@ngrx/store';
import {State} from '../index';
import {RxjsHelperService} from '../../services/rxjs-helper.service';
import {RxNgZoneScheduler} from 'ngx-rxjs-zone-scheduler';
import {SwUpdate} from '@angular/service-worker';
import {NavigationStart, Router} from '@angular/router';
import {selectDoUpdate} from './selectors';
import {DOCUMENT} from '@angular/common';

@Injectable()
export class AppUpdateEffects {

	FIFTEEN_MINUTES = 15 * 60 * 1000;

	userActive$ = createEffect(() => this.actions$.pipe(
		ofType(coursesActions.courseOpened, coursesActions.setCurrentCourse, coursesActions.setCurrentLesson,
			coursesActions.setCurrentLessonItem, coursesActions.landingPageLoaded, coursesActions.setVideoPlay,
			coursesActions.setVideoProgress, coursesActions.setVideoCompleted, enrollmentActions.enrollInCourseRequested,
			enrollmentActions.withdrawFromCourseRequested, notesActions.saveNotes, quizzesActions.submitQuiz,
			quizzesActions.getCourseQuizResults, uiActions.openModal, uiActions.closeModal, uiActions.openSidebar,
			uiActions.closeSidebar, uiActions.donateClicked, userActions.userLogInComplete,
			userActions.userProfileUpdate, userActions.userSessionRefreshed),
		this.rxjsHelper.throttle(10000, this.zoneScheduler.leaveNgZone()), //debounce for 10 seconds
		map((action) => actions.userActivity({description: action.type})),
	), {dispatch: true});

	userNavigation$ = createEffect(() => this.router.events.pipe(
		filter(event => event instanceof NavigationStart),
		mergeMap((e: NavigationStart) => {
			const isProtectedRoute = e.url.includes('/auth/profile') || e.url.includes('/auth/change-password') || e.url.includes('/auth/signup');
			return [
				actions.userAtProtectedRoute({protected: isProtectedRoute}),
				actions.userActivity({description: 'navigation'})
			];
		})
	), {dispatch: true});

	userActivityTimeout$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userActivity),
		tap(() => this.store.dispatch(actions.userInactive({userInactive: false}))),
		switchMap(() => {
			return timer(this.FIFTEEN_MINUTES, this.zoneScheduler.leaveNgZone());
		} ),
		map(() => actions.userInactive({userInactive: true})),
	), {dispatch: true});

	doUpdate$ = createEffect(() => this.actions$.pipe(
		ofType(actions.userInactive, actions.updateIsAvailable),
		withLatestFrom(this.store),
		filter(([action, state]) => selectDoUpdate(state)),
		mergeMap(([action, state]) => from(this.swUpdate.activateUpdate())),
		tap(() => this.document?.location?.reload()),
	), {dispatch: false});


	constructor(
		private actions$: Actions, private store: Store<State>, private rxjsHelper: RxjsHelperService,
		private ngZone: NgZone, private zoneScheduler: RxNgZoneScheduler, private swUpdate: SwUpdate,
		private router: Router, @Inject(DOCUMENT) private document: Document) {	}
}
