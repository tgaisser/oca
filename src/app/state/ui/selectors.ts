import {createSelector} from '@ngrx/store';
import {State as AppState} from '../index';
import {PageHome} from '../../services/course-data.service';
import {attachMultimedia} from '../courses/selectors';

export const selectSidebarStatus = createSelector(
	(state: AppState) => state.ui,
	sidebar => ({hasSidebar: sidebar.hasSidebar, isOpen: sidebar.sidebarOpen, headerHidden: !sidebar.headerVisible})
);

export const selectHeaderStatus = createSelector(
	(state: AppState) => state.ui,
	ui => ({hide: !ui.headerVisible})
);

export const selectModalStatus = createSelector(
	(state: AppState) => state.ui,
	ui => ui.modalIsOpen
);

export const selectHomepage = createSelector(
	(state: AppState) => state.ui.homepage,
	(state: AppState) => state.course.multimediaDetails,
	(homepage, multimediaDetails) => {
		return {
			...homepage,
			featured_courses: (homepage.featured_courses || []).map(p => attachMultimedia(p, multimediaDetails, 'course_trailer')),
		} as PageHome;
	}
);
