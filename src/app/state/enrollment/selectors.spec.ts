import {mockInitialState} from '../index';
import * as selectors from './selectors';
import * as helpers from '../../../test.helpers';
import { fixtureState } from '../fixtures/state.fixture';

describe('Enrollment selectors', () => {
	it('should return ALL selectors as truthy/falsy from initial state', () => {
		expect(selectors.selectPendingCourse(mockInitialState)).toBeFalsy();
		expect(selectors.selectWithdrawReasons(mockInitialState)).toEqual([]);
	});

	it('should selectPendingCourse', () => {
		const mockState = getEnrollmentStateWithValue({
			pendingEnroll: helpers.getMockCourse({title: 'mockCourse'}),
			pendingWithdrawal: null,
			enrolledCourses: {},
			hasEnrolledList: false,
			withdrawalReasons: [],
		});
		expect(selectors.selectPendingCourse(mockState)).toBeTruthy();
		expect(selectors.selectPendingCourse(mockState).title).toEqual('mockCourse');
	});

	it('should selectWithdrawalReasons', () => {
		const mockState = getEnrollmentStateWithValue({
			pendingEnroll: null,
			pendingWithdrawal: null,
			enrolledCourses: {},
			hasEnrolledList: false,
			withdrawalReasons: [
				{id: 1, text: 'mockReason1'},
				{id: 2, text: 'mockReason2'}
			],
		});
		expect(selectors.selectWithdrawReasons(mockState)).toBeTruthy();
		expect(selectors.selectWithdrawReasons(mockState)[1].id).toEqual(2);
	});
});

function getEnrollmentStateWithValue(value: any) {
	return {
		...mockInitialState,
		enrollment: {
			...mockInitialState.enrollment,
			...value
		}
	};
}
