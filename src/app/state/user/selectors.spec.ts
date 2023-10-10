import {mockInitialState} from '../index';
import {selectCurrentUser, selectCurrentUserMediaPreference} from './selectors';
import {UserType} from '../../services/user.service';

describe('User selectors', () => {
	it('should selectCurrentUser as null from initial state', () => {
		expect(selectCurrentUser(mockInitialState)).toBeFalsy();
	});

	it('should selectCurrentUser id', () => {
		const stateWithUser = getUserStateWithValue({
			id: 'testUser'
		});
		expect(selectCurrentUser(stateWithUser)).toEqual({
			id: 'testUser',
			email: expect.any(String),
			username: expect.any(String),
			firstname: expect.any(String),
			lastname: expect.any(String),
			address: expect.any(String),
			city: expect.any(String),
			state: expect.any(String),
			zip: expect.any(String),
			title: expect.any(String),
			userType: UserType.Email,
			matchedAccounts: [],
		});
	});

	it('should selectCurrentUser username and email', () => {
		const stateWithUser = getUserStateWithValue({
			username: 'John',
			email: 'john@test.com'
		});
		expect(selectCurrentUser(stateWithUser)).toEqual({
			id: expect.any(String),
			email: 'john@test.com',
			username: 'John',
			firstname: expect.any(String),
			lastname: expect.any(String),
			address: expect.any(String),
			city: expect.any(String),
			state: expect.any(String),
			zip: expect.any(String),
			title: expect.any(String),
			userType: UserType.Email,
			matchedAccounts: [],
		});
	});

	it('selectCurrentUserMediaPreference should get media preference', () => {
		const user = {
			username: 'John',
			email: 'john@test.com',
			preferences: null,
		};
		expect(selectCurrentUserMediaPreference.projector(user)).toBe('video');
		// selectCurrentUserMediaPreference.projector.
	});
	it('selectCurrentUserMediaPreference should get media preference (2)', () => {
		expect(selectCurrentUserMediaPreference.projector({
			preferences: {preferAudioLectures: true, storeAudioOffline: false, progressReportFrequency: 'Monthly'}
		})).toBe('audio');
	});
	it('selectCurrentUserMediaPreference should get media preference (3)', () => {
		expect(selectCurrentUserMediaPreference.projector({
			preferences: {preferAudioLectures: false, storeAudioOffline: false, progressReportFrequency: 'Monthly'}
		})).toBe('video');
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
		}
	};
}
