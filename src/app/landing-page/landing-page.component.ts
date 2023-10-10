import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import { CourseDataService } from '../services/course-data.service';
import { filter, map, mergeMap, share, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { State } from '../state';
import { selectCurrentCourse, selectIsEnrolledInCurrentCourseNullIfWaiting, selectTestimonials } from '../state/courses/selectors';
import { combineLatest, forkJoin, of, Subscription } from 'rxjs';
import { landingPageLoaded, setCurrentCourse } from '../state/courses/actions';
import { selectCurrentUserWithUtmStatus } from '../state/user/selectors';
import { Title, Meta, TransferState, StateKey, makeStateKey } from '@angular/platform-browser';
import { HcSimpleMdPipe } from 'hillsdale-ng-helper-lib';
import { setCourseMetaTags, removeURLParameter } from '../common/helpers';
import { WindowBehaviorService } from '../services/window-behavior.service';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser, isPlatformServer, Location } from '@angular/common';
import { markHeaderVisibility } from '../state/ui/actions';
import { SESSION_STORAGE } from '../common/models';
import { EARLY_ACCESS_TOKEN } from '../common/constants';

@Component({
	selector: 'app-landing-page',
	templateUrl: './landing-page.component.html',
	styleUrls: ['./landing-page.component.less']
})
export class LandingPageComponent implements OnDestroy, OnInit, AfterViewInit {
	@ViewChild('enrollForm') enrollForm: ElementRef;
	@ViewChild('enrollButton') enrollButton: ElementRef;

	paramsSub: Subscription;

	stateKey = makeStateKey('landing-page:version');

	forceUnstuck = false;

	isFirstComponent = false;
	hideTrailerOverlay = false;

	preEnrollmentActive = false;

	earlyAccessToken: string = null;
	pageVersion: string = null;

	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();
	testimonials$ = this.store.pipe(select(selectTestimonials(3)));

	course$ = this.store.pipe(
		select(selectCurrentCourse),
		filter(c => !!c),
		tap(c => {
			// console.log('got course');

			this.route.url.subscribe(url => {
				if (url.findIndex(x => x.path === 'prereg') > -1 && CourseDataService.hasPublicationDatePassed(c)) {
					this.router.navigate(['/landing', c.url_slug]);
				} else if (url.findIndex(x => x.path === 'register') > -1){
					if(CourseDataService.isInPreRegPageCampaignWindow(c) === false){
						this.router.navigate(['/landing', c.url_slug]);
					}
				}
			});

			// If user uses early-access link after course is published, send them to course landing page
			if (!!this.earlyAccessToken && CourseDataService.hasPublicationDatePassed(c)) {
				this.router.navigate(['/landing', c.url_slug]);
			}

			// Calculate the average lecture duration
			// console.log('Course:', c);

			this.preEnrollmentActive = CourseDataService.courseIsPreEnrollWithDefault(c, !!this.earlyAccessToken);
			// console.log('Pre-enrollment -- Publication date:', c.publication_date);
			// console.log('Pre-enrollment -- Now:', new Date());
			// console.log('Pre-enrollment --', this.preEnrollmentActive);


			// Update the page title to with the Course title
			this.titleService.setTitle(this.simpleMdPipe.transform(c.title, 'plaintext') + ' | Hillsdale College Online Courses');
			setCourseMetaTags(c, this.meta, this.simpleMdPipe, this.windowBehaviorService.getCurrentUrl());
		})
	);

	userStatus$ = this.store.pipe(
		select(selectCurrentUserWithUtmStatus),
		map(u => ({
			isLoggedIn: !!u.user,
			email: (!!u.user ? u.user.email : ''),
			shouldRenderDefaultLanding: true//u.hasUtm || this.isFirstComponent
		}))
	);

	isEnrolledInCourse$ = this.store.pipe(
		select(selectIsEnrolledInCurrentCourseNullIfWaiting),
		withLatestFrom(this.store),
		filter(([isEnrolled, state]) => !!isEnrolled && !!state.course.currentCourse),
		map(([isEnrolled, state]) => state.course.currentCourse),
		share()
	);

	courseAndUser$ = combineLatest([
		this.course$,
		this.userStatus$,
	]).pipe(
		takeUntil(this.isEnrolledInCourse$),
		map(([course, userStatus]) => ({ course, userStatus })),
		tap(c => {
			this.store.dispatch(markHeaderVisibility({
				isVisible: !this.isFirstComponent//!c.userStatus.shouldRenderDefaultLanding
			}));
		})
	);

	enrolledWatchSub = this.isEnrolledInCourse$.subscribe(crsSlug => {
		setTimeout(() => {
			console.log('user is already enrolled. Redirecting');
			this.toastr.info('You are enrolled. Taking you to your course page.');
			this.router.navigateByUrl(`/courses/${crsSlug}`);
		}, 1000);
	});

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private store: Store<State>,
		private meta: Meta,
		private titleService: Title,
		private windowBehaviorService: WindowBehaviorService,
		private toastr: ToastrService,
		private transferState: TransferState,
		@Inject(PLATFORM_ID) private _platformId,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage,
		private location: Location
	) {
		this.isFirstComponent = !this.router.getCurrentNavigation()?.previousNavigation;
	}

	ngOnInit() {
		// if we got the campaignId parameter, then get the details for that campaign
		this.paramsSub = combineLatest([this.route.params, this.route.url])
			.pipe(
				take(1),
				map(x => ({ routeParams: x[0], routeUrl: x[1] })),
				map((o: { routeParams: Params, routeUrl: UrlSegment[] }) => {
					if (o.routeUrl.map(x => x.path).includes('prereg') || o.routeUrl.map(x => x.path).includes('register')) {
						return { courseId: o.routeParams.courseId, contentId: o.routeParams.contentId, pageVersion: 'prereg' };
					} else {
						return { courseId: o.routeParams.courseId, contentId: o.routeParams.contentId, pageVersion: o.routeParams.pageVersion };
					}
				}),
				filter(p => p.courseId),
				tap(p => {
					if (p.pageVersion) {
						this.pageVersion = p.pageVersion?.toLowerCase();

						if (isPlatformServer(this._platformId)) {
							this.transferState.set(this.stateKey, p.pageVersion);
						}
					}
				})
			)
			.subscribe(
				params => {
					this.store.dispatch(setCurrentCourse({ currentCourse: params.courseId }));

					//TODO what if this isn't a lesson?
					// if (params.contentId) this.store.dispatch(setCurrentLesson({ currentLesson: params.contentId }));
				},
				err => console.log('err', err)
			);

		if (isPlatformBrowser(this._platformId)) {
			if (this.transferState.hasKey(this.stateKey)) {
				this.pageVersion = this.transferState.get<string>(this.stateKey, null);
			}
			this.route.queryParams.subscribe(params => {
				this.store.dispatch(landingPageLoaded({ hasUtm: params.hasOwnProperty('utm_source'), version: this.pageVersion }));
				if (params.earlyAccessToken) {
					this.sessionStorage.setItem(EARLY_ACCESS_TOKEN, params.earlyAccessToken);
					// remove the earlyAccessToken param from the end of the URL
					const newState = removeURLParameter(window.location.href.replace(window.location.origin, ''), 'earlyAccessToken');
					this.location.replaceState(newState);
				}
			});
		} else {
			this.store.dispatch(landingPageLoaded({ hasUtm: true, version: this.pageVersion }));
		}
	}
	ngOnDestroy() {
		if (this.paramsSub && !this.paramsSub.closed) {
			this.paramsSub.unsubscribe();
			this.paramsSub = null;
		}
		if (this.enrolledWatchSub && !this.enrolledWatchSub.closed) {
			this.enrolledWatchSub.unsubscribe();
			this.enrolledWatchSub = null;
		}
	}

	ngAfterViewInit() {
		// Set up observer for when #enrollButton enters view, and then force unstuck
		// var observeSticky = new IntersectionObserver(function(entries) {
		// 	if(entries[0].isIntersecting === true) {
		// 		this.forceUnstuck = true;
		// 	} else {
		// 		this.forceUnstuck = false;
		// 	}
		// 	console.log(this.forceUnstuck);
		// }, { threshold: [0] });
		// console.log(this.enrollButton)
		// observeSticky.observe(this.enrollButton.nativeElement);
		// console.log("Observing Force Unstuck");
	}
}
