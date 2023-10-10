import {createAction, props} from '@ngrx/store';
import {Course, CourseContent, StudyGroup, Testimonial} from '../../services/course-data.service';
import {MultimediaItem} from 'hc-video-player';
import {CourseProgress} from '../../common/models';

export const courseListRequested = createAction('[Courses] Get List');
export const courseListReceived = createAction('[Courses] Set List', props<{courses: Course[]}>());
export const courseStubListReceived = createAction('[Courses] Set Stub List', props<{courses: Course[]}>());

export const setCurrentCourse = createAction('[Courses] Set Current', props<{currentCourse: string}>());
export const setCurrentLesson = createAction('[Courses] Set Current Lesson', props<{currentLesson: string}>());
export const setCurrentLessonItem = createAction('[Courses] Set Current Lesson Item', props<{itemType: string, item: CourseContent}>());
export const getCourseDetails = createAction('[Courses] Get Course Details', props<{courseCodename: string, courseSlug: string}>());
export const setCourseDetails = createAction('[Courses] Set Course Details', props<{course: Course}>());

export const getCoursesProgress = createAction('[Courses] Get Courses Progress');
export const courseOpened = createAction('[Courses] Course Was Opened', props<{courseId: string}>());
export const setCourseProgress = createAction('[Courses] Set Course Progress', props<{progress: CourseProgress}>());
export const setCoursesProgress = createAction('[Courses] Set Courses Progress', props<{progress: CourseProgress[]}>());
export const updateCourseContentProgress = createAction('[Courses] Update Lecture Progress', props<{
	courseSystemId: string, contentSystemId: string, progressPercentage: number, started: boolean, completedThreshold: number
}>());

export const getStudyGroups = createAction('[Study Group] Get Active Groups');
export const setStudyGroups = createAction('[Study Group] Set Active Groups', props<{studyGroups: StudyGroup[]}>());
export const getStudyGroup = createAction('[Study Groups] Get Study Group', props<{studyGroupID: string}>());
export const setStudyGroup = createAction('[Study Groups] Set Study Group', props<{studyGroup: StudyGroup}>());

export const getMultimedia = createAction('[Multimedia] Get Data');
export const setMultimedia = createAction('[Multimedia] Set Data', props<{multimedia: MultimediaItem[]}>());
export const setMultimediaItem = createAction('[Multimedia] Set Data Item', props<{multimedia: MultimediaItem}>());

export const landingPageLoaded = createAction('[Courses] Landing Page Loaded', props<{hasUtm: boolean, version?: string}>());

export const setVideoPlay = createAction('[Video] Play Pressed', props<{
	courseId: string, contentId: string, videoId: string, title: string
}>());
export const setVideoReachedEnd = createAction('[Video] End Reached', props<{
	courseId: string, contentId: string, videoId: string
}>());
export const setVideoCompleted = createAction('[Video] Completed', props<{
	courseId: string, contentId: string, videoId: string
}>());
export const setVideoProgress = createAction('[Video] Set Progress', props<VideoPostInfo>());
export const setVideoProgressForce = createAction('[Video] Set Progress (Force)', props<VideoPostInfo>());
export const setVideoProgressList = createAction('[Video] Set Progress List', props<{
	list: {videoId: string, progress: number, modifiedDate: Date}[]
}>());

export const setVideoLastPostTime = createAction('[Video] Set Last Post Time', props<{videoId: string, postTime: number}>());

export const videoPostFailed = createAction('[Video] Progress Post Failed', props<VideoPostInfo>());
export const videoPostSucceeded = createAction('[Video] Progress Post Succeeded', props<VideoPostInfo>());

export const trash = createAction('[Courses] Ignore Action');

export interface VideoPostInfo {
	userId: string;
	courseId: string;
	contentId: string; // lectureId
	videoId: string;
	progress: number; // video position in seconds
	eventTime: number; // epoch time
	lectureType: string;
}


export const setGeneralTestimonials = createAction('[Testimonials] Set General', props<{testimonials: Testimonial[]}>());
export const setCourseTestimonials = createAction('[Testimonials] Set Course', props<{courseSlug: string, testimonials: Testimonial[]}>());
