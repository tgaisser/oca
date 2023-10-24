import * as courseReducer from './reducers';
import * as actions from './actions';
import * as helpers from '../../../test.helpers';
import { fixtureState } from '../fixtures/state.fixture';

describe('Course reducer', () => {
	const { initialState } = courseReducer;
	it('should return the initial state', () => {
		const action = {type: 'empty'};
		const state = courseReducer.reducer(undefined, action);
		expect(state).toBe(initialState);
	});

	it('should actions.courseListReceived', () => {
		const courses = helpers.getMockCourses();
		const action = actions.courseListReceived({courses});
		const state = courseReducer.reducer(initialState, action);
		expect(state.coursesAreStubbed).toBeFalsy();
		expect(state.courses).toEqual(courses);
	});

	it('should actions.courseStubListReceived', () => {
		const courses = helpers.getMockCourses();
		const action = actions.courseStubListReceived({courses});
		const state = courseReducer.reducer(initialState, action);
		expect(state.coursesAreStubbed).toBeTruthy();
		expect(state.courses).toEqual(courses);
	});

	it('should actions.setCourseDetails', () => {
		const course = helpers.getMockCourse({title: 'History'});
		const action = actions.setCourseDetails({course});
		const state = courseReducer.reducer(initialState, action);
		expect(state.courseDetails[course.url_slug]).toEqual(course);
	});

	it('should actions.setStudyGroup', () => {
		const studyGroup = helpers.getMockStudyGroup({system_id: 'studyGroup1'});
		const action = actions.setStudyGroup({studyGroup});
		const state = courseReducer.reducer(initialState, action);
		expect(state.studyGroups['studyGroup1']).toEqual(studyGroup);
	});

	it('should actions.setStudyGroups', () => {
		const studyGroup1 = helpers.getMockStudyGroup({system_id: 'studyGroup1'});
		const studyGroup2 = helpers.getMockStudyGroup({system_id: 'studyGroup2'});
		const studyGroups = [
			studyGroup1,
			studyGroup2
		];
		const studyGroupAsState = {
			studyGroup1,
			studyGroup2
		};
		const action = actions.setStudyGroups({studyGroups});
		const state = courseReducer.reducer(initialState, action);
		expect(state.studyGroups).toEqual(studyGroupAsState);
	});

	it('should actions.setCurrentCourse', () => {
		const course = 'History';
		const action = actions.setCurrentCourse({currentCourse: course});
		const state = courseReducer.reducer(initialState, action);
		expect(state.currentCourse).toEqual(course);
	});

	it('should actions.setCurrentLesson', () => {
		const lesson = 'History';
		const action = actions.setCurrentLesson({currentLesson: lesson});
		const state = courseReducer.reducer(initialState, action);
		expect(state.currentLesson).toEqual(lesson);
	});

	it('should actions.setCurrentLessonItem', () => {
		const mockItem = helpers.getMockCourseContent({title: 'History'});
		const mockItemType = 'Mock';
		const action = actions.setCurrentLessonItem({item: mockItem, itemType: mockItemType});
		const state = courseReducer.reducer(initialState, action);
		expect(state.currentContentItem).toEqual(mockItem);
		expect(state.currentContentType).toEqual(mockItemType);
	});

	it('should actions.setCoursesProgress', () => {
		const mockProgress = [
			helpers.getMockProgress({itemId: 'Mock1', progressPercentage: 30}),
			helpers.getMockProgress({itemId: 'Mock2', progressPercentage: 65})
		];
		const checkDate = new Date();
		checkDate.setSeconds(-10);
		const action = actions.setCoursesProgress({progress: mockProgress});
		const state = courseReducer.reducer(initialState, action);
		expect(state.coursesProgress).toEqual(mockProgress);
		expect(state.coursesProgressTimestamp).toBeGreaterThan(checkDate.getTime());
	});

	it('should actions.setCourseProgress', () => {
		const mockProgress = helpers.getMockProgress({itemId: 'Mock1', progressPercentage: 30});
		const mockProgress2 = helpers.getMockProgress({itemId: 'Mock2', progressPercentage: 100});
		const mockProgress1Replace = helpers.getMockProgress({itemId: 'Mock1', progressPercentage: 0});
		const firstAction = actions.setCourseProgress({progress: mockProgress});
		const firstState = courseReducer.reducer(initialState, firstAction);
		expect(firstState.coursesProgress).toEqual([mockProgress]);

		const replaceAction = actions.setCourseProgress({progress: mockProgress1Replace});
		const replaceState = courseReducer.reducer(firstState, replaceAction);
		expect(replaceState.coursesProgress).toEqual([mockProgress1Replace]);

		const nextAction = actions.setCourseProgress({progress: mockProgress2});
		const nextState = courseReducer.reducer(firstState, nextAction);
		expect(nextState.coursesProgress.length).toEqual(2);
		expect(nextState.coursesProgress).toEqual([mockProgress, mockProgress2]);
	});

	it('should actions.setVideoLastPostTime', () => {
		const action = actions.setVideoLastPostTime({videoId: '1', postTime: 50});
		const state = courseReducer.reducer(initialState, action);
		expect(state.videoPostTimes).toEqual({[1]: 50});
	});

	it('should actions.setVideoProgress', () => {
		const videoProgress = {userId: 'Mock2', courseId: 'Mock1', contentId: '', videoId: '1', progress: 50, eventTime: 200, lectureType: 'test'};
		const action = actions.setVideoProgress(videoProgress);
		const state = courseReducer.reducer(initialState, action);
		expect(state.videoProgress).toEqual({1: {position: 50, modifiedDate: expect.any(Date)}});
	});

	it('should actions.setVideoProgressList', () => {
		const videoProgress = {userId: 'Mock2', courseId: 'Mock1', contentId: '', videoId: '1', progress: 50, eventTime: 200, lectureType: 'test'};
		const firstAction = actions.setVideoProgress(videoProgress);
		const firstState = courseReducer.reducer(initialState, firstAction);
		expect(firstState.videoProgress).toEqual({1: {position: 50, modifiedDate: expect.any(Date)}});
		const videoProgressList = [{videoId: '1', progress: 75, modifiedDate: new Date()}];
		const nextAction = actions.setVideoProgressList({list: videoProgressList});
		const nextState = courseReducer.reducer(initialState, nextAction);
		expect(nextState.videoProgress).toEqual({1: {position: 75, modifiedDate: expect.any(Date)}});
	});

	it('should actions.updateCourseContentProgress -- lecture', () => {
		const resultPercentage = .5;
		const action = actions.updateCourseContentProgress({
			courseSystemId: 'course1', contentSystemId: 'videoLesson1', progressPercentage: resultPercentage, started: false, completedThreshold: 95
		});
		const state = courseReducer.reducer(fixtureState.course, action);
		expect(state.coursesProgress).toBeTruthy();
		
		const course1 = state.coursesProgress?.find(i => i.itemId === 'course1');
		expect(course1?.children).toBeTruthy();
		
		const videoLesson1 = course1?.children?.find(i => i.itemId === 'videoLesson1');
		expect(videoLesson1?.progressPercentage).toEqual(resultPercentage);
	});

	it('should actions.updateCourseContentProgress -- quiz', () => {
		const resultPercentage = .5;
		const action = actions.updateCourseContentProgress({
			courseSystemId: 'course1', contentSystemId: 'mockQuizId', progressPercentage: resultPercentage, started: false, completedThreshold: 95
		});
		const state = courseReducer.reducer(fixtureState.course, action);
		expect(state.coursesProgress).toBeTruthy();
		
		const course1 = state.coursesProgress?.find(i => i.itemId === 'course1');
		expect(course1?.children).toBeTruthy();
		
		const mockQuizId = course1?.children?.find(i => i.itemId === 'mockQuizId');
		expect(mockQuizId?.progressPercentage).toEqual(resultPercentage);
	});

	it('should actions.setGeneralTestimonials return reduced result record', () => {
		const action = actions.setGeneralTestimonials({
		  testimonials: helpers.getMockTestimonials()
		});
		const state = courseReducer.reducer(initialState, action);
		expect(state.generalTestimonials).toEqual(
		  expect.arrayContaining([
			expect.objectContaining({
			  title: 'mockTitle',
			  user_name: 'mockUser_name',
			  user_location: 'mockUser_location',
			  message: 'mockTestimonialMessage',
			  referenced_course_id: ''
			}),
		  ])
		);
	});
	  
	it('should actions.setGeneralTestimonials exclude empty user_name', () => {
		const action = actions.setGeneralTestimonials({
			testimonials: [helpers.getMockTestimonial({user_name: ''})]
		});
		const state = courseReducer.reducer(initialState, action);
		expect(state.generalTestimonials).toEqual([]);
	});
	
	it('should actions.setCourseTestimonials exclude testimonials with empty user_name', () => {
		const courseSlug = 'test-course';
		const testimonials = [helpers.getMockTestimonial({user_name: ''})];
		const action = actions.setCourseTestimonials({ courseSlug, testimonials });
		const state = courseReducer.reducer(initialState, action);
		
		expect(state.courseTestimonials[courseSlug]).toEqual([]);
	});
	
	it('should actions.setMultimedia', () => {
		const mockItem1 = helpers.getMockMultimediaItem({id: 'mock1', duration: 100});
		const mockItem2 = helpers.getMockMultimediaItem({id: 'mock2', duration: 100});
		const action = actions.setMultimedia({multimedia: [mockItem1, mockItem2]});
		const state = courseReducer.reducer(initialState, action);
		expect(state.multimediaDetails).toBeTruthy();
		//TODO: add a more specific test eval
		//expect(state.multimediaDetails).toEqual(["mock1": mockItem1, "mock2": mockItem2]);
	});
});
