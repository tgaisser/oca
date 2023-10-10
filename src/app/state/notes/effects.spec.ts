import {from, Observable, of, throwError} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {createSpyWithMultipleObservableValues, CustomMocksModule, MockBrowserAbstractionModule} from '../../../test.helpers';
import {MockStore} from '@ngrx/store/testing';
import {State} from '../index';
import {UserDataService} from '../../services/user-data.service';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {NotesEffects} from './effects';
import {ToastrService} from 'ngx-toastr';

import * as notesActions from './actions';
import {LOCAL_STORAGE} from '../../common/models';
import MockedClass = jest.MockedClass;

describe('Notes effects', () => {
	let effects;

	let actions$ = new Observable<Action>();
	let testScheduler;
	let store;
	let userDataService;
	let toastr;

	let storage: MockedClass<any>;


	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				NotesEffects,
				provideMockActions(() => actions$),
				{provide: ToastrService, useValue: {error: jest.fn()}}
			],
			imports: [
				CustomMocksModule,
				MockBrowserAbstractionModule,
			]
		});

		effects = TestBed.inject<NotesEffects>(NotesEffects);
		store = TestBed.inject(Store) as MockStore<State>;
		userDataService = TestBed.inject(UserDataService);
		toastr = TestBed.inject(ToastrService);
		storage = TestBed.inject<Storage>(LOCAL_STORAGE);

		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

	});

	const runSaveNote = async () => {
		jest.spyOn(store, 'dispatch');
		storage.setItem.mockImplementation(() => {});

		const action = notesActions.saveNotes({courseId: 'c', lectureId: 'l', noteContent: 'note'});

		actions$ = from([action]);

		await effects.saveNoteToStorage$.toPromise();

		expect(storage.setItem).toHaveBeenCalledWith('olc-notes-l', 'note');

		expect(userDataService.saveNote).toHaveBeenCalledWith(action.courseId, action.lectureId, action.noteContent);

		return action;
	};

	test('saveNoteToStorage$ should save to dispatch, local save, save, and dispatch', async () => {
		const action = await runSaveNote();

		expect(store.dispatch.mock.calls).toEqual([
			[notesActions.startSaving()],
			[notesActions.getNoteComplete({courseId: action.courseId, noteContent: action.noteContent, lectureId: action.lectureId})],
			[notesActions.doneSaving()]
		]);
		// testScheduler.run(({hot, expectObservable}) => {
		//
		// });
	});
	test('saveNoteToStorage$ should pop toastr on error', async () => {
		userDataService.saveNote = jest.fn(() => throwError(new Error('Err')));
		const action = await runSaveNote();

		expect(store.dispatch.mock.calls).toEqual([
			[notesActions.startSaving()],
		]);
		expect(toastr.error).toHaveBeenCalledWith('Err');

	});

	test('getNoteFromStorage$ should retrieve data from API and fall back to local storage if error', () => {
		storage.getItem.mockImplementation(() => 'fallback');
		userDataService.getNote = createSpyWithMultipleObservableValues([
			of({text: 't1'}),
			throwError(''),
			of({text: 't2'})
		]);

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a--b--c-d--e', {
				a: notesActions.getNote({courseId: '1', lectureId: 'l1'}),
				b: notesActions.getNote({courseId: '2', lectureId: null}),
				c: notesActions.getNote({courseId: '3', lectureId: 'l3'}),
				d: notesActions.getNote({courseId: '4', lectureId: 'l4'}),
				e: notesActions.getNote({courseId: '5', lectureId: ''}),
			});

			/*
			 events should be handled as followed

			 a: looked up and returned
			 b: ignored since lectureId is null
			 c: looked up and fallback returned (given API error)
			 d: looked up and returned
			 e: ignored since lectureId is falsey

			 */
			expectObservable(effects.getNoteFromStorage$).toBe('-a-----c-d---', {
				a: notesActions.getNoteComplete({courseId: '1', lectureId: 'l1', noteContent: 't1'}),
				c: notesActions.getNoteComplete({courseId: '3', lectureId: 'l3', noteContent: 'fallback'}),
				d: notesActions.getNoteComplete({courseId: '4', lectureId: 'l4', noteContent: 't2'}),
			});

			testScheduler.flush();

			expect(storage.getItem.mock.calls).toEqual([['olc-notes-l3']]);
			expect(userDataService.getNote.mock.calls).toEqual([
				['1', 'l1'],
				['3', 'l3'],
				['4', 'l4'],
			]);
		});
	});
	test('getNotesFromStorage$', () => {
		userDataService.getNotes = createSpyWithMultipleObservableValues([
			of([{lectureId: 'l1', text: 't1'}]),
			throwError(''),
			of([{lectureId: 'l8', text: 't2'}, {lectureId: 'l9', text: 't3'}, {lectureId: 'l10', text: 't4'}])
		]);

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a--b--c-d--e', {
				a: notesActions.getNotes({courseId: '1'}),
				b: notesActions.getNotes({courseId: null}),
				c: notesActions.getNotes({courseId: '2'}),
				d: notesActions.getNotes({courseId: '3'}),
				e: notesActions.getNotes({courseId: ''}),
			});
			/*
			 events should be handled as followed

			 a: looked up and returned
			 b: ignored since lectureId is null
			 c: looked up but ignored because of API error
			 d: looked up and returned
			 e: ignored since lectureId is falsey

			 */
			expectObservable(effects.getNotesFromStorage$).toBe('-a-------d---', {
				a: notesActions.getNotesComplete({courseId: '1', notesContent: {l1: 't1'}}),
				d: notesActions.getNotesComplete({courseId: '3', notesContent: {l8: 't2', l9: 't3', l10: 't4'}}),
			});

			testScheduler.flush();

			expect(userDataService.getNotes.mock.calls).toEqual([
				['1'],
				['2'],
				['3'],
			]);
		});
	});
});
