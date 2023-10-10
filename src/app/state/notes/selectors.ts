import {createSelector} from '@ngrx/store';
import {State as AppState} from '../index';
import * as courseSelectors from '../courses/selectors';
import {Course, CourseLecture} from '../../services/course-data.service';

export const selectLectureNotes = createSelector(
	(state: AppState) => state.notes.notesMap,
	(state: AppState) => courseSelectors.getCurrentLesson(state.course),
	(notesMap, currentLesson: CourseLecture) => currentLesson && notesMap[currentLesson.system_id]
);

export const selectCourseNotes = createSelector(
	(state: AppState) => state.notes.notesMap,
	(state: AppState) => courseSelectors.getCurrentCourse(state.course),
	(notesMap, currentCourse: Course) => {
		return currentCourse.lectures.map(l => ({
			title: l.title,
			note: notesMap[l.system_id]
		}));
	}
);

export const selectNotesSaveStatus = createSelector(
	(state: AppState) => state.notes,
	(notes) => ({isSaving: notes.isSaving, savedAt: notes.lastSavedDate})
);
