import * as actions from './actions';

describe('Notes actions', () => {
	it('should create saveNotes', () => {
		const options = {courseId: 'mockCourseId', lectureId: 'mockLectureId', noteContent: 'mockNoteContent'};
		const action =  actions.saveNotes(options);
		expect(action.type).toEqual('[Notes] Save Note');
		expect(action.courseId).toEqual(options.courseId);
		expect(action.lectureId).toEqual(options.lectureId);
		expect(action.noteContent).toEqual(options.noteContent);
	});

	it('should create getNoteComplete', () => {
		const options = {courseId: 'mockCourseId', lectureId: 'mockLectureId', noteContent: 'mockNoteContent'};
		const action =  actions.getNoteComplete(options);
		expect(action.type).toEqual('[Notes] Set Note');
		expect(action.courseId).toEqual(options.courseId);
		expect(action.lectureId).toEqual(options.lectureId);
		expect(action.noteContent).toEqual(options.noteContent);
	});

	it('should create getNote', () => {
		const options = {courseId: 'mockCourseId', lectureId: 'mockLectureId'};
		const action =  actions.getNote(options);
		expect(action.type).toEqual('[Notes] Get Note');
		expect(action.courseId).toEqual(options.courseId);
		expect(action.lectureId).toEqual(options.lectureId);
	});

	it('should create getNotes', () => {
		const options = {courseId: 'mockCourseId'};
		const action =  actions.getNotes(options);
		expect(action.type).toEqual('[Notes] Get Course Notes');
		expect(action.courseId).toEqual(options.courseId);
	});

	it('should create getNotesComplete', () => {
		const options = {courseId: 'mockCourseId', notesContent: {['mockNote1']: 'mockNoteContent'}};
		const action =  actions.getNotesComplete(options);
		expect(action.type).toEqual('[Notes] Set Course Notes');
		expect(action.courseId).toEqual(options.courseId);
	});

	it('should create startSaving', () => {
		const action =  actions.startSaving();
		expect(action.type).toEqual('[Notes] Start Saving');
	});

	it('should create doneSaving', () => {
		const action = actions.doneSaving();
		expect(action.type).toEqual('[Notes] Done Saving');
	});
});
