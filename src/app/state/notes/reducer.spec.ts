import * as actions from './actions';
import * as notesReducer from './reducer';

describe('Notes reducer', () => {
	const { initialState } = notesReducer;
	it('should return the initial state', () => {
		const action = {type: 'empty'};
		const state = notesReducer.reducer(undefined, action);
		expect(state).toBe(initialState);
	});

	it('should actions.getNoteComplete', () => {
		const options = {courseId: 'mockCourseId', lectureId: 'mockLectureId', noteContent: 'mockNoteContent'};
		const action = actions.getNoteComplete(options);
		const state = notesReducer.reducer(initialState, action);
		expect(state.notesMap).toBeTruthy();
	});

	it('should actions.getNotesComplete', () => {
		const options = {courseId: 'mockCourseId', notesContent: {['mockNote1']: 'mockNoteContent'}};
		const action =  actions.getNotesComplete(options);
		const state = notesReducer.reducer(initialState, action);
		expect(state.notesMap).toBeTruthy();
	});

	it('should actions.startSaving', () => {
		const action = actions.startSaving();
		const state = notesReducer.reducer(initialState, action);
		expect(state.isSaving).toBeTruthy();
	});

	it('should actions.doneSaving', () => {
		const action = actions.doneSaving();
		const state = notesReducer.reducer(initialState, action);
		expect(state.isSaving).toBeFalsy();
	});
});
