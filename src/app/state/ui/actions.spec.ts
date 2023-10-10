import * as actions from './actions';

describe('UI Actions', () => {
	it('should create loadSidebarStatus action', () => {
		const action = actions.loadSidebarStatus();
		expect(action.type).toEqual('[Sidebar] Load Sidebar Status');
	});

	it('should create openSidebar action', () => {
		const action =  actions.openSidebar();
		expect(action.type).toEqual('[Sidebar] Open Sidebar');
	});

	it('should create closeSidebar action', () => {
		const action =  actions.closeSidebar();
		expect(action.type).toEqual('[Sidebar] Close Sidebar');
	});

	it('should create setIsDesktop action', () => {
		const options = {isDesktop: true};
		const action =  actions.setIsDesktop(options);
		expect(action.type).toEqual('[Sidebar] Set Is Desktop');
		expect(action.isDesktop).toBeTruthy();
	});

	it('should create setHasSidebar action', () => {
		const options = {hasSidebar: true};
		const action =  actions.setHasSidebar(options);
		expect(action.type).toEqual('[Sidebar] Set Has Sidebar');
		expect(action.hasSidebar).toBeTruthy();
	});

	it('should create openModal action', () => {
		const action =  actions.openModal();
		expect(action.type).toEqual('[Sidebar] Open Modal');
	});

	it('should create closeModal action', () => {
		const action =  actions.closeModal();
		expect(action.type).toEqual('[Sidebar] Close Modal');
	});

	it('should create donateClicked action', () => {
		const options = {donateUrl: 'mockUrl'};
		const action =  actions.donateClicked(options);
		expect(action.type).toEqual('[Donate] Donate Clicked');
		expect(action.donateUrl).toEqual('mockUrl');
	});

	it('should create pdfClicked action', () => {
		const options = {pdfUrl: 'mockUrl', readingType: 'mockReadingType'};
		const action = actions. pdfClicked(options);
		expect(action.type).toEqual('[Reading] PDF Clicked');
		expect(action.pdfUrl).toEqual('mockUrl');
		expect(action.readingType).toEqual('mockReadingType');
	});

	it('should create audioDownloaded action', () => {
		const options = {url: 'mockUrl', courseId: 'mockCourseId', lectureId: 'mockLectureId'};
		const action =  actions.audioDownloaded(options);
		expect(action.type).toEqual('[Audio] Lecture Downloaded');
		expect(action.url).toEqual('mockUrl');
		expect(action.courseId).toEqual('mockCourseId');
		expect(action.lectureId).toEqual('mockLectureId');
	});
});
