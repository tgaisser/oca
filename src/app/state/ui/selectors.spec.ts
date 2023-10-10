import {mockInitialState} from '../index';
import * as selectors from './selectors';

describe('UI selectors', () => {
	it('should return ALL selectors as truthy/falsy from initial state', () => {
		expect(selectors.selectModalStatus(mockInitialState)).toBeFalsy();
		expect(selectors.selectSidebarStatus(mockInitialState).hasSidebar).toBeFalsy();
		expect(selectors.selectSidebarStatus(mockInitialState).isOpen).toBeTruthy();
	});

	it('should selectModalStatus', () => {
		const mockState = getUiStateWithValue({
			sidebarOpen: false,
			isDesktop: false,
			hasSidebar: false,
			modalIsOpen: true
		});
		expect(selectors.selectModalStatus(mockState)).toBeTruthy();
	});

	it('should selectSidebarStatus', () => {
		const mockState = getUiStateWithValue({
			sidebarOpen: false,
			isDesktop: false,
			hasSidebar: false,
			modalIsOpen: true
		});
		expect(selectors.selectSidebarStatus(mockState).isOpen).toBeFalsy();
		expect(selectors.selectSidebarStatus(mockState).hasSidebar).toBeFalsy();
	});
});

function getUiStateWithValue(value: object) {
	return {
		...mockInitialState,
		ui: {
			...mockInitialState.ui,
			...value
		}
	};
}
