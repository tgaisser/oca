import {BaseLandingPageContentsComponentDirective} from '../base-landing-page-contents-component.directive';
import {Component} from '@angular/core';
import {select} from '@ngrx/store';
import {selectLandingPageAccountCreationForm} from '../../state/enrollment/selectors';
import * as enrollmentActions from '../../state/enrollment/actions';
import {selectTestimonials} from '../../state/courses/selectors';

@Component({
	selector: 'app-testimonials-landing-page-contents',
	templateUrl: './testimonials-landing-page-contents.component.html',
	styleUrls: ['./testimonials-landing-page-contents.component.less']
})

export class TestimonialsLandingPageContentsComponent extends BaseLandingPageContentsComponentDirective {
	
	displayRegisterOnPage$ = this.store.pipe(select(selectLandingPageAccountCreationForm));

	ngOnInit() {
		this.store.dispatch(enrollmentActions.setAccountCreationOnLandingPage({isAccountCreationOnLandingPageEnabled: true}));
	}

	testimonials$ = this.store.pipe(select(selectTestimonials(5)));
	activeSlideIndex = 0;
}
