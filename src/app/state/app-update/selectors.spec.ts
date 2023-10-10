import * as selectors from './selectors';
import {mockInitialState} from '../index';
import {addMinutes} from '../../common/helpers';

const N_MINUTES_AGO =  (minutes) => addMinutes(new Date(Date.now()), -1 * minutes);

describe('AppUpdate selectors', () => {
	it('should return false from initial state', () => {
		expect(selectors.selectDoUpdate(mockInitialState)).toEqual(false);
	});

	it('should selectDoUpdate', () => {
		const mockState = getMockState(true, N_MINUTES_AGO(10), false, null);
		expect(selectors.selectDoUpdate(mockState)).toBe(true);
	});

	it('should selectDoUpdate - no update available', () => {
		const mockState = getMockState(true, null, false, null);
		expect(selectors.selectDoUpdate(mockState)).toBe(false);
	});

	it('should selectDoUpdate - user taking quiz', () => {
		const mockState = getMockState(true, N_MINUTES_AGO(10), false, 'quiz');
		expect(selectors.selectDoUpdate(mockState)).toBe(false);
	});

	it('should selectDoUpdate - emergency update', () => {
		const mockState = getMockState(false, N_MINUTES_AGO(1000), true, 'quiz');
		expect(selectors.selectDoUpdate(mockState)).toBe(true);
	});

	it('should selectDoUpdate - emergency update 2', () => {
		const mockState = getMockState(true, null, true, 'quiz');
		expect(selectors.selectDoUpdate(mockState)).toBe(false);
	});

});

function getMockState(userInactive: boolean, updateAvailabilityDate: Date, isEmergencyUpdate: boolean, currentContentType: string) {
	return {
		...mockInitialState,
		course: {
			...mockInitialState.course,
			currentContentType
		},
		appUpdate: {
			...mockInitialState.appUpdate,
			userInactive,
			updateAvailabilityDate,
			isEmergencyUpdate,
		},
	};
}

