import {createAction, props} from '@ngrx/store';

export const userAtProtectedRoute = createAction('[Update] User At Protected Route', props<{protected: boolean}>());
export const userActivity = createAction('[Update] User Activity', props<{description: string}>());
export const userInactive = createAction('[Update] User Active', props<{userInactive: boolean}>());
export const updateIsAvailable = createAction('[Update] Update Available');
