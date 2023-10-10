import * as actions from './actions';
import * as uiReducer from './reducer';

describe('UI reducer tests', () => {
	const { initialState } = uiReducer;
	it('should return the initial state', () => {
		const action = {type: 'empty'};
		const state = uiReducer.reducer(undefined, action);
		expect(state).toBe(initialState);
	});

	it('should actions.openSidebar', () => {
		const setAction = actions.openSidebar();
		const state = uiReducer.reducer(initialState, setAction);
		expect(state.sidebarOpen).toBeTruthy();
	});

	it('should actions.closeSidebar', () => {
		const setAction = actions.openSidebar();
		const state = uiReducer.reducer(initialState, setAction);
		expect(state.sidebarOpen).toBeTruthy();

		const nextAction = actions.closeSidebar();
		const nextState = uiReducer.reducer(state, nextAction);
		expect(nextState.sidebarOpen).toBeFalsy();
	});

	it('should actions.setIsDesktop', () => {
		const setAction = actions.setIsDesktop({isDesktop: true});
		const state = uiReducer.reducer(initialState, setAction);
		expect(state.isDesktop).toBeTruthy();

		const nextAction = actions.setIsDesktop({isDesktop: false});
		const nextState = uiReducer.reducer(state, nextAction);
		expect(nextState.isDesktop).toBeFalsy();
	});

	it('should actions.setHasSidebar', () => {
		const setAction = actions.setHasSidebar({hasSidebar: true});
		const state = uiReducer.reducer(initialState, setAction);
		expect(state.hasSidebar).toBeTruthy();

		const nextAction = actions.setHasSidebar({hasSidebar: false});
		const nextState = uiReducer.reducer(state, nextAction);
		expect(nextState.hasSidebar).toBeFalsy();
	});

	it('should actions.openModal', () => {
		const setAction = actions.openModal();
		const state = uiReducer.reducer(initialState, setAction);
		expect(state.modalIsOpen).toBeTruthy();
	});

	it('should actions.closeModal', () => {
		const setAction = actions.closeModal();
		const state = uiReducer.reducer(initialState, setAction);
		expect(state.modalIsOpen).toBeFalsy();
	});
});
