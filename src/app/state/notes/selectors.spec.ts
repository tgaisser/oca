import {mockInitialState} from '../index';
import * as selectors from './selectors';
import * as helpers from '../../../test.helpers';

describe('Notes selectors', () => {
	it('should return ALL selectors as truthy/falsy from initial state', () => {
		//expect(selectors.selectCourseNotes(mockInitialState)).toBeUndefined();
		expect(selectors.selectLectureNotes(mockInitialState)).toBeFalsy();
		expect(selectors.selectNotesSaveStatus(mockInitialState).isSaving).toBeFalsy();
		expect(selectors.selectNotesSaveStatus(mockInitialState).savedAt).toBeTruthy();
	});

	it('should selectCourseNotes', () => {
		const mockState = getNotesStateWithValue({
			notesMap: {lecture1: 'mockNoteValue'}
		});
		expect(selectors.selectCourseNotes(mockState)).toEqual([
			{note: 'mockNoteValue', title: 'mockLectureTitle'},
			{note: undefined, title: 'mockLectureTitle'}
		]);
	});

	it('should selectLectureNotes', () => {
		expect(selectors.selectLectureNotes.projector(
			{lecture1: 'test', lecture2: 'test2'}, //notes.noteMap
			{system_id: 'lecture1'} //currentLesson
		)).toEqual('test');
	});

	it('should selectNotesSaveStatus', () => {
		expect(selectors.selectNotesSaveStatus(mockInitialState).isSaving).toBeFalsy();
		expect(selectors.selectNotesSaveStatus(mockInitialState).savedAt).toBeInstanceOf(Date);
	});
});

function getNotesStateWithValue(value: any) {
	return {
		...mockInitialState,
		notes: {
			...mockInitialState.notes,
			...value
		},
		course: {
			...mockInitialState.course,
			courses: [
				helpers.getMockCourse({
					system_id: 'mock_course_1',
					title: 'mockCourse',
					lectures: [
						helpers.getMockCourseLecture({system_id: 'lecture1'}),
						helpers.getMockCourseLecture({system_id: 'lecture2'})
					]
				})
			],
			currentCourse: 'mockCourse_urlSlug',
			//currentLesson:
		}
	};
}
