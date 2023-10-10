import {createSelector} from '@ngrx/store';
import {State as AppState} from '../index';

export const selectPendingCourse = createSelector(
	(state: AppState) => state.enrollment,
	enrollment => {
		return enrollment.pendingEnroll;
	}
);

export const selectWithdrawReasons = createSelector(
	(state: AppState) => state.enrollment,
	enrollment => {
		return enrollment.withdrawalReasons;
	}
);

export const selectLandingPageAccountCreationForm = createSelector(
	(state: AppState) => state.enrollment,
	enrollment => {
		return enrollment.showLandingPageAccountCreationForm;
	}
);

export const selectIsAccountCreationOnLandingPageEnabled = createSelector(
	(state: AppState) => state.enrollment,
	enrollment => {
		return enrollment.isAccountCreationOnLandingPageEnabled;
	}
);

export const selectDonationLink = createSelector(
	(state: AppState) => state.enrollment,
	enrollment => {
		return enrollment.donationLink;
	}
);
