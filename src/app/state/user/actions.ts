import {createAction, props} from '@ngrx/store';
import {User} from '../../services/user.service';
import {UserPreferences} from '../../common/models';

export const userConfirmComplete = createAction('[User] Confirm complete', props<{allowNavigate: boolean, email?: string}>());
export const userLogInComplete = createAction('[User] Sign In', props<{allowNavigate: boolean}>());
export const socialLogInComplete = createAction('[User] Social Sign In Complete');
export const userLoginError = createAction('[User] Login Error', props<{message: string}>());
export const userLogOutRequested = createAction('[User] Sign Out Requested');
export const userLogOutCompleted = createAction('[User] Sign Out Complete');
export const userSessionRefreshed = createAction('[User] Session Refreshed');
export const userProfileUpdate = createAction('[User] Profile Update', props<{user: User}>());

export const userMergeModalAccountMadeChanges = createAction('[User] Merge Account Modal Made Changes');
export const userMergeModalAccountClosed = createAction('[User] Merge Account Modal Closed');

export const userSetDetails = createAction('[User] Set Details', props<{user: User}>());
export const userGetDetails = createAction('[User] Get Details');

export const userSetPostLoginUrl = createAction('[User] Set Post-Login Url', props<{url: string}>());

export const userIsInLandingTestGroup = createAction('[User] Is in landing test group', props<{isInGroup: boolean, hasUtm: boolean}>());

export const userSetPreferences = createAction('[User] Set Preferences', props<{preferences: UserPreferences}>());
export const userSetVideoPreferences = createAction('[User] Set VideoPreferences', props<{preferAudioLectures: boolean}>());

export const userSetPlaybackRate = createAction('[User] Set Playback rate', props<{rate: number}>());
export const userInitPlaybackRate = createAction('[User] Init Playback rate', props<{rate: number}>());
