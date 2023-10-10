import {createAction, props} from '@ngrx/store';

export const saveNotes = createAction('[Notes] Save Note', props<{courseId: string, lectureId: string, noteContent: string}>());
export const getNoteComplete = createAction('[Notes] Set Note', props<{courseId: string, lectureId: string, noteContent: string}>());
export const getNote = createAction('[Notes] Get Note', props<{courseId: string, lectureId: string}>());
export const getNotes = createAction('[Notes] Get Course Notes', props<{courseId: string}>());
export const getNotesComplete = createAction('[Notes] Set Course Notes', props<{
	courseId: string,
	notesContent: {[key: string]: string}
}>());

export const startSaving = createAction('[Notes] Start Saving');
export const doneSaving = createAction('[Notes] Done Saving');

export const obliterateNotesState = createAction('[Notes] Obliterate State');
