import * as helpers from '../../../test.helpers';
import {State} from '../enrollment/reducer';

export const enrollmentFixture: State = {
	pendingEnroll: null,
	pendingWithdrawal: null,
	pendingStudyGroupId: null,
	enrolledCourses: {
		course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1', studyGroupId: 'studyGroup1'})
	},
	hasEnrolledList: true,
	withdrawalReasons: [],
	isAccountCreationOnLandingPageEnabled: false,
	showLandingPageAccountCreationForm: false,
	donationLink: '',
	doDonationInquiry: false,
	donationInquiryType: null,
};
