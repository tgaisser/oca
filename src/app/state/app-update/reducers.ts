import { Action, createReducer, on, } from '@ngrx/store';
import * as actions from './actions';

export interface State {
	userInactive: boolean;
	userAtProtectedRoute: boolean;
	updateAvailabilityDate: Date; // timestamp at which an available update was detected
	isEmergencyUpdate: boolean;
}

export const initialState: State = {
	userInactive: false,
	userAtProtectedRoute: false,
	updateAvailabilityDate: null,
	isEmergencyUpdate: false,
};

export const appUpdateReducer = createReducer(
	initialState,
	on(actions.userActivity, state => ({...state, userInactive: false})),
	on(actions.userInactive, (state, action) => ({...state, userInactive: action.userInactive})),
	on(actions.updateIsAvailable, state => ({...state, updateAvailabilityDate: new Date()})),
	on(actions.userAtProtectedRoute, (state, action) => ({...state, userAtProtectedRoute: action.protected})),
);

export function reducer(state: State|undefined, action: Action) {
	return appUpdateReducer(state, action);
}
