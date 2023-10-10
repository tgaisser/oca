import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Course, CourseDataService, Partnership} from '../services/course-data.service';
import {filter, map, mergeMap, startWith, tap} from 'rxjs/operators';
import {setPartnershipMetaTags} from '../common/helpers';
import {Meta} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {WindowBehaviorService} from '../services/window-behavior.service';
import {markHeaderVisibility} from '../state/ui/actions';
import {select, Store} from '@ngrx/store';
import {State} from '../state';
import {UtmService} from '../services/utm.service';
import {BaseLandingPageContentsComponentDirective} from '../landing-page/base-landing-page-contents-component.directive';
import {selectCurrentUserWithUtmStatus} from '../state/user/selectors';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { selectTestimonials } from '../state/courses/selectors';
import * as enrollmentActions from '../state/enrollment/actions';

@Component({
	selector: 'app-partnership',
	templateUrl: './partnership.component.html',
	styleUrls: ['./partnership.component.less']
})
export class PartnershipComponent extends BaseLandingPageContentsComponentDirective implements OnInit {
	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();

	partnership$: Observable<Partnership> = this.route.params.pipe(
		map(p => p.partnerId),
		filter(p => !!p),
		mergeMap(partnerId => this.dataService.getPartnership(partnerId)),
		filter(p => !!p),
		tap(partner => {
			this.recommendedCourses = partner.recommended_courses.map(c => c.course);
			this.utmService.setUtmCodes({source_partner: partner.landing_page_slug});
			setPartnershipMetaTags(partner, this.meta, this.simpleMdPipe, this.windowBehaviorService.getCurrentUrl());
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
		public router: Router,
		private route: ActivatedRoute,
		private dataService: CourseDataService,
		private utmService: UtmService,
		private meta: Meta,
		protected store: Store<State>,
		private windowBehaviorService: WindowBehaviorService,
	) {
		// Check UTMs for fresh visitors
		super(store);
	}

	ngOnInit(): void {
		this.store.dispatch(markHeaderVisibility({
			isVisible: false
		}));
	}

	enrollInCourseFromSlug(form: FormGroup) {
		if (form.valid) {
			const courseSlug = form.getRawValue().courseSlug;
			const course = this.recommendedCourses.find(c => c.url_slug === courseSlug);

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
