import {State} from '../courses/reducers';
import * as helpers from '../../../test.helpers';

export const courseFixture: State = {
	courses: [
		helpers.getMockCourse({
			system_id: 'course1',
			url_slug: 'mockCourse1_urlSlug',
			course_subject: [{name: 'subject 1', codename: 'subject1'}],
			publication_date: new Date('01/03/2020'),
			title: 'Course One',
		}),
		helpers.getMockCourse({
			system_id: 'course2',
			url_slug: 'mockCourse2_urlSlug',
			course_subject: [{name: 'subject 1', codename: 'subject1'}],
			publication_date: new Date('01/01/2020'),
			title: 'Course Two',
		}),
		helpers.getMockCourse({
			system_id: 'course3',
			url_slug: 'mockCourse3_urlSlug',
			course_subject: [{name: 'subject 2', codename: 'subject2'}],
			publication_date: new Date('01/02/2020'),
			title: 'Course Three',
		}),
	],
	courseDetails: {
		course1: helpers.getMockCourse({
			system_id: 'course1',
			url_slug: 'mockCourse1_urlSlug',
			lectures: [
				helpers.getMockCourseLecture({system_id: 'oc-final-quiz-fq'})
			],
			course_subject: [{name: 'subject 1', codename: 'subject1'}],
		})
	},
	coursesAreStubbed: true,
	currentCourse: 'course1',
	currentLesson: 'lesson1',
	currentContentItem: null,
	currentContentType: null,
	coursesProgress: [
		helpers.getMockProgress({
			itemId: 'course1',
			children: [
				{itemId: 'mockQuizId', progressPercentage: 0, itemType: 'quiz'},
				{itemId: 'videoLesson1', progressPercentage: 0, itemType: 'video'},
			]
		}),
		helpers.getMockProgress({itemId: 'course2'})
	],
	coursesProgressTimestamp: 0,
	videoProgress: {},
	videoPostTimes: {},
	multimediaDetails: {course1: helpers.getMockMultimediaItem()},
	studyGroups: {
		studyGroup1: helpers.getMockStudyGroup({system_id: 'studyGroup1'}),
		studyGroup2: helpers.getMockStudyGroup({system_id: 'studyGroup2'})
	},
	activeStudyGroups: [
		helpers.getMockStudyGroup({system_id: 'studyGroup2'}),
		helpers.getMockStudyGroup({system_id: 'studyGroup1'}),
	],
	activeStudyGroupsLoaded: false,
	generalTestimonials: [
		helpers.getMockTestimonial({system_id: 'gt1'}),
		helpers.getMockTestimonial({system_id: 'gt2'}),
		helpers.getMockTestimonial({system_id: 'gt3'}),
		helpers.getMockTestimonial({system_id: 'gt4'}),
	],
	courseTestimonials: {
		course1: [
			helpers.getMockStudyGroup({system_id: 'ct1'}),
			helpers.getMockStudyGroup({system_id: 'ct2'})
		],
		course2: [
			helpers.getMockStudyGroup({system_id: 'ct3'}),
			helpers.getMockStudyGroup({system_id: 'ct4'}),
			helpers.getMockStudyGroup({system_id: 'ct5'}),
		]
	}
};
