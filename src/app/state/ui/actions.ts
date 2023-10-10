import {createAction, props} from '@ngrx/store';
import {PageHome} from '../../services/course-data.service';

export const loadSidebarStatus = createAction('[Sidebar] Load Sidebar Status');
export const openSidebar = createAction('[Sidebar] Open Sidebar');
export const closeSidebar = createAction('[Sidebar] Close Sidebar');
export const setIsDesktop = createAction('[Sidebar] Set Is Desktop', props<{isDesktop: boolean}>());
export const setHasSidebar = createAction('[Sidebar] Set Has Sidebar', props<{hasSidebar: boolean}>());

export const openModal = createAction('[Sidebar] Open Modal');
export const closeModal = createAction('[Sidebar] Close Modal');

export const donateClicked = createAction('[Donate] Donate Clicked', props<{donateUrl: string}>());
export const pdfClicked = createAction('[Reading] PDF Clicked', props<{pdfUrl: string, readingType: string}>());
export const audioDownloaded = createAction('[Audio] Lecture Downloaded', props<{url: string, courseId: string, lectureId: string}>());

export const getHomePage = createAction('[UI] Get Home Page');
export const setHomePage = createAction('[UI] Set Home Page', props<{homepage: PageHome}>());

export const markHeaderVisibility = createAction('[Header] Mark Header Open', props<{isVisible: boolean}>());
