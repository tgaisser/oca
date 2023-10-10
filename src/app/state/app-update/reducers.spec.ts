import * as appUpdateReducer from './reducers';
import * as actions from './actions';

describe('AppUpdate reducer', () => {
	const { initialState } = appUpdateReducer;
	it('should return the initial state', () => {
		const action = {type: 'empty'};
		const state = appUpdateReducer.reducer(undefined, action);
		expect(state).toBe(initialState);
	});

	it('should actions.userActivity', () => {
		const action = actions.userActivity({description: 'whatever'});
		const state = appUpdateReducer.reducer(initialState, action);
		expect(state.userInactive).toEqual(false);
	});

	it('should actions.userInactive', () => {
		let action = actions.userInactive({userInactive: true});
		let state = appUpdateReducer.reducer(initialState, action);
		expect(state.userInactive).toBe(true);

		action = actions.userInactive({userInactive: false});
		state = appUpdateReducer.reducer(initialState, action);
		expect(state.userInactive).toBe(false);
	});

	it('should actions.updateIsAvailable', () => {
		const action = actions.updateIsAvailable();
		const state = appUpdateReducer.reducer(initialState, action);
		expect(state.updateAvailabilityDate).toBeTruthy();
		expect(state.updateAvailabilityDate.getTime()).toBeCloseTo(Date.now(), -1);
	});
});
