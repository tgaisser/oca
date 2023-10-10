import {ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2, Inject, OnDestroy} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {State} from './state';
import {selectCurrentUser} from './state/user/selectors';
import * as userActions from './state/user/actions';
import {
	Router,
	NavigationEnd,
	NavigationStart,
	ActivatedRoute,
	PRIMARY_OUTLET,
	Scroll,
	ResolveEnd,
	ActivatedRouteSnapshot, RouterEvent
} from '@angular/router';
import {filter, map, tap} from 'rxjs/operators';
import { Title, Meta } from '@angular/platform-browser';
import * as uiActions from './state/ui/actions';
import * as uiSelectors from './state/ui/selectors';

import {faFacebookSquare, faTwitterSquare, faYoutubeSquare} from '@fortawesome/free-brands-svg-icons';

import { Hub } from '@aws-amplify/core';
import {DOCUMENT, ViewportScroller} from '@angular/common';
import { environment } from '../environments/environment';
import { selectCurrentCourse } from './state/courses/selectors';
import { DonationService } from './donation/donation.service';
import {WindowTrackingService} from './services/window-tracking.service';
import {WindowBehaviorService} from './services/window-behavior.service';
import {Subscription} from 'rxjs';
import {setNonCourseMetaTags} from './common/helpers';
import {markHeaderVisibility} from './state/ui/actions';
import {CheckForUpdateService} from './services/check-for-update.service';
import {SESSION_STORAGE} from './common/models';
import {UtmService} from './services/utm.service';
import {socialLogInComplete} from './state/user/actions';
import { SUPPORT_EMAIL } from './common/constants';

// eslint-disable-next-line no-var
declare var $;
// declare var TrackJS: any;



@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy, OnInit {
	@ViewChild('header') header: ElementRef;
	@ViewChild('main') main: ElementRef;
	@ViewChild('sidebarCollapse') sidebarCollapse: ElementRef;
	@ViewChild('primaryNav') primaryNav: ElementRef;

	faFacebook = faFacebookSquare;
	faTwitter = faTwitterSquare;
	faYoutube = faYoutubeSquare;

	// routeParamsSub: Subscription;
	navSub: Subscription;
	querySub: Subscription;
	scrollSub: Subscription;

	supportEmail = SUPPORT_EMAIL;

	currentYear = new Date().getFullYear();

	headerStatus$ = this.store.pipe(select(uiSelectors.selectHeaderStatus));
	sidebarStatus$ = this.store.pipe(select(uiSelectors.selectSidebarStatus));
	user$ = this.store.pipe(
		select(selectCurrentUser),
		tap(user => {
			// Push user info to Inspectlet
			if (user) {
				// console.log('Logged in username:', user);
				this.windowTrackingService.trackUserIdentity(user.email);
			}
		})
	);

	currentCourse$ = this.store.pipe(select(selectCurrentCourse), map(curCourse => ({
		isSelected: !!curCourse,
		donationUrl: (curCourse && curCourse.course_donation_url) || environment.defaultDonationUrl
	})));

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.store.dispatch(uiActions.setIsDesktop({isDesktop: this.windowBehaviorService.isDesktop()}));
	}


	constructor(
		private store: Store<State>,
		private router: Router,
		private renderer: Renderer2,
		private route: ActivatedRoute,
		private meta: Meta,
		private titleService: Title,
		private viewportScroller: ViewportScroller,
		private donationService: DonationService,
		private utmData: UtmService,
		@Inject(DOCUMENT) private document: Document,
		private windowTrackingService: WindowTrackingService,
		private windowBehaviorService: WindowBehaviorService,
		private checkForUpdateService: CheckForUpdateService,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage
	) {

		//init the screen size (needs to take place after sidebar load so that it can collapse it on mobile if needed)
		this.onResize(null);

		this.navSub = router.events.pipe(
			filter(event => event instanceof RouterEvent),
			tap(event  => {
				const e = event as RouterEvent;
				this.store.dispatch(markHeaderVisibility({
					isVisible: (e.url.indexOf('/landing/') === -1 && e.url.indexOf('/study-group/') === -1)
				}));
			}),
			filter(event => event instanceof NavigationEnd || event instanceof ResolveEnd)
		).subscribe((event: NavigationEnd|ResolveEnd) => {
			if (event instanceof NavigationStart) {
				this.store.dispatch(markHeaderVisibility({
					isVisible: (event.url.indexOf('/landing/') === -1 && event.url.indexOf('/study-group/') === -1)
				}));
				return;
			}

			const routeToUse = (event instanceof ResolveEnd) ? event.state.root : this.route.root;

			const hasSidebar = this.getSidebarConfigFromRoute(routeToUse);
			this.store.dispatch(uiActions.setHasSidebar({hasSidebar}));

			// Change page title
			const title = this.getTitleFromRoute(routeToUse);
			this.titleService.setTitle((!title ? '' : title + ' | ') + 'Hillsdale College Online Courses');

			// Change meta description
			const metaDescription = this.getMetaDescriptionFromRoute(routeToUse);
			setNonCourseMetaTags(this.meta, {meta_description: metaDescription});

			// Clear focus
			if (event instanceof NavigationEnd) {
				this.header.nativeElement.focus();

				// Submit Hubspot data
				this.windowTrackingService.trackUrlChange(this.router.url);

				// Close navigation menu
				if (this.primaryNav.nativeElement.classList.contains('active')) {
					// console.log('Header Nav -- Closing primary nav on route change');
					this.sidebarCollapse.nativeElement.click();
				}
			}
		});

		// Get route parameters
		// Currently only grabbing them on app load, and won't check again as the user navigates the app
		// (maybe move to 'on route change' in the future if there's a desire for in-app tracking)
		this.querySub = this.route.queryParams.subscribe(params => {
			// console.log('Query params found');
			// Send the query parameters to the user data service for UTM code processing
			this.utmData.setUtmCodes(params);
		});


		//https://stackoverflow.com/questions/44441089/angular4-scrolling-to-anchor
		//https://next.angular.io/api/router/ExtraOptions
		//https://www.npmjs.com/package/ngx-page-scroll
		let scrollTimeout = null;
		this.scrollSub = router.events.pipe(
			filter(e => e instanceof Scroll)
		).subscribe((e: Scroll) => {
			if (e.anchor) {
				// anchor navigation
				//if we get an anchor, but that anchor isn't on screen yet, try for up to three seconds to find it and scroll.
				if (!this.document.getElementById(e.anchor)) {
					//if we were waiting on a previous anchor, abandon that
					if (scrollTimeout) clearInterval(scrollTimeout);

					scrollTimeout = setInterval(() => {
						if (!this.document.getElementById(e.anchor)) return;
						viewportScroller.scrollToAnchor(e.anchor);
						clearInterval(scrollTimeout);
						scrollTimeout = null;
					}, 25);
					setTimeout(() => {
						if (!scrollTimeout) return;
						clearInterval(scrollTimeout);
					}, 3000);
				}
			}
		});

		Hub.listen('auth', ({ payload: { event, data } }) => {
			switch (event) {
			case 'signIn':
				this.store.dispatch(userActions.userLogInComplete({allowNavigate: true}));
				break;
			case 'cognitoHostedUI':
				console.log('cognito hosted ui signin', data);
				console.log('stored value', this.sessionStorage.getItem('socialUtmSignup'));
				//TODO send analytics info
				this.store.dispatch(userActions.socialLogInComplete());
				break;
			}
		});

		//TODO move to Angular call
		//TODO support pausing the video
		const self = this;
		$('body').on('click', '.view-pdf', function() {
			const pdfLink = $(this).attr('href');
			//const iframe = `<div class="iframe-container"><iframe src="${pdfLink}"></iframe></div>`;
			const modal = $('#readingModal');
			const isIOS = typeof navigator !== 'undefined' && !!navigator.platform

				&& (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1));
			const readingType = $(this).data('readingType') || 'other';
			$('.modal-title', modal).text($(this).text());
			//if this device is iOS, then open the PDF in a Google Drive viewer instead of directly
			$('iframe', modal).attr(
				'src',
				!isIOS ? pdfLink : 'https://drive.google.com/viewerng/viewer?embedded=true&url=' + encodeURIComponent(pdfLink)
			);
			modal.modal('show');
			self.store.dispatch(uiActions.openModal());
			self.store.dispatch(uiActions.pdfClicked({pdfUrl: pdfLink, readingType}));

			modal.on('hidden.bs.modal', e => {
				// do something...
				self.store.dispatch(uiActions.closeModal());
			});
			return false;
		});
	}

	ngOnInit() {
		// console.log('app.component ngOnInit');
		// TODO Place to init site-wide donation asks
	}

	ngOnDestroy() {
		const closeSub = key => {
			if (this[key] && !this[key].closed) {
				this[key].unsubscribe();
				this[key] = null;
			}
		};

		// closeSub('routeParamsSub');
		closeSub('navSub');
		closeSub('querySub');
		closeSub('scrollSub');
	}

	skipLink() {
		this.main.nativeElement.focus();
	}

	logOut() {
		this.store.dispatch(userActions.userLogOutRequested());
	}

	private getSidebarConfigFromRoute(route: ActivatedRoute| ActivatedRouteSnapshot) {
		if (route instanceof ActivatedRoute) {
			return this.getDataPropFromRoute('hasSidebar', route);
		} else {
			return this.getDataPropFromRouteSnapshot('hasSidebar', route);
		}
	}

	private getTitleFromRoute(route: ActivatedRoute| ActivatedRouteSnapshot) {
		if (route instanceof ActivatedRoute) {
			return this.getDataPropFromRoute('title', route);
		} else {
			return this.getDataPropFromRouteSnapshot('title', route);
		}
	}

	private getMetaDescriptionFromRoute(route: ActivatedRoute| ActivatedRouteSnapshot) {
		if (route instanceof ActivatedRoute) {
			return this.getDataPropFromRoute('description', route);
		} else {
			return this.getDataPropFromRouteSnapshot('description', route);
		}
	}

	private getDataPropFromRoute(property: string, route: ActivatedRoute) {
		if (route.snapshot?.data.hasOwnProperty(property)) {
			return route.snapshot?.data[property];
		}

		const children = route.children || [];

		// iterate over route children
		for (const child of children) {
			// const child = childObj.hasOwnProperty('outlet') ? childObj : (childObj as any).value;
			// verify that we have the correct router outlet
			if (child.outlet !== PRIMARY_OUTLET) {
				continue;
			}

			if ( !child.snapshot?.data.hasOwnProperty(property)) {
				return this.getDataPropFromRoute(property, child);
			}

			return child.snapshot.data[property];
		}

		return false;
	}
	private getDataPropFromRouteSnapshot(property: string, route: ActivatedRouteSnapshot) {
		if (route.data.hasOwnProperty(property)) {
			return route.data[property];
		}

		const children = route.children || [];

		// iterate over route children
		for (const child of children) {
			// const child = childObj.value;
			// verify that we have the correct router outlet
			if (child.outlet !== PRIMARY_OUTLET) {
				continue;
			}

			if ( !child.data?.hasOwnProperty(property)) {
				return this.getDataPropFromRouteSnapshot(property, child);
			}

			return child.data[property];
		}

		return false;
	}

	donateClicked(donateUrl: string) {
		this.store.dispatch(uiActions.donateClicked({donateUrl}));
	}

	closePrimaryNav(event: any) {
		// Close navigation menu
		if (this.primaryNav.nativeElement.classList.contains('active')) {
			this.sidebarCollapse.nativeElement.click();
		}
	}
}
