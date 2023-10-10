import {createSelector} from '@ngrx/store';
import {State as AppState} from '../../state';
import {Course, CourseContent, CourseLecture} from '../../services/course-data.service';
import {MultimediaItem} from 'hc-video-player';
import { FINAL_QUIZ_LECTURE_ID } from '../../common/constants';
import {CourseEnrollment, CourseProgress} from '../../common/models';

const preferredOrder = ['politics', 'history', 'literature', 'philosophy___religion', 'economics'];

export const selectAllCourses = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.course.coursesProgress,
	(state: AppState) => state.course.multimediaDetails,
	(courses, enrolledCourses, coursesProgress, multimediaDetails) => {
		return courses
			.filter(c => !c.hide_from_catalog)
			.map(c => {
				const enrCrs = enrolledCourses[c.system_id];
				const newCrs = {
					...c,
					enrolled: !!enrCrs,
					userHasEarlyAccess: enrCrs && enrCrs.userHasEarlyAccess,
					course_trailer: multimediaDetails[c.course_trailer_id]
				};

				const curPrg = coursesProgress.find(cp => cp.itemId === c.system_id);
				if (curPrg) {
					newCrs.progress = {...curPrg, children: null};
				}
				return newCrs;
			})
			//Always sort courses by publish date (desc)
			.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());
	}
);

export const selectFeaturedCourses = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.course.multimediaDetails,
	(courses, enrolledCourses, multimediaDetails) => {
		return courses.filter(c => c.featured_course)
			.sort((a, b) => a.publication_date < b.publication_date ? 1 : (a.publication_date === b.publication_date ? 0 : -1))
			.map(c => {
				const enrCrs = enrolledCourses[c.system_id];
				return {
					...c,
					enrolled: !!enrCrs,
					userHasEarlyAccess: enrCrs && enrCrs.userHasEarlyAccess,
					course_trailer: multimediaDetails[c.course_trailer_id]
				};
			});
	}
);

export const selectDvdCatalogCourses = createSelector(
	(state: AppState) => state.course.courses,
	(courses) => {
		return courses.filter(c => c.course_dvd_donation_url && c.course_dvd_donation_url !== '')
			.sort((a, b) => a.publication_date < b.publication_date ? 1 : (a.publication_date === b.publication_date ? 0 : -1));
	}
);

export const selectCourseSubjects = createSelector(
	(state: AppState) => state.course,
	course => {
		const subjects = Array.prototype.concat.apply([], course.courses
			.map(c => c.course_subject)
		)
			.filter(c => c)
			.map(c => {
				const order = preferredOrder.indexOf(c.codename);
				return {...c, order: order > -1 ? order : 200};
			});

		const subjectCodenames = subjects.map(s => s.codename);
		return subjects.filter((s, index) => subjectCodenames.indexOf(s.codename) === index)
			.sort((a, b) => a.order - b.order);
	}
);

export const selectMyCourses = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.course.multimediaDetails,
	(courses, enrolledCourses, multimediaDetails) => {
		return courses
			.filter(c => enrolledCourses[c.system_id])
			.map(c => ({...c, enrolled: true, course_trailer: multimediaDetails[c.course_trailer_id]}));
	}
);

const isEnrolledInCourseNullIfWaiting = (courseSlug, courses, courseDetails, enrolledCourses, hasEnrolledList) => {
	//if we haven't gotten back the enrollment list or hasn't gotten back the course list, then return null
	if (!hasEnrolledList) return null;
	const match = courseDetails[courseSlug] || courses.find(c => c.url_slug === courseSlug);
	if (!match) return null;

	//return the slugs of the enrolled courses
	return !!enrolledCourses[match.system_id];
};

export const selectIsEnrolledInCourseNullIfWaiting = courseSlug => createSelector(
	(state: AppState) => state.course.courses, //TODO do we need?
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.enrollment.hasEnrolledList,
	(courses, courseDetails, enrolledCourses, hasEnrolledList) => {
		return isEnrolledInCourseNullIfWaiting(courseSlug, courses, courseDetails, enrolledCourses, hasEnrolledList);
	}
);
export const selectIsEnrolledInCurrentCourseNullIfWaiting = createSelector(
	(state: AppState) => state.course.courses, //TODO do we need?
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.enrollment.hasEnrolledList,
	(state: AppState) => state.course.currentCourse,
	(courses, courseDetails, enrolledCourses, hasEnrolledList, currentCourse) => {
		if (!currentCourse) return null;
		return isEnrolledInCourseNullIfWaiting(currentCourse, courses, courseDetails, enrolledCourses, hasEnrolledList);
	}
);

//TODO FIX THIS!!! THIS NO LONGER WORKS WITH THE MORE DIRECT APPROACH
export const selectMyCourseSlugsNullIfWaiting = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.enrollment.hasEnrolledList,
	(courses, enrolledCourses, hasEnrolledList) => {

		// console.log('selectMyCoursesSlugsNullIfWaiting', courses && courses.length, enrolledCourses && enrolledCourses.length, hasEnrolledList);
		//if we haven't gotten back the enrollment list or hasn't gotten back the course list, then return null
		if (!hasEnrolledList || !courses.length) return null;

		//return the slugs of the enrolled courses
		return courses
			.filter(c => enrolledCourses[c.system_id])
			.map(c => c.url_slug);
	}
);

export const selectMyCoursesWithProgress = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.course.coursesProgress,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.course.multimediaDetails,
	// (state: AppState) => state.course.studyGroups,
	(courses, coursesProgress, enrolledCourses, multimediaDetails/*, studyGroups*/) => {
		const newCourses = courses
			.filter(c => enrolledCourses[c.system_id])
			.map(c => {
				const enrCrs = enrolledCourses[c.system_id];
				return {
					...c,
					enrolled: true,
					userHasEarlyAccess: enrCrs && enrCrs.userHasEarlyAccess,
					course_trailer: multimediaDetails[c.course_trailer_id],
					// studyGroup: enr.studyGroupId && studyGroups[enr.studyGroupId]
				};
			});
		if (coursesProgress) {
			newCourses.forEach(c => c.progress = coursesProgress.find(cp => cp.itemId === c.system_id));
		}
		return newCourses;
	}
);

export const selectCourseWithProgress = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.course.coursesProgress,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.course.multimediaDetails,
	(courses, courseDetails, coursesProgress, enrCrs, multimediaDetails, props) => {
		return getCourseWithProgress(courses, courseDetails, coursesProgress, props.courseSlug, enrCrs, multimediaDetails);
	}
);

export const selectCurrentCourseWithProgress = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.course.coursesProgress,
	(state: AppState) => state.course.currentCourse,
	(state: AppState) => state.enrollment.enrolledCourses,
	(state: AppState) => state.course.multimediaDetails,
	(courses, courseDetails, coursesProgress, currentCourseSlug, enrollCrs, multimediaDetails) => {
		return getCourseWithProgress(courses, courseDetails, coursesProgress, currentCourseSlug, enrollCrs, multimediaDetails);
	}
);

export function attachMultimedia(obj, multimediaDetails, key = 'multimedia') {
	if (!obj) return obj;

	const objKey = obj[`${key}_id`];
	return objKey && multimediaDetails ? ({
		...obj,
		[key]: multimediaDetails[objKey],
	}) : obj;
}

function getCourseWithProgress(courses, courseDetails, coursesProgress, courseSlug, enrolledCourses, multimediaDetails) {
	const matchedCourse = courseDetails[courseSlug] || courses.find(c => c.url_slug === courseSlug);
	const prog = coursesProgress && matchedCourse && coursesProgress.find(cp => cp.itemId === matchedCourse.system_id);
	if (!matchedCourse) return null;
	const enrCrs = enrolledCourses[matchedCourse.system_id];
	if (prog) {
		// const retCrs = {
		const contentProg = prog.children || [];
		return {
			...matchedCourse,
			progress: prog,
			//special lesson handling
			lectures: matchedCourse.lectures.map(l => attachMultimedia({
				...l,
				progress: contentProg.find(cp => cp.itemId === l.system_id),
				supplementary_videos: l.supplementary_videos ? l.supplementary_videos.map(qa => attachMultimedia(qa, multimediaDetails)) : [],
				quiz: l.quiz ? {...l.quiz, progress: contentProg.find(cp => cp.itemId === l.quiz.system_id)} : null,
			}, multimediaDetails)),
			userHasEarlyAccess: enrCrs && enrCrs.userHasEarlyAccess,
			course_trailer: multimediaDetails[matchedCourse.course_trailer_id]
		};
		// return retCrs;
	} else {
		return {
			...matchedCourse,
			userHasEarlyAccess: enrCrs && enrCrs.userHasEarlyAccess,
			course_trailer: multimediaDetails[matchedCourse.course_trailer_id],
			lectures: matchedCourse.lectures.map(l => attachMultimedia({
				...l,
				supplementary_videos: l.supplementary_videos ? l.supplementary_videos.map(qa => attachMultimedia(qa, multimediaDetails)) : [],
			}, multimediaDetails)
			),
		};
	}
}

interface CourseStateSkeleton {
	courseDetails: {[key: string]: Course};
	courses: Course[];
	currentCourse: string;
	multimediaDetails: {[key: string]: MultimediaItem};
}

export function getCurrentCourse(courseState: CourseStateSkeleton) {
	const crs = courseState.courseDetails[courseState.currentCourse] ||
		courseState.courses.find(c => c.url_slug === courseState.currentCourse);

	return attachMultimedia(crs, courseState.multimediaDetails, 'course_trailer');
}

export function getCurrentLesson(coursesState) {
	const course = getCurrentCourse(coursesState);

	if (FINAL_QUIZ_LECTURE_ID === coursesState.currentLesson) return ({system_id: coursesState.currentLesson} as CourseLecture);

	return course && course.lectures.find(c => c.url_slug === coursesState.currentLesson) as CourseLecture;
}

export function getCurrentCourseContentByCourse(course, coursesState) {
	return course && coursesState.currentContentItem && course.lectures
		.filter(c => c)
		.find(c => c.system_id === coursesState.currentContentItem.system_id) as CourseContent;
}

export function getCurrentCourseContent(coursesState) {
	const course = getCurrentCourse(coursesState);
	return getCurrentCourseContentByCourse(course, coursesState);
}

export const selectCurrentCourse = createSelector(
	(state: AppState) => state.course,
	(state) => {
		return getCurrentCourse(state);
	}
);

export const selectCurrentStudyGroup = createSelector(
	(state: AppState) => state.course.currentCourse,
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.course.courses,
	(state: AppState) => state.enrollment,
	(state: AppState) => state.course.studyGroups,
	(state: AppState) => state.course.multimediaDetails,
	(currentCourse, courseDetails, courses, enrollment, studyGroups, multimedia) => {
		const c = getCurrentCourse({
			courseDetails,
			courses,
			currentCourse,
			multimediaDetails: {}
		});
		const enr = enrollment.enrolledCourses[c?.system_id];
		const studyGroup = enr && enr.studyGroupId && studyGroups[enr.studyGroupId];

		if (!studyGroup) return null;

		// attach multimedia
		return {
			...attachMultimedia(studyGroup, multimedia, 'intro_video'),
			sessions: studyGroup.sessions.map(s => {
				const newLects = s.optional_lectures.map(l => attachMultimedia(l, multimedia));
				return attachMultimedia({
					...s,
					optional_lectures: newLects
				}, multimedia, 'podcast');
			}),
		};
	}
);

export const selectCurrentLesson = createSelector(
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.course.courses,
	(state: AppState) => state.course.currentCourse,
	(state: AppState) => state.course.multimediaDetails,
	(state: AppState) => state.course.currentLesson,
	(courseDetails, courses, currentCourse, multimediaDetails, currentLesson) => {
		return getCurrentLesson({courseDetails, courses, currentCourse, multimediaDetails, currentLesson});
	}
);

export const selectCourseSlugsToCodeName = createSelector(
	(state: AppState) => state.course,
	course => course.courses.map(c => ({slug: c.url_slug, codename: c.system_codename}))
);

export const selectCurrentLessonId = createSelector(
	(state: AppState) => state.course,
	(state) => state.currentLesson
);

export const selectCurrentStateSystemIds  = createSelector(
	(state: AppState) => state.course,
	(state) => ({
		courseId: (getCurrentCourse(state) || {system_id: null}).system_id,
		lessonId: (getCurrentLesson(state) || {system_id: null}).system_id,
		contentId: (getCurrentCourseContent(state) || {system_id: null}).system_id
	})
);

export const getVideoLoc = (videoId: string) =>	createSelector(
	(state: AppState) => state.course.videoProgress[videoId],
	(progress) => progress
);


const matchesSubject = (compare: Course, sourceSubjects) => {
	return compare.course_subject
		.map(sub => sub.codename)
		.some(sub => (sourceSubjects ?? []).includes(sub));
};

export const getStudyGroupForCourseId = (courseId: string) => createSelector(
	(state: AppState) => state.course.activeStudyGroups,
	(state: AppState) => state.enrollment.enrolledCourses,
	(groups, enrollments) => {
		const studId = enrollments[courseId] && enrollments[courseId].studyGroupId;
		if (!studId || !groups.length) return null;

		return groups.find(g => g.system_id === studId);
	}
);

export const selectNextCoursesBySubject = requestedSubject => createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.course.currentCourse,
	(state: AppState) => state.course.coursesProgress,
	(state: AppState) => state.enrollment.enrolledCourses,
	(courses, courseDetails, currentCourseSlug, progress, enrolledCourses) => {
		const otherCourses = getUnenrolledCourses(courses, enrolledCourses, progress);

		const sameSubjects = otherCourses.filter(o => matchesSubject(o, requestedSubject));
		const differentSubject = otherCourses.filter(o => !matchesSubject(o, requestedSubject));

		const desiredSuggestions = 3;

		const selectedOptions = [];

		selectedOptions.push(...sameSubjects.slice(0, desiredSuggestions));
		if (selectedOptions.length < desiredSuggestions) {
			selectedOptions.push(...differentSubject.slice(0, desiredSuggestions - selectedOptions.length));
		}

		return selectedOptions;
	}
);

function getUnenrolledCourses(courses: Course[], enrolledCourses: { [p: string]: CourseEnrollment }, progress: CourseProgress[]) {
	const otherCourses = courses
		.filter(c => !enrolledCourses[c.system_id])
		.filter(c => !c.hide_from_catalog)
		.map(c => ({...c, progress: progress && progress.find(cp => cp.itemId === c.system_id)}));

	otherCourses.sort((a, b) => {
		return (b.publication_date?.getTime() ?? 0) - (a.publication_date?.getTime() ?? 0);
	});

	return otherCourses;
}

export const selectNextCourse = createSelector(
	(state: AppState) => state.course.courses,
	(state: AppState) => state.course.courseDetails,
	(state: AppState) => state.course.currentCourse,
	(state: AppState) => state.course.coursesProgress,
	(state: AppState) => state.course.multimediaDetails,
	(state: AppState) => state.enrollment.enrolledCourses,
	(courses, courseDetails, currentCourseSlug, progress, multimediaDetails, enrolledCourses) => {
		// (state: AppState) => state.course.coursesProgress,
		// (state: AppState) => state.enrollment.enrolledCourses,
		// (courses, coursesProgress, enrolledCourses) => {
		const otherCourses = getUnenrolledCourses(courses, enrolledCourses, progress);

		const currentCourse = getCurrentCourse({courses, courseDetails, currentCourse: currentCourseSlug, multimediaDetails});
		//console.log('got other courses', otherCourses.length, !!currentCourse);
		if (!currentCourse || !otherCourses || !otherCourses.length) {
			return [];
		}

		const selectedOptions = [];

		const currentSubjects = currentCourse.course_subject.map(s => s.codename);
		const sameSubjects = otherCourses.filter(o => matchesSubject(o, currentSubjects));
		const differentSubject = otherCourses.filter(o => !matchesSubject(o, currentSubjects));
		// console.log('got lengths', currentSubjects.length, sameSubjects.length, differentSubject.length);

		if (sameSubjects.length) {
			// console.log('pushed subject');
			selectedOptions.push(sameSubjects.splice(0, 1)[0]);
			// console.log(selectedOptions)
		}

		const desiredSuggestions = 3;

		selectedOptions.push(...differentSubject.slice(0, desiredSuggestions - selectedOptions.length));
		if (selectedOptions.length < desiredSuggestions) {
			selectedOptions.push(...sameSubjects.slice(0, desiredSuggestions - selectedOptions.length));
		}

		return selectedOptions;
	}
);

export const selectTestimonials = (numTestimonials) => createSelector(
	(state: AppState) => state.course.generalTestimonials,
	(state: AppState) => state.course.courseTestimonials,
	(state: AppState) => state.course.currentCourse,
	(testimonials, courseTestimonials, courseSlug)  => {
		const selectedCourseTestimonials = (courseTestimonials[courseSlug] ?? []);
		if (selectedCourseTestimonials.length >= numTestimonials) {
			return selectedCourseTestimonials.slice(0, numTestimonials);
		}
		return selectedCourseTestimonials.concat(...testimonials).slice(0, numTestimonials);
	}
);

export const selectMultimediaDetails = createSelector(
	(state: AppState) => state.course.multimediaDetails,
	(mmDetails) => {
		const arrOfmmDetails = Object.keys(mmDetails).map(k => mmDetails[k]);
		return arrOfmmDetails;
	});
