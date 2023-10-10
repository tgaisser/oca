
import {BaseLandingPageContentsComponentDirective} from '../base-landing-page-contents-component.directive';
import {ViewEncapsulation} from '@angular/core';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {select} from '@ngrx/store';
import {selectLandingPageAccountCreationForm} from '../../state/enrollment/selectors';
import * as enrollmentActions from '../../state/enrollment/actions';
import {environment} from '../../../environments/environment';
import {mergeQueryParamsFromSourceUrlIntoDestinationUrl} from '../../common/helpers';
import {CourseDataService} from '../../services/course-data.service';

@Component({
	selector: 'app-pre-registration-landing-page-contents',
	templateUrl: './pre-registration-landing-page-contents.component.html',
	styleUrls: ['./pre-registration-landing-page-contents.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class PreRegistrationLandingPageContentsComponent extends BaseLandingPageContentsComponentDirective implements OnInit, OnDestroy {

	displayRegisterOnPage$ = this.store.pipe(select(selectLandingPageAccountCreationForm));
	displayCountdownTimer = false;

	ngOnInit() {
		const donationPage = this.course?.pre_reg_donation_url || environment.defaultDonationUrl;
		const donationPageWithUrlParamsAdded = mergeQueryParamsFromSourceUrlIntoDestinationUrl(window.location.href, donationPage);

		this.store.dispatch(enrollmentActions.setDonationLink({donationLink: donationPageWithUrlParamsAdded}));
		this.store.dispatch(enrollmentActions.setDoDonationInquiry({doDonationInquiry: true}));
		this.store.dispatch(enrollmentActions.setDonationInquiryType({donationInquiryType: 'tab'}));
		this.store.dispatch(enrollmentActions.setAccountCreationOnLandingPage({isAccountCreationOnLandingPageEnabled: true}));

		if(
			this.course?.pre_reg_text_above_countdown_timer
			&& this.course?.pre_reg_countdown_timer_embed_code
			&& CourseDataService.isInPreRegPageCampaignWindow(this.course) == false
		){
			this.displayCountdownTimer = true;
		}
	}

	ngOnDestroy() {
		this.store.dispatch(enrollmentActions.setLandingPageAccountCreationForm({showLandingPageAccountCreationForm: false}));
	}

}
