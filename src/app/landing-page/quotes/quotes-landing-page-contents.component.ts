import {BaseLandingPageContentsComponentDirective} from '../base-landing-page-contents-component.directive';
import {Component} from '@angular/core';
import {select} from '@ngrx/store';
import {selectLandingPageAccountCreationForm} from '../../state/enrollment/selectors';
import * as enrollmentActions from '../../state/enrollment/actions';

@Component({
	selector: 'app-quotes-landing-page-contents',
	templateUrl: './quotes-landing-page-contents.component.html',
	styleUrls: ['./quotes-landing-page-contents.component.less']
})

export class QuotesLandingPageContentsComponent extends BaseLandingPageContentsComponentDirective {
	
	displayRegisterOnPage$ = this.store.pipe(select(selectLandingPageAccountCreationForm));

	ngOnInit() {
		this.store.dispatch(enrollmentActions.setAccountCreationOnLandingPage({isAccountCreationOnLandingPageEnabled: true}));
	}
}
