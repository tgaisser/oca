import {createSelector, MemoizedSelector} from '@ngrx/store';
import {State as AppState} from '../index';
import {State} from './reducers';

export const selectCurrentUser = createSelector(
	(state: AppState) => state.user,
	user => user.currentUser
);

export const selectCurrentUserWithUtmStatus = createSelector(
	(state: AppState) => state.user,
	user => ({hasUtm: user.hasUtm, user: user.currentUser})
);

export const selectCurrentUserPlaybackRate = createSelector(
	(state: AppState) => state.user,
	user => user.playbackRate
);

export const selectCurrentUserMediaPreference: MemoizedSelector<AppState, 'audio'|'video'> = createSelector(
	(state: AppState) => state.user,
	(user: State) => user.preferences?.preferAudioLectures ? 'audio' : 'video'
);

export const selectCurrentDataSaverPreference: MemoizedSelector<AppState, boolean> = createSelector(
	(state: AppState) => state.user,
	(user: State) => user.preferences?.dataSaver ?? false
);
