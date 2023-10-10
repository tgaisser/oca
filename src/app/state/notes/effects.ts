import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {State} from '../index';
import {Inject, Injectable} from '@angular/core';
import {catchError, debounceTime, filter, map, mergeMap, tap} from 'rxjs/operators';

import * as notes from './actions';
import * as userActions from '../user/actions';
import {UserDataService} from '../../services/user-data.service';
import {ToastrService} from 'ngx-toastr';
import {EMPTY, of} from 'rxjs';
import {LOCAL_STORAGE} from '../../common/models';

const notesKeyPrefix = 'olc-notes-';

@Injectable()
export class NotesEffects {
	saveNoteToStorage$ = createEffect(() => this.actions$.pipe(
		ofType(notes.saveNotes),
		debounceTime(2000),
		tap(action => {
			this.store.dispatch(notes.startSaving());
			this.localStorage.setItem(notesKeyPrefix + action.lectureId, action.noteContent);
			this.dataSrv.saveNote(action.courseId, action.lectureId, action.noteContent).subscribe(() => {
				this.store.dispatch(notes.getNoteComplete({courseId: action.courseId, lectureId: action.lectureId, noteContent: action.noteContent}));
				this.store.dispatch(notes.doneSaving());
			}, error => {
				this.toastr.error(error.message);
			});
		})
	), {dispatch: false});

	getNoteFromStorage$ = createEffect(() => this.actions$.pipe(
		ofType(notes.getNote),
		//throttleTime(30000), //only allow every 30s (screws things up since it will swallow calls for independent notes)
		filter(action => !!action.lectureId),
		mergeMap(action => {
			return this.dataSrv.getNote(action.courseId, action.lectureId).pipe(
				map(note => {
					return notes.getNoteComplete({courseId: action.courseId, lectureId: action.lectureId, noteContent: note.text || ''});
				}),
				catchError(() => {
					console.log('failed to retrieve note');
					const note = this.localStorage.getItem(notesKeyPrefix + action.lectureId);
					return of(notes.getNoteComplete({courseId: action.courseId, lectureId: action.lectureId, noteContent: note || ''}));
				})
			);
		})
	));

	getNotesFromStorage$ = createEffect(() => this.actions$.pipe(
		ofType(notes.getNotes),
		//throttleTime(30000), //only allow every 30s (screws things up since it will swallow calls for independent notes)
		filter(action => !!action.courseId),
		mergeMap(action => {
			console.log('looking for course notes', action.courseId);
			return this.dataSrv.getNotes(action.courseId).pipe(
				map(notesRes => {
					const noteMap = notesRes.reduce((agg, cur) => ({
						...agg,
						[cur.lectureId]: cur.text,
					}), {});
					return notes.getNotesComplete({courseId: action.courseId, notesContent: noteMap});
				}),
				catchError(error => {
					console.log('failed to retrieve note');
					return EMPTY;
				})
			);
		})
	));

	clearNotesOnLogout$ = createEffect(() => this.actions$.pipe(
		ofType(userActions.userLogOutCompleted),
		tap(a => {
			this.store.dispatch(notes.obliterateNotesState());
			for (const key of Object.keys(this.localStorage).filter(k => k.startsWith(notesKeyPrefix))) {
				this.localStorage.removeItem(key);
			}
		}),
	), {dispatch: false});

	constructor(
		private actions$: Actions,
		private store: Store<State>,
		private dataSrv: UserDataService,
		private toastr: ToastrService,
		@Inject(LOCAL_STORAGE) private localStorage: Storage
	) {

	}
}

