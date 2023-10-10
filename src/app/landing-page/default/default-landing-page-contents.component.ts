
import {BaseLandingPageContentsComponentDirective} from '../base-landing-page-contents-component.directive';
import {ViewEncapsulation} from '@angular/core';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {select} from '@ngrx/store';
import {selectLandingPageAccountCreationForm} from '../../state/enrollment/selectors';
import * as enrollmentActions from '../../state/enrollment/actions';
import { CourseDataService } from '../../services/course-data.service';
import {environment} from '../../../environments/environment';

@Component({
	selector: 'app-default-landing-page-contents',
	templateUrl: './default-landing-page-contents.component.html',
	styleUrls: ['./default-landing-page-contents.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class DefaultLandingPageContentsComponent extends BaseLandingPageContentsComponentDirective implements OnInit, OnDestroy {

	displayRegisterOnPage$ = this.store.pipe(select(selectLandingPageAccountCreationForm));

	ngOnInit() {
		if ( this.pageVersion === 'if' ) {
			this.store.dispatch(enrollmentActions.setDonationLink({ donationLink: this.course?.pre_reg_donation_url || environment.defaultDonationUrl}));
			this.store.dispatch(enrollmentActions.setDoDonationInquiry({doDonationInquiry: true}));
			this.store.dispatch(enrollmentActions.setDonationInquiryType({donationInquiryType: 'modal'}));
		}
		this.store.dispatch(enrollmentActions.setAccountCreationOnLandingPage({isAccountCreationOnLandingPageEnabled: true}));
	}

	ngOnDestroy() {
		this.store.dispatch(enrollmentActions.setLandingPageAccountCreationForm({showLandingPageAccountCreationForm: false}));
	}

}
