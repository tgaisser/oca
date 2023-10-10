import {createAction, props} from '@ngrx/store';
import {QuizResult} from '../../common/models';

export const getCourseQuizResults = createAction('[Quizzes] Get Course Results', props<{courseId: string}>());
export const setCourseQuizResults = createAction('[Quizzes] Set Course Results', props<{courseId: string, results: QuizResult[]}>());

export const submitQuiz = createAction('[Quizzes] Submit Quiz', props<{quizName: string, quizType: string, answers: {[key: string]: string}}>());
export const setCourseQuizResult = createAction('[Quizzes] Set Result', props<{result: QuizResult}>());

export const obliterateQuizzesState = createAction('[Quizzes] Obliterate State');
