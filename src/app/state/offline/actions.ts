import {createAction, props} from '@ngrx/store';
import {VideoPostInfo} from '../courses/actions';


export const getUnsyncedOfflineWatches = createAction('[Offline] Get Unsynced Watches');
export const markOfflineWatchesSynced = createAction('[Offline] Mark Watches Synced', props<{watchIds: number[]}>());
export const saveVideoPostInfo = createAction('[Offline] Sync VideoPostInfo', props<VideoPostInfo>());
export const uploadVideoPostInfos = createAction('[Offline] Upload VideoPostInfos');
