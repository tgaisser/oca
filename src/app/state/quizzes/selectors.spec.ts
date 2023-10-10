import {mockInitialState} from '../index';
import * as selectors from './selectors';
import * as helpers from '../../../test.helpers';

describe('Quizzes selectors', () => {
	it('should return ALL selectors as null, [] or truthy/falsy from initialState', () => {
		expect(selectors.selectCurrentQuiz(mockInitialState, null)).toBeFalsy();
	});

	it('should selectCurrentQuiz', () => {
		expect(selectors.selectCurrentQuiz.projector(
			[helpers.getMockQuizResult()],
			helpers.getMockCourse(),
			helpers.getMockCourseLecture()
		)).toBeUndefined();

		expect(selectors.selectCurrentQuiz.projector(
			[helpers.getMockQuizResult()],
			null,
			helpers.getMockCourseLecture()
		)).toBeFalsy();
	});
});

function getMockStateWithValue(value: any) {
	return {
		...mockInitialState,
		quizzes: {
			...mockInitialState.quizzes,
			...value
		}
	};
}
