import {Action, createReducer, on} from '@ngrx/store';
import * as actions from './actions';
import {Course, CourseContent, StudyGroup, Testimonial} from '../../services/course-data.service';
import {MultimediaItem} from 'hc-video-player';
import {CourseProgress} from '../../common/models';

// export const userFeatureKey = 'user';

export interface State {
	courses: Course[];
	courseDetails: {[key: string]: Course};
	coursesAreStubbed: boolean;
	currentCourse: string;
	currentLesson: string;
	currentContentItem: CourseContent;
	currentContentType: string;
	coursesProgress: CourseProgress[];
	coursesProgressTimestamp: number;
	videoProgress: {[key: string]: {position: number, modifiedDate: Date}}; //videoId -> current timestamp
	videoPostTimes: {[key: string]: number}; //videoId -> postTime
	multimediaDetails: {[key: string]: MultimediaItem};
	studyGroups: {[key: string]: StudyGroup};
	activeStudyGroups: StudyGroup[];
	activeStudyGroupsLoaded: boolean;
	generalTestimonials: Testimonial[];
	courseTestimonials: {[key: string]: Testimonial[]};
}

export const initialState: State = {
	courses: [],
	courseDetails: {},
	coursesAreStubbed: true,
	currentCourse: null,
	currentLesson: null,
	currentContentItem: null,
	currentContentType: null,
	coursesProgress: [],
	coursesProgressTimestamp: 0,
	videoProgress: {},
	videoPostTimes: {},
	multimediaDetails: {},
	studyGroups: {},
	activeStudyGroups: [],
	activeStudyGroupsLoaded: false,
	generalTestimonials: [],
	courseTestimonials: {}
};

const courseReducer = createReducer(
	initialState,
	// on(courseActions.courseListRequested, state => ({...state, courseList: []})),
	on(actions.courseListReceived, (state, action) => ({...state, coursesAreStubbed: false, courses: action.courses})),
	on(actions.courseStubListReceived, (state, action) => {
		if (!state.courses.length || state.coursesAreStubbed) return {...state, coursesAreStubbed: true, courses: action.courses};
		return state;
	}),
	on(actions.setCourseDetails, (state, action) => {
		//return the state with the new course info
		return {
			...state,
			courseDetails: {
				...state.courseDetails,
				[action.course.url_slug]: action.course
			},
		};
	}),
	on(actions.setStudyGroup, (state, action) => {
		//return the state with the new course info
		return {
			...state,
			studyGroups: {
				...state.studyGroups,
				[action.studyGroup.system_id]: action.studyGroup
			},
		};
	}),
	on(actions.setStudyGroups, (state, action) => ({
		...state,
		activeStudyGroups: action.studyGroups,
		studyGroups: {
			...state.studyGroups,
			...(action.studyGroups.reduce((agg, cur) => ({...agg, [cur.system_id]: cur}), {})),
		},
		activeStudyGroupsLoaded: true,
	})),
	on(actions.setCurrentCourse, (state, action) => ({...state, currentCourse: action.currentCourse})),
	on(actions.setCurrentLesson, (state, action) => ({...state, currentLesson: action.currentLesson})),
	on(actions.setCurrentLessonItem, (state, action) => ({
		...state,
		currentContentItem: action.item,
		currentContentType: action.itemType
	})),

	on(actions.setCoursesProgress, (state, action) => ({
		...state,
		coursesProgress: action.progress,
		coursesProgressTimestamp: Date.now(),
	})),
	on(actions.setCourseProgress, (state, action) => ({
		...state,
		coursesProgress: state.coursesProgress
			.filter(i => i.itemId !== action.progress.itemId)
			.concat(action.progress),
		videoProgress: {
			...state.videoProgress,
			...(action.progress.videoStatuses || [])
				.reduce((agg, cur) => ({...agg, [cur.videoId]: {position: cur.position, modifiedDate: cur.modifiedDate}}), {})
		}
	})),

	on(actions.setVideoLastPostTime, (state, action) => ({
		...state,
		videoPostTimes: {
			...state.videoPostTimes,
			[action.videoId]: action.postTime,
		}
	})),
	on(actions.setVideoProgress,
		actions.setVideoProgressForce,
		(state, action) => ({
			...state,
			videoProgress: {
				...state.videoProgress,
				[action.videoId]: {position: action.progress, modifiedDate: new Date()}
			},
		})),
	on(actions.setVideoProgressList, (state, action) => ({
		...state,
		videoProgress: action.list.reduce((agg, cur) => ({...agg, [cur.videoId]: {position: cur.progress, modifiedDate: cur.modifiedDate}}), {}),
	})),

	on(actions.updateCourseContentProgress, (state, action) => {
		// find the courseProgress object of courseId (action.courseSystemId)
		const courseProgress = state.coursesProgress.find(i => i.itemId === action.courseSystemId);
		// find the nested progressItem whose progress is going to be evaluated (refers to quiz or lecture video)
		const progressItem = ((courseProgress && courseProgress.children) || []).find(i => i.itemId === action.contentSystemId);
		if (courseProgress && progressItem) {

			//Don't allow progress to go backwards
			const newItemProgress = Math.max(action.progressPercentage, progressItem.progressPercentage);

			//determine new list of children for progress calculate new progress
			const newCourseChildren = courseProgress.children.filter(i => i.itemId !== action.contentSystemId).concat({
				...progressItem,
				progressPercentage: newItemProgress,
				completed: newItemProgress >= action.completedThreshold,
				started: action.started,
			});

			// calculate complete status of courseProgress (add sum of children completions determine if they're all complete)
			let newCrsProg = newCourseChildren.map(i => {
				if (i.itemType === 'quiz') {
					return i.completed ? 1 : 0; //Count quizzes as only 0 (failing) or 1 (passing)
				} else {
					return i.completed ? 1 : i.progressPercentage;
				}
			}).reduce((agg, cur) => agg + cur, 0) / newCourseChildren.length;
			if (newCrsProg >= .99) newCrsProg = 1;

			return {
				...state,
				coursesProgress: state.coursesProgress.filter(i => i.itemId !== action.courseSystemId).concat({
					...courseProgress,
					progressPercentage: newCrsProg, //update Course Progress
					lastActivityDate: new Date().toISOString(),
					completed: newCrsProg === 1,
					children: newCourseChildren
				})
			};
		}

		return state;
	}),

	on(actions.setMultimedia, (state, action) => ({
		...state,
		// could be replaced with Object.fromEntries, but that is not yet _fully_ supported
		// (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries#Browser_compatibility)
		multimediaDetails: action.multimedia.reduce((agg, cur) => {
			agg[cur.id] = cur;
			return agg;
		}, {}),
	})),
	on(actions.setMultimediaItem, (state, action) => ({
		...state,
		multimediaDetails: {
			...state.multimediaDetails,
			[action.multimedia.id]: action.multimedia,
		}
	})),
	on(actions.setGeneralTestimonials, (state, action) => ({
		...state,
		generalTestimonials: action.testimonials.filter(testimonial => 
			testimonial.title && 
			testimonial.user_name && 
			testimonial.user_location && 
			testimonial.message
		),
	})),
	on(actions.setCourseTestimonials, (state, action) => ({
		...state,
		courseTestimonials: {
			...state.courseTestimonials,
			[action.courseSlug]: action.testimonials.filter(testimonial => 
				testimonial.title && 
				testimonial.user_name && 
				testimonial.user_location && 
				testimonial.message
			)
		}
	})),	
);

export function reducer(state: State|undefined, action: Action) {
	return courseReducer(state, action);
}
