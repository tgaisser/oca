
import {createAction, props} from '@ngrx/store';
import {Course} from '../../services/course-data.service';
import {CourseEnrollment, CourseInquiry, WithdrawalReason} from '../../common/models';

export const enrollInCourseRequested = createAction('[Enrollment] Enroll Requested', props<{
	course: Course,
	title?: string,
	firstname?: string,
	lastname?: string,
	email?: string,
	studyGroupId?: string,
}>());
export const setPendingEnroll = createAction('[Enrollment] Set Pending Enroll', props<{
	email?: string,
	course: Course,
	studyGroupId: string,
	isFirstLoad?: boolean
}>());
export const inquireInCourseComplete = createAction('[Enrollment] Inquiry Complete', props<{ inquiry: CourseInquiry }>());
export const enrollInCourseComplete = createAction('[Enrollment] Enroll Complete', props<{ course: Course, enrollment: CourseEnrollment }>());
export const enrollInCourseCancelled = createAction('[Enrollment] Enroll Cancelled', props<{ course: Course }>());
export const withdrawFromCourseRequested = createAction('[Enrollment] Withdrawal Requested', props<{ course: Course, reason: number }>());
export const withdrawFromCourseComplete = createAction('[Enrollment] Withdrawal Complete', props<{ course: Course, enrollment: CourseEnrollment }>());
export const withdrawalFromCourseCancelled = createAction('[Enrollment] Withdrawal Cancelled', props<{ course: Course }>());
export const setEnrolledCourses = createAction('[Courses] Enrolled (Set)', props<{ courses: CourseEnrollment[] }>());
export const getWithdrawalReasons = createAction('[Courses] Get Withdrawal Reasons');
export const setWithdrawalReasons = createAction('[Courses] Set Withdrawal Reasons', props<{ reasons: WithdrawalReason[] }>());

export const setAccountCreationOnLandingPage = createAction('[Courses] Activate Account Create On Page', props<{ isAccountCreationOnLandingPageEnabled: boolean }>());
export const setLandingPageAccountCreationForm = createAction('[Courses] Display Register User On Page', props<{ showLandingPageAccountCreationForm: boolean }>());
export const setDonationLink = createAction('[Enrollment] Set Donation Link', props<{ donationLink: string }>());
export const setDonationTab = createAction('[Enrollment] Display Donation On New Tab');
export const setDonationModal = createAction('[Enrollment] Display Donation Inquiry On Modal');
export const setDoDonationInquiry = createAction('[Enrollment] Set Donation Inquiry', props<{ doDonationInquiry: boolean }>());
export const setDonationInquiryType = createAction('[Enrollment] Set Donation Inquiry Type', props<{ donationInquiryType: string}>());
