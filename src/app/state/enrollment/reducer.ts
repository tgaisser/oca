
import {Course} from '../../services/course-data.service';
import {Action, createReducer, on} from '@ngrx/store';
import * as actions from './actions';
import {CourseEnrollment, WithdrawalReason} from '../../common/models';
import { STATUS_CODES } from 'http';

export interface State {
	pendingEnroll: Course;
	pendingWithdrawal: Course;
	pendingStudyGroupId: string;
	enrolledCourses: {[key: string]: CourseEnrollment}; // key is course.system_id
	hasEnrolledList: boolean;
	withdrawalReasons: WithdrawalReason[];
	isAccountCreationOnLandingPageEnabled: boolean;
	showLandingPageAccountCreationForm: boolean;
	donationLink: string;
	doDonationInquiry: boolean;
	donationInquiryType: string;
}

export const initialState: State = {
	pendingEnroll: null,
	pendingWithdrawal: null,
	pendingStudyGroupId: null,
	enrolledCourses: {},
	hasEnrolledList: false,
	withdrawalReasons: [],
	isAccountCreationOnLandingPageEnabled: false,
	showLandingPageAccountCreationForm: false,
	donationLink: '',
	doDonationInquiry: false,
	donationInquiryType: null
};

const enrollmentReducer = createReducer(
	initialState,
	on(actions.setEnrolledCourses, (state, action) => ({
		...state,
		enrolledCourses: action.courses.reduce((agg, cur) => ({...agg, [cur.courseId]: cur}), {}),
		hasEnrolledList: true
	})),

	on(actions.setAccountCreationOnLandingPage, (state, action) => ({...state, isAccountCreationOnLandingPageEnabled: action.isAccountCreationOnLandingPageEnabled})),
	on(actions.setLandingPageAccountCreationForm, (state, action) => ({...state, showLandingPageAccountCreationForm: action.showLandingPageAccountCreationForm})),
	on(actions.setDonationLink, (state, action) => ({...state, donationLink: action.donationLink})),
	on(actions.setDoDonationInquiry, (state, action) => ({...state, doDonationInquiry: action.doDonationInquiry})),
	on(actions.setDonationInquiryType, (state, action) => ({...state, donationInquiryType: action.donationInquiryType})),

	on(actions.setPendingEnroll, (state, action) => ({
		...state,
		pendingEnroll: {
			...action.course,
			study_group_body_text: '',
			study_group_headline: '',
			lectures: [],
			instructors: []
		},
		pendingStudyGroupId: action.studyGroupId,
	})),
	on(actions.enrollInCourseRequested, (state, action) => ({
		...state,
		pendingEnroll: {
			...action.course,
			study_group_body_text: '',
			study_group_headline: '',
			lectures: [],
			instructors: []
		},
		pendingStudyGroupId: action.studyGroupId
	})),
	on(actions.enrollInCourseComplete, (state, action) => {
		const newEnrollments = {
			...state.enrolledCourses,
			[action.enrollment.courseId]: action.enrollment,
		};
		return {...state, pendingEnroll: null, pendingStudyGroupId: null, enrolledCourses: newEnrollments};
	}),
	on(actions.enrollInCourseCancelled, (state, action) => ({...state, pendingEnroll: null})),

	on(actions.withdrawFromCourseRequested, (state, action) => ({...state, pendingWithdrawal: action.course})),
	on(actions.withdrawFromCourseComplete, (state, action) => {
		const newEnrollments = {...state.enrolledCourses};
		if (newEnrollments[action.enrollment.courseId]) {
			delete newEnrollments[action.enrollment.courseId];
		}
		return {...state, pendingWithdrawal: null, enrolledCourses: newEnrollments};
	}),
	on(actions.withdrawalFromCourseCancelled, (state, action) => ({...state, pendingWithdrawal: null})),
	on(actions.setWithdrawalReasons, (state, action) => ({...state, withdrawalReasons: action.reasons}))
);

export function reducer(state: State|undefined, action: Action) {
	return enrollmentReducer(state, action);
}
