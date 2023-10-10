import { Action, createReducer, on, } from '@ngrx/store';
import {User} from '../../services/user.service';
import * as actions from './actions';
import {UserPreferences} from '../../common/models';

// export const userFeatureKey = 'user';

export interface State {
	currentUser: User;
	pendingRedirectUrl: string;
	hasUtm: boolean;
	madeAccountMergeChanges: boolean;
	playbackRate: number;
	preferences: UserPreferences;
}

export const initialState: State = {
	currentUser: null,
	pendingRedirectUrl: null,
	hasUtm: false,
	madeAccountMergeChanges: false,
	playbackRate: 1,
	preferences: null,
};

const userReducer = createReducer(
	initialState,
	on(actions.userLogOutCompleted, state => ({...state, currentUser: null})),
	on(actions.userSetDetails, (state, action) => ({...state, currentUser: action.user})),
	on(actions.userSetPostLoginUrl, (state, action) => ({...state, pendingRedirectUrl: action.url})),
	on(actions.userMergeModalAccountMadeChanges, (state, action) => ({...state, madeAccountMergeChanges: true})),
	on(actions.userLogOutRequested, (state, action) => ({...state, madeAccountMergeChanges: false})),
	on(actions.userSetPlaybackRate, (state, action) => ({...state, playbackRate: action.rate})),
	on(actions.userInitPlaybackRate, (state, action) => ({...state, playbackRate: action.rate})),
	on(actions.userSetPreferences, (state, action) => ({...state, preferences: action.preferences})),
	on(actions.userSetVideoPreferences, (state, action) => {
		const pref = state.preferences ? state.preferences : {progressReportFrequency: 'Monthly' as any};
		return ({...state, preferences: {...pref, preferAudioLectures: action.preferAudioLectures}});
	})
);

export function reducer(state: State|undefined, action: Action) {
	return userReducer(state, action);
}
