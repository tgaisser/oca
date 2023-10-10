import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, timer} from 'rxjs';
import Auth from '@aws-amplify/auth';
import {State} from '../state';
import {select, Store} from '@ngrx/store';
import {selectors, actions} from '../state/courses';
import {filter, map, tap, take, takeUntil} from 'rxjs/operators';
import {get} from 'lodash';
import {LoadingService} from '../common/loading.service';

@Injectable({
	providedIn: 'root'
})
export class EnrolledGuard implements CanActivate {
	constructor(private _router: Router, private state: Store<State>, private loadingSvc: LoadingService) {
	}

	canActivate(next: ActivatedRouteSnapshot, routeState: RouterStateSnapshot): Promise<boolean> {
		const targetingEnrollment = next.data.requiredEnrollmentStatus;
		// console.log('targetingEnrollment', targetingEnrollment);

		const requestedCourseSlug =
			get(routeState, '_root.children[0].value.params.courseId') ||
			get(routeState, '_root.children[0].children[0].value.params.courseId');
		// console.log('URL', routeState);
		// console.log('courseId', requestedCourseSlug);
		this.loadingSvc.show();

		if (requestedCourseSlug) {
			this.state.dispatch(actions.setCurrentCourse({currentCourse: requestedCourseSlug}));
		}

		return Auth.currentAuthenticatedUser()
			.then(() => {
				return this.state.pipe(
					select(selectors.selectIsEnrolledInCourseNullIfWaiting(requestedCourseSlug)),
					// select(selectors.selectMyCourseSlugsNullIfWaiting),
					filter(isEnrolled => isEnrolled !== null),
					//TODO filter out initial
					//map(courses => courses.includes(requestedCourseSlug)),
					takeUntil(timer(10000)), //wait up to 10 seconds for the enrolled data to return
					take(1),
				).toPromise();
			})
			.then(isEnrolled => {
				if (!isEnrolled && targetingEnrollment) this._router.navigate(['/landing/', requestedCourseSlug], {queryParams: next.queryParams});
				if (isEnrolled && !targetingEnrollment) this._router.navigate(['/courses/', requestedCourseSlug], {queryParams: next.queryParams});

				//hide loading indicator
				this.loadingSvc.hide();

				return targetingEnrollment ? isEnrolled : !isEnrolled;
			})
			.catch((e) => {
				console.log('error with user', e);

				//hide loading indicator
				this.loadingSvc.hide();

				//reroute them to the landing page (as that's safe even if not logged in)
				if (!/^\/(landing|study-group)\/.*/.test(routeState.url)) {
					this._router.navigate(['/landing/', requestedCourseSlug], {queryParams: next.queryParams});
				}

				//if we require non-enrollment, return true (not enrolled); if we require enrollment, return false (not enrolled)
				return !targetingEnrollment;
			});
	}
}
