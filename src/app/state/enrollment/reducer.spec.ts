import * as actions from './actions';
import * as enrollmentReducer from './reducer';
import * as helpers from '../../../test.helpers';
import mock = jest.mock;

describe('Enrollment reducer', () => {
	const {initialState} = enrollmentReducer;
	it('should return the initial state', () => {
		const action = {type: 'empty'};
		const state = enrollmentReducer.reducer(undefined, action);
		expect(state).toBe(initialState);
	});

	it('should actions.setEnrolledCourses', () => {
		const options = {
			courses: [
				helpers.getMockCourseEnrollment({id: 1}),
				helpers.getMockCourseEnrollment({id: 2})
			]
		};
		const action = actions.setEnrolledCourses(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.hasEnrolledList).toBeTruthy();
		expect(state.enrolledCourses).toBeTruthy();
	});

	it('should actions.setPendingEnroll', () => {
		const options = {course: helpers.getMockCourse({title: 'mockCourse'}), studyGroupId: ''};
		const action = actions.setPendingEnroll(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.pendingEnroll).toBeTruthy();
		expect(state.pendingEnroll).toEqual(options.course);
	});

	it('should actions.enrollInCourseRequested', () => {
		const options = {
			course: helpers.getMockCourse({title: 'mockCourseTitle'}),
			email: 'mock@test.com',
			isStudyGroupEnrollment: false,
		};
		const action = actions.enrollInCourseRequested(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.pendingEnroll).toBeTruthy();
		expect(state.pendingEnroll).toEqual(options.course);
	});

	it('should actions.enrollInCourseComplete', () => {
		const mockCourse = helpers.getMockCourse({system_id: 'mockCourse1'});
		const options = {
			course: mockCourse,
			enrollment: helpers.getMockCourseEnrollment({id: 1, courseId: mockCourse.system_id})
		};
		const action = actions.enrollInCourseComplete(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.enrolledCourses).toBeTruthy();
		expect(state.enrolledCourses[mockCourse.system_id].courseId).toEqual(mockCourse.system_id);
	});

	it('should actions.enrollInCourseCancelled', () => {
		const options = {course: helpers.getMockCourse({title: 'mockCourse'})};
		const action = actions.enrollInCourseCancelled(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.pendingEnroll).toBeFalsy();
	});

	it('should actions.withdrawFromCourseRequested', () => {
		const options = {
			course: helpers.getMockCourse({title: 'mockCourse'}),
			reason: 1
		};
		const action = actions.withdrawFromCourseRequested(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.pendingWithdrawal).toEqual(options.course);
	});

	it('should actions.withdrawFromCourseComplete', () => {
		const mockCourse = helpers.getMockCourse({system_id: 'mockCourse1'});
		const options = {
			course: mockCourse,
			enrollment: helpers.getMockCourseEnrollment({id: 1, courseId: mockCourse.system_id})
		};
		const action = actions.withdrawFromCourseComplete(options);
		const initState = {
			...initialState,
			enrolledCourses: {[mockCourse.system_id]: mockCourse}
		};
		const state = enrollmentReducer.reducer(initState, action);
		expect(state.pendingWithdrawal).toBeFalsy();
		expect(state.enrolledCourses[mockCourse.system_id]).toBeUndefined();
	});

	it('should actions.withdrawalFromCourseCancelled', () => {
		const options = {
			course: helpers.getMockCourse({title: 'mockCourse'})
		};
		const action = actions.withdrawalFromCourseCancelled(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.pendingWithdrawal).toBeFalsy();
	});

	it('should actions.setWithdrawalReasons', () => {
		const options = {
			reasons: [
				{id: 1, text: 'mockReason1'},
				{id: 2, text: 'mockReason2'}
			]
		};
		const action = actions.setWithdrawalReasons(options);
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.withdrawalReasons).toBeTruthy();
		expect(state.withdrawalReasons[1].id).toEqual(2);
	});

	it('should actions.setDonationLink', () => {
		const action = actions.setDonationLink({donationLink: 'helloTest'});
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.donationLink).toEqual('helloTest');
	});

	it('should actions.setDoDonationInquiry', () => {
		const action = actions.setDoDonationInquiry({doDonationInquiry: true});
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.doDonationInquiry).toBeTruthy();
	});

	it('should actions.donationInquiryType', () => {
		const action = actions.setDonationInquiryType({donationInquiryType: 'modal'});
		const state = enrollmentReducer.reducer(initialState, action);
		expect(state.donationInquiryType).toEqual('modal');
	});
});
