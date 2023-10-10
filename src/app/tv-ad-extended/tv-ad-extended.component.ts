import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseLandingPageContentsComponentDirective } from '../landing-page/base-landing-page-contents-component.directive';
import { HcSimpleMdPipe } from 'hillsdale-ng-helper-lib';
import { select, Store } from '@ngrx/store';
import { selectCurrentUserWithUtmStatus } from '../state/user/selectors';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Course, CourseDataService, TvAdExtendedLandingPage } from '../services/course-data.service';
import { UtmService } from '../services/utm.service';
import { Meta } from '@angular/platform-browser';
import { State } from '../state';
import { WindowBehaviorService } from '../services/window-behavior.service';
import { markHeaderVisibility } from '../state/ui/actions';
import { Observable } from 'rxjs';
import { setTvAdMetaTags, setVideo } from '../common/helpers';
import { selectTestimonials } from '../state/courses/selectors';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as enrollmentActions from '../state/enrollment/actions';

@Component({
	selector: 'app-tv-ad-extended',
	templateUrl: './tv-ad-extended.component.html',
	styleUrls: ['./tv-ad-extended.component.less']
})
export class TvAdExtendedComponent extends BaseLandingPageContentsComponentDirective implements OnInit {
	@ViewChild('trailerVideo')
		trailerVideoRef: ElementRef<HTMLHcVideoPlayerElement>;

	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();

	tvAdExt$: Observable<TvAdExtendedLandingPage> = this.route.params.pipe(
		map(tvAdExt => tvAdExt.tvAdExtId),
		filter(tvAdExt => !!tvAdExt),
		mergeMap(tvAdExtId => this.dataService.getTvAdExtendedLandingPage(tvAdExtId)),
		filter(tvAdExt => !!tvAdExt),
		tap(tvAdExt => {
			// console.log('DEBUG TV Ad Ext: ', tvAdExt);
			this.recommendedCourses = tvAdExt.recommended_courses.map(c => c.course);
			if (this.recommendedCourses?.length === 1) {
				this.signupForm.setValue({courseSlug: this.recommendedCourses[0].url_slug, email: ''});
				this.signupForm2.setValue({courseSlug: this.recommendedCourses[0].url_slug, email: ''});

				if (this.recommendedCourses[0]?.course_trailer) {
					setVideo(this.trailerVideoRef, this.recommendedCourses[0]?.course_trailer);
				}
			}
			this.utmService.setUtmCodes({ source_tv_ad: tvAdExt.landing_page_slug });
			setTvAdMetaTags(tvAdExt, this.meta, this.simpleMdPipe, this.windowBehaviorService.getCurrentUrl());
		})
	);
	recommendedCourses: Course[];

	userStatus$ = this.store.pipe(
		select(selectCurrentUserWithUtmStatus),
		map(u => ({
			isLoggedIn: !!u.user,
			email: (!!u.user ? u.user.email : ''),
			// shouldRenderDefaultLanding: u.hasUtm || this.isFirstComponent
		}))
	);

	signupForm: FormGroup = new FormGroup({
		courseSlug: new FormControl('', [Validators.minLength(1), Validators.required]),
		email: new FormControl('', [Validators.email, Validators.required]),
	}, { updateOn: 'submit' });
	signupForm2: FormGroup = new FormGroup({
		courseSlug: new FormControl('', [Validators.minLength(1), Validators.required]),
		email: new FormControl('', [Validators.email, Validators.required]),
	}, { updateOn: 'submit' });

	testimonials$ = this.store.pipe(select(selectTestimonials(5)));
	activeSlideIndex = 0;
	hideTrailerOverlay = false;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private dataService: CourseDataService,
		private utmService: UtmService,
		private meta: Meta,
		protected store: Store<State>,
		private windowBehaviorService: WindowBehaviorService,
	) {
		super(store);
	}

	ngOnInit(): void {
		this.store.dispatch(markHeaderVisibility({
			isVisible: false
		}));
	}

	playTrailerVideo() {
		this.hideTrailerOverlay = true;

		this.trailerVideoRef.nativeElement?.play().then();
	}

	enrollInCourseFromSlug(form) {
		if (form.valid) {
			const courseSlug = form.getRawValue().courseSlug;
			// console.log('DEBUG Course Slug: ', courseSlug);
			// console.log('DEBUG Recommended Courses: ', this.recommendedCourses);
			const course = this.recommendedCourses.find(c => c.url_slug === courseSlug);
			// console.log('DEBUG Course: ', course);

			this.store.dispatch(enrollmentActions.enrollInCourseRequested({
				course,
				email: form.getRawValue().email,
			}));
		} else {
			this.validateAllFormFields(form);
		}
	}

	validateAllFormFields(formGroup: FormGroup) {
		Object.keys(formGroup.controls).forEach(field => {
			const control = formGroup.get(field);
			if (control instanceof FormControl) {
				control.markAsTouched({ onlySelf: true });
			} else if (control instanceof FormGroup) {
				this.validateAllFormFields(control);
			}
		});
	}
}
