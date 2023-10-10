import { Component, OnInit } from '@angular/core';
import {BaseLandingPageContentsComponentDirective} from '../landing-page/base-landing-page-contents-component.directive';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {select, Store} from '@ngrx/store';
import {selectCurrentUserWithUtmStatus} from '../state/user/selectors';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {Course, CourseDataService, TvAdLandingPage} from '../services/course-data.service';
import {UtmService} from '../services/utm.service';
import {Meta} from '@angular/platform-browser';
import {State} from '../state';
import {WindowBehaviorService} from '../services/window-behavior.service';
import {markHeaderVisibility} from '../state/ui/actions';
import {Observable} from 'rxjs';
import {setTvAdMetaTags} from '../common/helpers';
import {selectTestimonials} from '../state/courses/selectors';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as enrollmentActions from '../state/enrollment/actions';

@Component({
	selector: 'app-tv-ad',
	templateUrl: './tv-ad.component.html',
	styleUrls: ['./tv-ad.component.less']
})
export class TvAdComponent extends BaseLandingPageContentsComponentDirective implements OnInit {
	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();

	tvAd$: Observable<TvAdLandingPage> = this.route.params.pipe(
		map(tvAd => tvAd.tvAdId),
		filter(tvAd => !!tvAd),
		mergeMap(tvAdId => this.dataService.getTvAdLandingPage(tvAdId)),
		filter(tvAd => !!tvAd),
		tap(tvAd => {
			// console.log('DEBUG TV Ad: ', tvAd);
			this.recommendedCourses = tvAd.recommended_courses.map(c => c.course);
			this.utmService.setUtmCodes({source_tv_ad: tvAd.landing_page_slug});
			setTvAdMetaTags(tvAd, this.meta, this.simpleMdPipe, this.windowBehaviorService.getCurrentUrl());
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
	}, { updateOn: 'submit'});
	signupForm2: FormGroup = new FormGroup({
		courseSlug: new FormControl('', [Validators.minLength(1), Validators.required]),
		email: new FormControl('', [Validators.email, Validators.required]),
	}, { updateOn: 'submit'});

	testimonials$ = this.store.pipe(select(selectTestimonials(5)));
	activeSlideIndex = 0;

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
