import {createSelector} from '@ngrx/store';
import {State as AppState} from '../index';

export const selectDoUpdate = createSelector(
	(state: AppState) => state.appUpdate,
	(state: AppState) => state.course.currentContentType,
	(state: AppState) => state.ui.modalIsOpen,
	(appUpdate, currentContentType, modalIsOpen) => {
		const excludedUser = currentContentType === 'quiz' || appUpdate.userAtProtectedRoute || modalIsOpen;

		const doUpdate =
			!!appUpdate.updateAvailabilityDate &&
			((appUpdate.userInactive && !excludedUser) || appUpdate.isEmergencyUpdate);
		return doUpdate;
	}
);
