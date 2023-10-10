import * as userReducer from './reducers';
import * as actions from './actions';
import {mockInitialState} from '../index';
import {UserType} from '../../services/user.service';


describe('User Reducer', () => {
	const { initialState } = userReducer;
	it('should return the initial state', () => {
		const action = {type: 'empty'};
		const state = userReducer.reducer(undefined, action);
		expect(state).toBe(initialState);
	});

	it('should actions.userLogOutCompleted', () => {
		const user = getUserStateWithValue({id: 'test', email: 'john@test.com'});
		const setAction = actions.userSetDetails({user: user.user.currentUser});
		const stateWithUser = userReducer.reducer(initialState, setAction);
		expect(stateWithUser.currentUser).toEqual(user.user.currentUser);

		const action = actions.userLogOutCompleted();
		const state = userReducer.reducer(initialState, action);
		expect(state.currentUser).toBeFalsy();
	});

	it('should actions.userSetDetails', () => {
		const user = getUserStateWithValue({id: 'test', email: 'john@test.com'});
		const action = actions.userSetDetails({user: user.user.currentUser});
		const state = userReducer.reducer(initialState, action);
		expect(state.currentUser).toEqual(user.user.currentUser);
	});

	it('should actions.userSetPostLoginUrl', () => {
		const user = getUserStateWithValue({id: 'test', email: 'john@test.com'});
		const action = actions.userSetDetails({user: user.user.currentUser});
		const state = userReducer.reducer(initialState, action);
		expect(state.currentUser).toEqual(user.user.currentUser);

		const nextAction = actions.userSetPostLoginUrl({url: 'http://online.hillsdale.edu'});
		const updatedState = userReducer.reducer(state, nextAction);
		expect(updatedState.pendingRedirectUrl).toEqual('http://online.hillsdale.edu');
	});

	it('should actions.userMergeModalAccountMadeChanges', () => {
		const user = getUserStateWithValue({id: 'test', email: 'john@test.com'});
		const action = actions.userSetDetails({user: user.user.currentUser});
		const state = userReducer.reducer(initialState, action);
		expect(state.currentUser).toEqual(user.user.currentUser);

		const nextAction = actions.userMergeModalAccountMadeChanges();
		const updatedState = userReducer.reducer(state, nextAction);
		expect(updatedState.madeAccountMergeChanges).toBeTruthy();
	});

	it('should actions.userLogOutRequested', () => {
		const user = getUserStateWithValue({id: 'test', email: 'john@test.com'});
		const action = actions.userSetDetails({user: user.user.currentUser});
		const state = userReducer.reducer(initialState, action);
		expect(state.currentUser).toEqual(user.user.currentUser);

		const nextAction = actions.userLogOutRequested();
		const updatedState = userReducer.reducer(state, nextAction);
		expect(updatedState.madeAccountMergeChanges).toBeFalsy();
	});
});

function getUserStateWithValue(user: object) {
	return {
		...mockInitialState,
		user: {
			...mockInitialState.user,
			currentUser: {
				id: 'testUser',
				email: '',
				username: '',
				firstname: '',
				lastname: '',
				address: '',
				city: '',
				state: '',
				zip: '',
				title: '',
				userType: UserType.Email,
				matchedAccounts: [],
				...user
			}
		},
		pendingRedirectUrl: '',
		isInLandingTestGroup: false,
		hasUtm: false,
		madeAccountMergeChanges: false
	};
}
