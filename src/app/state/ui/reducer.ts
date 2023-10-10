import {Action, createReducer, on} from '@ngrx/store';
import * as actions from './actions';
import {PageHome} from '../../services/course-data.service';

export interface State {
	sidebarOpen: boolean;
	isDesktop: boolean;
	hasSidebar: boolean;
	modalIsOpen: boolean;
	homepage: PageHome;
	headerVisible: boolean;
}
export const initialState: State = {
	sidebarOpen: true,
	isDesktop: false,
	hasSidebar: false,
	modalIsOpen: false,
	homepage: {} as PageHome,
	headerVisible: true,
};

export const uiReducer = createReducer(
	initialState,
	on(actions.openSidebar, (state) => ({...state, sidebarOpen: true})),
	on(actions.closeSidebar, (state) => ({...state, sidebarOpen: false})),
	on(actions.setIsDesktop, (state, action) => ({...state, isDesktop: action.isDesktop})),
	on(actions.setHasSidebar, (state, action) => ({...state, hasSidebar: action.hasSidebar})),
	on(actions.openModal, (state) => ({...state, modalIsOpen: true})),
	on(actions.closeModal, (state) => ({...state, modalIsOpen: false})),
	on(actions.setHomePage, (state, action) => ({...state, homepage: action.homepage})),
	on(actions.markHeaderVisibility, (state, action) => ({...state, headerVisible: action.isVisible}))
);

export function reducer(state: State|undefined, action: Action) {
	return uiReducer(state, action);
}
