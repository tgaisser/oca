import {Action, createReducer, on} from '@ngrx/store';
import * as actions from './actions';
import {QuizResult} from '../../common/models';

export interface State {
	courseQuizResults: {[key: string]: QuizResult[]};
}
export const initialState: State = {
	courseQuizResults: {}
};

export const quizzesReducer = createReducer(
	initialState,
	on(actions.setCourseQuizResults, (state, action) => ({...state, courseQuizResults: {
		...state.courseQuizResults,
		[action.courseId]: action.results
	}
	})),
	on(actions.setCourseQuizResult, (state, action) => ({
		...state,
		courseQuizResults: {
			...state.courseQuizResults,
			[action.result.courseId]: (state.courseQuizResults[action.result.courseId] || [])
				.filter(r => r.quizId !== action.result.quizId)
				.concat(action.result)
		}
	})),
	on(actions.obliterateQuizzesState, state => ({...state, courseQuizResults: {}})),
);

export function reducer(state: State|undefined, action: Action) {
	return quizzesReducer(state, action);
}
