import * as actions from './actions';
import * as helpers from '../../../test.helpers';

describe('Quiz actions', () => {
	it('should create getCourseQuizResults', () => {
		const options = {courseId: 'mockCourseId'};
		const action = actions.getCourseQuizResults(options);
		expect(action.type).toEqual('[Quizzes] Get Course Results');
		expect(action.courseId).toEqual(options.courseId);
	});

	it('should create setCourseQuizResults', () => {
		const options = {courseId: 'mockCourseId', results: [
			helpers.getMockQuizResult({quizId: 'mockQuiz1'}),
			helpers.getMockQuizResult({quizId: 'mockQuiz2'})
		]};
		const action = actions.setCourseQuizResults(options);
		expect(action.type).toEqual('[Quizzes] Set Course Results');
		expect(action.courseId).toEqual(options.courseId);
		expect(action.results.length).toEqual(2);
		expect(action.results[0].quizId).toEqual('mockQuiz1');
	});

	it('should create submitQuiz', () => {
		const options = {quizName: 'mockQuiz', quizType: 'mockQuizType', answers: {['mockKey']: 'mockAnswer'}};
		const action = actions.submitQuiz(options);
		expect(action.type).toEqual('[Quizzes] Submit Quiz');
		expect(action.quizName).toEqual('mockQuiz');
	});

	it('should create setCourseQuizResult', () => {
		const options = {result: helpers.getMockQuizResult({quizId: 'mockQuiz'})};
		const action = actions.setCourseQuizResult(options);
		expect(action.type).toEqual('[Quizzes] Set Result');
		expect(action.result.quizId).toEqual('mockQuiz');
	});

});
