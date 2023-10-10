import * as selectors from './selectors';
import {mockInitialState} from '../index';
import * as helpers from '../../../test.helpers';
import { Course } from 'src/app/services/course-data.service';
import { CourseEnrollment, CourseProgress } from 'src/app/common/models';
import { fixtureState } from '../fixtures/state.fixture';

describe('Course selectors', () => {
	it('should return ALL selectors as empty [] or null from initial state', () => {
		expect(selectors.selectAllCourses(mockInitialState)).toEqual([]);
		expect(selectors.selectFeaturedCourses(mockInitialState)).toEqual([]);
		expect(selectors.selectDvdCatalogCourses(mockInitialState)).toEqual([]);
		expect(selectors.selectCourseSubjects(mockInitialState)).toEqual([]);
		expect(selectors.selectMyCourses(mockInitialState)).toEqual([]);
		expect(selectors.selectIsEnrolledInCourseNullIfWaiting(null)(mockInitialState)).toBeFalsy();
		expect(selectors.selectMyCourseSlugsNullIfWaiting(mockInitialState)).toBeFalsy();
		expect(selectors.selectMyCoursesWithProgress(mockInitialState)).toEqual([]);
		expect(selectors.selectCourseWithProgress(mockInitialState, {})).toBeFalsy();
		expect(selectors.selectCurrentCourseWithProgress(mockInitialState)).toBeFalsy();
		expect(selectors.selectCurrentCourse(mockInitialState)).toBeFalsy();
		expect(selectors.selectCurrentLesson(mockInitialState)).toBeFalsy();
		expect(selectors.selectCourseSlugsToCodeName(mockInitialState)).toEqual([]);
		expect(selectors.selectCurrentLessonId(mockInitialState)).toBeFalsy();
		expect(selectors.selectCurrentStateSystemIds(mockInitialState)).toBeTruthy();
		expect(selectors.getStudyGroupForCourseId('requestedCourseId')(mockInitialState)).toBeNull();
		expect(selectors.selectNextCourse(mockInitialState)).toEqual([]);
		expect(selectors.selectNextCoursesBySubject('requestedSubject')(mockInitialState)).toEqual([]);
	});

	it('should selectAllCourses', () => {
		const mockState = getMockStateWithCourses([
			helpers.getMockCourse({
				course_subject: ['History'],
				title: 'History 101',
				system_id: 'mockCourse'
			})
		], 'mockCourse');
		expect(selectors.selectAllCourses(mockState)).toBeTruthy();
		expect(selectors.selectAllCourses(mockState).length).toEqual(1);
	});

	it('should selectFeaturedCourses', () => {
		const mockState = getMockStateWithCourses([
			helpers.getMockCourse({
				course_subject: [{codename: 'a', name: 'History'}],
				title: 'History 101',
				system_id: 'mockCourse',
				featured_course: true
			})
		], 'mockCourse');
		expect(selectors.selectFeaturedCourses(mockState)).toBeTruthy();
		expect(selectors.selectFeaturedCourses(mockState).length).toBeGreaterThan(0);
	});

	it('should selectDvdCatalogCourses', () => {
		const mockState = getMockStateWithCourses([
			helpers.getMockCourse({
				course_subject: [{codename: 'a', name: 'History'}],
				title: 'History 101',
				system_id: 'mockCourse1',
				course_dvd_donation_url: 'mockUrl'
			}),
			helpers.getMockCourse({
				course_subject: [{codename: 'b', name: 'Math'}],
				title: 'Math',
				system_id: 'mockCourse2'
			})
		], 'mockCourse1');
		expect(selectors.selectDvdCatalogCourses(mockState)).toBeTruthy();
		expect(selectors.selectDvdCatalogCourses(mockState).length).toEqual(1);
		expect(selectors.selectDvdCatalogCourses(mockState)[0].system_id).toEqual(mockState.course.courses[0].system_id);
	});

	it('should selectCourseSubjects', () => {
		const mockState = getMockStateWithCourses([
			helpers.getMockCourse({
				course_subject: [{codename: 'a', name: 'History'}],
				title: 'History 101',
				system_id: 'mockCourse1',
				course_dvd_donation_url: 'mockUrl',
				featured_course: true
			}),
			helpers.getMockCourse({
				course_subject: [{codename: 'b', name: 'Math'}],
				title: 'Math',
				system_id: 'mockCourse2',
				featured_course: true
			})
		], 'mockCourse1');
		expect(selectors.selectCourseSubjects(mockState).length).toEqual(2);
		expect(selectors.selectCourseSubjects(mockState)[0]).toEqual({codename: 'a', name: 'History', order: 200});

	});

	it('should selectMyCourses', () => {
		expect(selectors.selectMyCourses.projector(
			[
				helpers.getMockCourse({system_id: 'course1'}),
				helpers.getMockCourse({system_id: 'course2'})
			],
			{course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1'})},
			{mockCourse: helpers.getMockMultimediaItem()}
		).length).toEqual(1);
	});

	it('should selectIsEnrolledInCourseNullIfWaiting', () => {
		expect(selectors.selectIsEnrolledInCourseNullIfWaiting('course1')(fixtureState)).toBeTruthy();
		expect(selectors.selectIsEnrolledInCourseNullIfWaiting('course2')(fixtureState)).toBeFalsy();
	});


	it('should selectIsEnrolledInCurrentCourseNullIfWaiting', () => {
		expect(selectors.selectIsEnrolledInCurrentCourseNullIfWaiting(fixtureState)).toBeTruthy();
	});

	it('should selectMyCourseSlugsNullIfWaiting', () => {
		expect(selectors.selectMyCourseSlugsNullIfWaiting.projector(
			[
				helpers.getMockCourse({system_id: 'course1'}),
				helpers.getMockCourse({system_id: 'course2'})
			],
			{course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1'})},
			true
		)[0]).toEqual('mockCourse_urlSlug');
	});

	it('should selectMyCoursesWithProgress', () => {
		expect(selectors.selectMyCoursesWithProgress(fixtureState).length).toEqual(1);
	});

	it('should selectCourseWithProgress', () => {
		const expectedCourse = helpers.getMockCourse({system_id: 'course1', url_slug: 'mockCourse1_urlSlug'});
		expect(selectors.selectCourseWithProgress.projector(
			[
				expectedCourse,
				helpers.getMockCourse({system_id: 'course2'})
			],
			{course1: helpers.getMockCourse({system_id: 'course1'})},
			[
				helpers.getMockProgress({itemId: 'course1'}),
				helpers.getMockProgress({itemId: 'course2'})
			],
			{course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1'})},
			{mockCourse: helpers.getMockMultimediaItem()},
			{courseSlug: 'mockCourse1_urlSlug'}
		).progress.itemId).toEqual(expectedCourse.system_id);
	});

	it('should selectCourseWithProgress no results', () => {
		const expectedCourse = helpers.getMockCourse({system_id: 'course1', url_slug: 'mockCourse1_urlSlug'});
		expect(selectors.selectCourseWithProgress.projector(
			[
				expectedCourse,
				helpers.getMockCourse({system_id: 'course2'})
			],
			{course1: helpers.getMockCourse({system_id: 'course2'})},
			[
				helpers.getMockProgress({itemId: 'course1'}),
				helpers.getMockProgress({itemId: 'course2'})
			],
			{course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1'})},
			{mockCourse: helpers.getMockMultimediaItem()},
			{courseSlug: 'mockCourse2_urlSlug'}
		)).toBeFalsy();
	});

	it('should selectCurrentCourseWithProgress', () => {
		expect(selectors.selectCurrentCourseWithProgress(fixtureState).progress.itemId).toEqual('course1');
	});

	it('should selectCurrentCourseWithProgress without coursesProgress', () => {
		expect(selectors.selectCurrentCourseWithProgress(fixtureState).system_id).toEqual('course1');
	});

	it('should selectCurrentCourse', () => {
		expect(selectors.selectCurrentCourse(fixtureState).course_subject[0].codename).toEqual('subject1');
	});

	it('should selectCurrentLesson', () => {
		expect(selectors.selectCurrentLesson(fixtureState)).toBeUndefined();
	});

	it('should selectCourseSlugsToCodeName', () => {
		expect(selectors.selectCourseSlugsToCodeName(fixtureState)[0].codename).toEqual('mockSystemCodeName');
	});

	it('should selectCurrentLessonId', () => {
		expect(selectors.selectCurrentLessonId.projector({
			courses: [
				helpers.getMockCourse({system_id: 'mockCourse1'}),
				helpers.getMockCourse({system_id: 'mockCourse2'})
			],
			currentLesson: 'lesson1'
		})).toEqual('lesson1');
	});

	it('should selectCurrentStateSystemIds as null', () => {
		expect(selectors.selectCurrentStateSystemIds.projector({
			courses: [
				helpers.getMockCourse({system_id: 'mockCourse1'}),
				helpers.getMockCourse({system_id: 'mockCourse2'})
			],
			courseDetails: {course1: helpers.getMockCourse({system_id: 'course1'})},
			currentLesson: 'lesson1',
			currentContentItem: helpers.getMockCourseContent()
		}
		)).toEqual({contentId: null, courseId: null, lessonId: null});
	});

	it('should selectCurrentStateSystemIds for expected course', () => {
		const expectedCourse = helpers.getMockCourse({
			system_id: 'mockCourse1',
			url_slug: 'mockCourse1_urlSlug',
			lectures: [
				helpers.getMockCourseLecture({system_id: 'oc-final-quiz-fq'})
			]
		});
		const curContent = helpers.getMockCourseContent({system_id: expectedCourse.system_id, url_slug: expectedCourse.url_slug});
		expect(selectors.selectCurrentStateSystemIds.projector({
			courses: [
				expectedCourse,
				helpers.getMockCourse({system_id: 'mockCourse2', url_slug: 'mockCourse2_urlSlug'})
			],
			courseDetails: {[expectedCourse.system_id]: expectedCourse},
			currentCourse: expectedCourse.system_id,
			currentLesson: 'oc-final-quiz-fq',
			currentContentItem: curContent
		}
		)).toEqual({
			courseId: expectedCourse.system_id,
			lessonId: expectedCourse.lectures[0].system_id,
			contentId: null
		});
	});

	it('should selectNextCourse return empty []', () => {
		expect(selectors.selectNextCourse.projector(
			[
				helpers.getMockCourse({system_id: 'course1'}),
				helpers.getMockCourse({system_id: 'course2'})
			],
			{course1: helpers.getMockCourse({system_id: 'course1'})},
			[
				helpers.getMockProgress({itemId: 'course1'}),
				helpers.getMockProgress({itemId: 'course2'})
			],
			'course1',
			{mockCourse: helpers.getMockMultimediaItem()},

			{
				course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1'}),
				course2: helpers.getMockCourseEnrollment({id: 2, courseId: 'course2'})
			},
		)).toEqual([]);
	});

	it('should selectNextCourse return course2', () => {
		const expectedCourse = helpers.getMockCourse({system_id: 'course2'});
		expect(selectors.selectNextCourse(fixtureState)[0].progress.itemId).toEqual(expectedCourse.system_id);
	});

	it('should selectCurrentStudyGroup', () => {
		expect(selectors.selectCurrentStudyGroup(fixtureState)).toEqual(
			expect.objectContaining({
				system_id: 'studyGroup1'
			})
		);
	});

	it('should selectNextCourseBySubject', () => {
		expect(selectors.selectNextCoursesBySubject('subject2')(fixtureState)).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					system_id: 'course3'
				}),
			])
		);
	});

	it('should selectTestimonials', () => {
		expect(selectors.selectTestimonials(3)(fixtureState)).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					system_id: 'ct1'
				}),
				expect.objectContaining({
					system_id: 'ct2'
				}),
				expect.objectContaining({
					system_id: 'gt1'
				}),
			])
		);
	});

	it('should select one Testimonials', () => {
		expect(selectors.selectTestimonials(1)(fixtureState)).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					system_id: 'ct1'
				}),
			])
		);
	});

	it('gets study group by course id', () => {
		const activeStudyGroups = [
			helpers.getMockStudyGroup({system_id: 'studyGroup2'}),
			helpers.getMockStudyGroup({system_id: 'studyGroup1'}),
		];
		const enrolledCourses = {
			course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1', studyGroupId: 'studyGroup1'}),
			course2: helpers.getMockCourseEnrollment({id: 2, courseId: 'course2', studyGroupId: 'studyGroup2'})
		};

		expect(selectors.getStudyGroupForCourseId('course1').projector(
			activeStudyGroups,
			enrolledCourses
		)).toEqual(
			expect.objectContaining({
				system_id:'studyGroup1'
			})
		);
	});

	it('should selectCurrentStudyGroup', () => {
		expect(selectors.selectCurrentStudyGroup(fixtureState)).toEqual(
			expect.objectContaining({
				system_id: 'studyGroup1'
			})
		);
	});

	it('should selectNextCourseBySubject', () => {
		expect(selectors.selectNextCoursesBySubject('subject2')(fixtureState)).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					system_id: 'course3'
				}),
			])
		);
	});

	it('should selectTestimonials', () => {
		expect(selectors.selectTestimonials(3)(fixtureState)).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					system_id: 'ct1'
				}),
				expect.objectContaining({
					system_id: 'ct2'
				}),
				expect.objectContaining({
					system_id: 'gt1'
				}),
			])
		);
	});

	it('should select one Testimonials', () => {
		expect(selectors.selectTestimonials(1)(fixtureState)).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					system_id: 'ct1'
				}),
			])
		);
	});

	it('gets study group by course id', () => {
		const activeStudyGroups = [
			helpers.getMockStudyGroup({system_id: 'studyGroup2'}),
			helpers.getMockStudyGroup({system_id: 'studyGroup1'}),
		];
		const enrolledCourses = {
			course1: helpers.getMockCourseEnrollment({id: 1, courseId: 'course1', studyGroupId: 'studyGroup1'}),
			course2: helpers.getMockCourseEnrollment({id: 2, courseId: 'course2', studyGroupId: 'studyGroup2'})
		};

		expect(selectors.getStudyGroupForCourseId('course1').projector(
			activeStudyGroups,
			enrolledCourses
		)).toEqual(
			expect.objectContaining({
				system_id:'studyGroup1'
			})
		);
	});
});

function getMockStateWithCourses(courses: any[], currentCourse?: string, courseDetails?: any) {
	return {
		...mockInitialState,
		course: {
			...mockInitialState.course,
			courses: [
				...courses
			],
			currentCourse,
			courseDetails: {
				...mockInitialState.course.courseDetails,
				...courseDetails
			}
		},
	};
}
