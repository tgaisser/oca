import * as actions from './actions';
import * as helpers from '../../../test.helpers';

describe('Enrollment actions', () => {
	it('should create enrollInCourseRequested', () => {
		const options = {
			course: helpers.getMockCourse({id: 'mockCourseId'}),
			email: 'mock@test.com',
			studyGroupId: null,
		};
		const action = actions.enrollInCourseRequested(options);
		expect(action.type).toEqual('[Enrollment] Enroll Requested');
		expect(action.course).toEqual(options.course);
		expect(action.email).toEqual(options.email);
		expect(action.studyGroupId).toEqual(options.studyGroupId);
	});

	it('should create setPendingEnroll', () => {
		const options = {course: helpers.getMockCourse({id: 'mockCourseId'}), studyGroupId: ''};
		const action = actions.setPendingEnroll(options);
		expect(action.type).toEqual('[Enrollment] Set Pending Enroll');
		expect(action.course).toEqual(options.course);
	});

	it('should create enrollInCourseComplete', () => {
		const options = {course: helpers.getMockCourse({title: 'History'}), enrollment: helpers.getMockCourseEnrollment()};
		const action = actions.enrollInCourseComplete(options);
		expect(action.type).toEqual('[Enrollment] Enroll Complete');
		expect(action.course).toEqual(options.course);
		expect(action.enrollment).toEqual(options.enrollment);
	});

	it('should create enrollInCourseCancelled', () => {
		const options = {course: helpers.getMockCourse({id: 'mockCourseId'})};
		const action = actions.enrollInCourseCancelled(options);
		expect(action.type).toEqual('[Enrollment] Enroll Cancelled');
		expect(action.course).toEqual(options.course);
	});

	it('should create withdrawFromCourseRequested', () => {
		const options = {course: helpers.getMockCourse({id: 'mockCourseId'}), reason: 5};
		const action = actions.withdrawFromCourseRequested(options);
		expect(action.type).toEqual('[Enrollment] Withdrawal Requested');
		expect(action.course).toEqual(options.course);
		expect(action.reason).toEqual(options.reason);
	});

	it('should create withdrawFromCourseComplete', () => {
		const options = {course: helpers.getMockCourse({title: 'MockCourse'}), enrollment: helpers.getMockCourseEnrollment({id: 1})};
		const action = actions.withdrawFromCourseComplete(options);
		expect(action.type).toEqual('[Enrollment] Withdrawal Complete');
		expect(action.course.title).toEqual('MockCourse');
		expect(action.enrollment.id).toEqual(1);
	});

	it('should create withdrawalFromCourseCancelled', () => {
		const options = {course: helpers.getMockCourse({id: 'mockCourseId'})};
		const action = actions.withdrawalFromCourseCancelled(options);
		expect(action.type).toEqual('[Enrollment] Withdrawal Cancelled');
		expect(action.course).toEqual(options.course);
	});

	it('should create setEnrolledCourses', () => {
		const options = {
			courses: [
				helpers.getMockCourseEnrollment({id: 'mockId1'}),
				helpers.getMockCourseEnrollment({id: 'mockId2', userHasEarlyAccess: true})
			]
		};
		const action = actions.setEnrolledCourses(options);
		expect(action.type).toEqual('[Courses] Enrolled (Set)');
		expect(action.courses).toBeTruthy();
		expect(action.courses).toEqual(options.courses);
		expect(action.courses[1].userHasEarlyAccess).toBeTruthy();
	});

	it('should create getWithdrawalReasons', () => {
		const action = actions.getWithdrawalReasons();
		expect(action.type).toEqual('[Courses] Get Withdrawal Reasons');
	});

	it('should create setWithdrawalReasons', () => {
		const options = {reasons: [
			{id: 1,	text: 'mockReason1'},
			{id: 2, text: 'mockReason2'}
		]};
		const action = actions.setWithdrawalReasons(options);
		expect(action.type).toEqual('[Courses] Set Withdrawal Reasons');
		expect(action.reasons).toBeTruthy();
		expect(action.reasons).toEqual(options.reasons);
		expect(action.reasons[1].id).toEqual(2);
	});

	it('should create setDonationTab', () => {
		const action = actions.setDonationTab();
		expect(action.type).toEqual('[Enrollment] Display Donation On New Tab');
	});

	it('should create setDonationModal', () => {
		const action = actions.setDonationModal();
		expect(action.type).toEqual('[Enrollment] Display Donation Inquiry On Modal');
	});

	it('should create setDoDonationInquiry', () => {
		const action = actions.setDoDonationInquiry({doDonationInquiry: false});
		expect(action.type).toEqual('[Enrollment] Set Donation Inquiry');
	});

	it('should create setDonationInquiryType', () => {
		const action = actions.setDonationInquiryType({donationInquiryType: 'modal'});
		expect(action.type).toEqual('[Enrollment] Set Donation Inquiry Type');
		expect(action.donationInquiryType).toEqual('modal');
	});

	it('should create setDonationLink', () => {
		const action = actions.setDonationLink({donationLink: 'mockDonationLink'});
		expect(action.type).toEqual('[Enrollment] Set Donation Link');
		expect(action.donationLink).toEqual('mockDonationLink');
	});
});
