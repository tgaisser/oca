import {BaseLandingPageContentsComponentDirective} from '../base-landing-page-contents-component.directive';
import {Component} from '@angular/core';
import {select} from '@ngrx/store';
import {selectLandingPageAccountCreationForm} from '../../state/enrollment/selectors';
import * as enrollmentActions from '../../state/enrollment/actions';

@Component({
	selector: 'app-top-registration-landing-page-contents',
	templateUrl: './top-registration-landing-page-contents.component.html',
	styleUrls: ['./top-registration-landing-page-contents.component.less']
})

export class TopRegistrationLandingPageContentsComponent extends BaseLandingPageContentsComponentDirective {
	
	displayRegisterOnPage$ = this.store.pipe(select(selectLandingPageAccountCreationForm));

	ngOnInit() {
		this.store.dispatch(enrollmentActions.setAccountCreationOnLandingPage({isAccountCreationOnLandingPageEnabled: true}));
	}

	ngAfterViewInit() {
		this.calculateRegistrationBoxBottomMargin();
	}

	calculateRegistrationBoxBottomMargin(): void {
		let registrationBoxHeight = document.querySelector<HTMLElement>(".registration-container").offsetHeight;

		if(registrationBoxHeight < 300) {
			let bottomMargin = (425 - registrationBoxHeight)/2;

			document.querySelector<HTMLElement>(".registration-container").style.marginBottom = `${bottomMargin.toString()}px`;
		}
	}

	reduceIntroductoryTextWidth(): void {
		if(document.querySelector<HTMLElement>(".registration-container").offsetHeight > 800) {
			document.getElementsByClassName("course-overview")[0].classList.add("narrow-text");
		}
	}

	reduceIntroductoryTextWidthTimeout(): void {
		setTimeout(this.reduceIntroductoryTextWidth,1000);
	}
}
