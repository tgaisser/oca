import * as actions from './actions';
import * as helpers from '../../../test.helpers';

describe('Course actions', () => {
	it('should create courseListRequested', () => {
		const action = actions.courseListRequested();
		expect(action.type).toEqual('[Courses] Get List');
	});

	it('should create courseListReceived', () => {
		const options = {courses: [
			helpers.getMockCourse({title: 'History 101'}),
			helpers.getMockCourse({title: 'Math'})
		]};
		const action = actions.courseListReceived(options);
		expect(action.type).toEqual('[Courses] Set List');
		expect(action.courses.length).toEqual(2);
	});

	it('should create courseStubListReceived', () => {
		const options = {courses: [
			helpers.getMockCourse({title: 'History 101'}),
			helpers.getMockCourse({title: 'Math'})
		]};
		const action = actions.courseStubListReceived(options);
		expect(action.type).toEqual('[Courses] Set Stub List');
		expect(action.courses.length).toEqual(2);
	});

	it('should create setCurrentCourse', () => {
		const options = {currentCourse: 'History'};
		const action = actions.setCurrentCourse(options);
		expect(action.type).toEqual('[Courses] Set Current');
		expect(action.currentCourse).toEqual('History');
	});

	it('should create setCurrentLesson', () => {
		const options = {currentLesson: 'History'};
		const action = actions.setCurrentLesson(options);
		expect(action.type).toEqual('[Courses] Set Current Lesson');
		expect(action.currentLesson).toEqual('History');
	});

	it('should create setCurrentLessonItem', () => {
		const options = {itemType: 'mock', item: helpers.getMockCourseContent({title: 'History'})};
		const action = actions.setCurrentLessonItem(options);
		expect(action.type).toEqual('[Courses] Set Current Lesson Item');
		expect(action.itemType).toEqual('mock');
		expect(action.item.title).toEqual('History');
	});

	it('should create getCourseDetails', () => {
		const options = {courseCodename: 'mock', courseSlug: 'test'};
		const action = actions.getCourseDetails(options);
		expect(action.type).toEqual('[Courses] Get Course Details');
		expect(action.courseCodename).toEqual('mock');
		expect(action.courseSlug).toEqual('test');
	});

	it('should create setCourseDetails', () => {
		const options = {course: helpers.getMockCourse({title: 'History'})};
		const action = actions.setCourseDetails(options);
		expect(action.type).toEqual('[Courses] Set Course Details');
		expect(action.course.title).toEqual('History');
	});

	it('should create getCoursesProgress', () => {
		const action = actions.getCoursesProgress();
		expect(action.type).toEqual('[Courses] Get Courses Progress');
	});

	it('should create setCourseProgress', () => {
		const options = {progress: helpers.getMockProgress({itemType: 'MockItem'})};
		const action = actions.setCourseProgress(options);
		expect(action.type).toEqual('[Courses] Set Course Progress');
		expect(action.progress.itemType).toEqual('MockItem');
	});

	it('should create setCoursesProgress', () => {
		const options = {progress: [
			helpers.getMockProgress({itemType: 'MockItem'}),
			helpers.getMockProgress({itemType: 'MockItem2'})
		]};
		const action = actions.setCoursesProgress(options);
		expect(action.type).toEqual('[Courses] Set Courses Progress');
		expect(action.progress[0].itemType).toEqual('MockItem');
		expect(action.progress[1].itemType).toEqual('MockItem2');
	});

	it('should create updateCourseContentProgress', () => {
		const options = {
			courseSystemId: 'mockId',
			contentSystemId: 'mockSystemId',
			progressPercentage: 50,
			started: true,
			completedThreshold: 25
		};
		const action = actions.updateCourseContentProgress(options);
		expect(action.type).toEqual('[Courses] Update Lecture Progress');
		expect(action.completedThreshold).toEqual(25);
		expect(action.contentSystemId).toEqual('mockSystemId');
	});

	it('should create getMultimedia', () => {
		const action = actions.getMultimedia();
		expect(action.type).toEqual('[Multimedia] Get Data');
	});

	it('should create setMultimedia', () => {
		const options = {multimedia: [
			helpers.getMockMultimediaItem({id: 'mockId'})
		]};
		const action = actions.setMultimedia(options);
		expect(action.type).toEqual('[Multimedia] Set Data');
		expect(action.multimedia[0].id).toEqual('mockId');
	});

	it('should create landingPageLoaded', () => {
		const options = {hasUtm: true};
		const action = actions.landingPageLoaded(options);
		expect(action.type).toEqual('[Courses] Landing Page Loaded');
		expect(action.hasUtm).toBeTruthy();
	});

	it('should create setVideoPlay', () => {
		const options = {courseId: 'mockId', contentId: 'mockContentId', videoId: 'mockVideoId', title: 't'};
		const action = actions.setVideoPlay(options);
		expect(action.type).toEqual('[Video] Play Pressed');
		expect(action.courseId).toEqual('mockId');
		expect(action.contentId).toEqual('mockContentId');
		expect(action.title).toEqual('t');
	});

	it('should create setVideoReachedEnd', () => {
		const options = {courseId: 'mockId', contentId: 'mockContentId', videoId: 'mockVideoId'};
		const action = actions.setVideoReachedEnd(options);
		expect(action.type).toEqual('[Video] End Reached');
		expect(action.courseId).toEqual('mockId');
		expect(action.contentId).toEqual('mockContentId');
	});

	it('should create setVideoCompleted', () => {
		const options = {courseId: 'mockId', contentId: 'mockContentId', videoId: 'mockVideoId'};
		const action = actions.setVideoCompleted(options);
		expect(action.type).toEqual('[Video] Completed');
		expect(action.courseId).toEqual('mockId');
		expect(action.contentId).toEqual('mockContentId');
	});

	it('should create setVideoProgress', () => {

		const options = {userId: 'Mock1', courseId: 'mockId', contentId: 'mockContentId', videoId: 'mockVideoId', progress: 75, eventTime: 25, lectureType: 'face'};
		const action = actions.setVideoProgress(options);
		expect(action.type).toEqual('[Video] Set Progress');
		expect(action.progress).toEqual(75);
	});

	it('should create setVideoProgressForce', () => {

		const options = {userId: 'Mock1', courseId: 'mockId', contentId: 'mockContentId', videoId: 'mockVideoId', progress: 75, eventTime: 25, lectureType: 'face'};
		const action = actions.setVideoProgressForce(options);
		expect(action.type).toEqual('[Video] Set Progress (Force)');
		expect(action.eventTime).toEqual(25);
	});

	it('should create setVideoProgressList', () => {
		const options = {list: [
			{videoId: 'mockVideoId', progress: 50, modifiedDate: new Date()},
			{videoId: 'mockVideoId2', progress: 75, modifiedDate: new Date()}
		]};
		const action = actions.setVideoProgressList(options);
		expect(action.type).toEqual('[Video] Set Progress List');
		expect(action.list[0].videoId).toEqual('mockVideoId');
		expect(action.list[1].progress).toEqual(75);
	});

	it('should create setVideoLastPostTime', () => {
		const options = {videoId: 'mockVideoId', postTime: 25};
		const action = actions.setVideoLastPostTime(options);
		expect(action.type).toEqual('[Video] Set Last Post Time');
		expect(action.videoId).toEqual('mockVideoId');
		expect(action.postTime).toEqual(25);
	});

	it('should create trash', () => {
		const action = actions.trash();
		expect(action.type).toEqual('[Courses] Ignore Action');
	});
});


