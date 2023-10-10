import {createSelector} from '@ngrx/store';
import {State as AppState} from '../index';
import * as courseSel from '../courses/selectors';

export const selectCurrentQuiz = createSelector(
	(state: AppState) => state.quizzes.courseQuizResults,
	(state: AppState) => courseSel.getCurrentCourse(state.course),
	(state: AppState) => courseSel.getCurrentLesson(state.course),
	(quizzes, currentCourse, currentLesson, params) => {
		// console.log('sel', quizzes, currentCourse, currentLesson, params);
		if (!currentCourse || !currentLesson || !Object.keys(quizzes).length) return null;

		const courseQuizzes = quizzes[currentCourse.system_id] || [];
		// console.log('sel quizzes', courseQuizzes)
		return courseQuizzes.find(q => (q.lectureId === currentLesson.system_id) && q.quizId === params.quizId);
	}
);
