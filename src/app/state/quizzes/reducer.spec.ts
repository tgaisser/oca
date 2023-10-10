import * as quizReducer from './reducer';
import * as actions from './actions';
import * as helpers from '../../../test.helpers';

describe('Quizzes reducer', () => {
	const {initialState} = quizReducer;
	it('should return the initial state', () => {
		const action = {type: 'empty'};
		const state = quizReducer.reducer(undefined, action);
		expect(state).toBe(initialState);
	});

	it('should actions.setCourseQuizResults', () => {
		const options = {
			courseId: 'mockId', results: [
				helpers.getMockQuizResult({id: 'mockQuizResult1'}),
				helpers.getMockQuizResult({id: 'mockQuizResult2'})
			]
		};
		const action = actions.setCourseQuizResults(options);
		const state = quizReducer.reducer(initialState, action);
		expect(state.courseQuizResults).toBeTruthy();
	});

	it('should actions.setCourseQuizResult add result', () => {
		const newRes =  helpers.getMockQuizResult({quizId: 'mockQuizResult1'});
		const res2 = helpers.getMockQuizResult({quizId: 'mockQuizResult2'});
		const res3 = helpers.getMockQuizResult({quizId: 'mockQuizResult3'});
		const options = {result: newRes};
		const action = actions.setCourseQuizResult(options);
		const state = quizReducer.reducer(
			{
				...initialState,
				courseQuizResults: {
					mockCourseId: [
						res2,
						res3,
					]
				}
			},
			action);
		expect(state.courseQuizResults).toBeTruthy();
		expect(state.courseQuizResults).toEqual({
			mockCourseId: [
				res2, res3, newRes
			]
		});
	});

	it('should actions.setCourseQuizResult replace result', () => {
		const res1 =  helpers.getMockQuizResult({quizId: 'mockQuizResult1'});
		const res2 = helpers.getMockQuizResult({quizId: 'mockQuizResult2'});
		const res3 = helpers.getMockQuizResult({quizId: 'mockQuizResult3'});

		const newRes1 = {
			...res1,
			correctQuestions: 4,
		};
		const options = {result: newRes1};
		const action = actions.setCourseQuizResult(options);
		const state = quizReducer.reducer(
			{
				...initialState,
				courseQuizResults: {
					mockCourseId: [
						res1,
						res2,
						res3,
					]
				}
			},
			action);
		expect(state.courseQuizResults).toBeTruthy();
		expect(state.courseQuizResults).toEqual({
			mockCourseId: [
				res2, res3, newRes1
			]
		});
	});
});


