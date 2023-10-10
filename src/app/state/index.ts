import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../environments/environment';
import * as curUser from './user/reducers';
import * as courses from './courses/reducers';
import * as enrollment from './enrollment/reducer';
import * as notes from './notes/reducer';
import * as quizzes from './quizzes/reducer';
import * as ui from './ui/reducer';
import * as appUpdate from './app-update/reducers';

export interface State {
	user: curUser.State;
	course: courses.State;
	enrollment: enrollment.State;
	notes: notes.State;
	quizzes: quizzes.State;
	ui: ui.State;
	appUpdate: appUpdate.State;
}

export const reducers: ActionReducerMap<State> = {
	user: curUser.reducer,
	course: courses.reducer,
	enrollment: enrollment.reducer,
	notes: notes.reducer,
	quizzes: quizzes.reducer,
	ui: ui.reducer,
	appUpdate: appUpdate.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

export const mockInitialState: State = {
	user: curUser.initialState,
	course: courses.initialState,
	enrollment: enrollment.initialState,
	notes: notes.initialState,
	quizzes: quizzes.initialState,
	ui: ui.initialState,
	appUpdate: appUpdate.initialState
};
