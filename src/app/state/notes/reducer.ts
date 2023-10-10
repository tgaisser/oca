import {Action, createReducer, on} from '@ngrx/store';
import * as actions from './actions';

export interface State {
	notesMap: {[key: string]: string};
	isSaving: boolean;
	lastSavedDate: Date;
}
export const initialState: State = {
	notesMap: {},
	isSaving: false,
	lastSavedDate: new Date(),
};

export const notesReducer = createReducer(
	initialState,
	on(actions.getNoteComplete, (state, action) => ({...state, notesMap: {
		...state.notesMap,
		[action.lectureId]: action.noteContent
	}
	})),
	on(actions.getNotesComplete, (state, action) => ({...state, notesMap: {
		...state.notesMap,
		...action.notesContent,
	}
	})),
	on(actions.startSaving, state => ({...state, isSaving: true})),
	on(actions.doneSaving, state => ({...state, isSaving: false, lastSavedDate: new Date()})),
	on(actions.obliterateNotesState, state => ({...state, notesMap: {}, isSaving: false, lastSavedDate: new Date()})),
);

export function reducer(state: State|undefined, action: Action) {
	return notesReducer(state, action);
}
