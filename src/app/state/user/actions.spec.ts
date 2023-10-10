import * as actions from './actions';
import {UserType} from '../../services/user.service';
import { getMockUser } from '../../../test.helpers';

describe('User actions', () => {
	it('should create userConfirmComplete action', () => {
		const options = {allowNavigate: true, email: ''};
		const action = actions.userConfirmComplete(options);
		expect(action.type).toEqual('[User] Confirm complete');
		expect(action.allowNavigate).toEqual(true);
		expect(action.email).toEqual('');
	});

	it('should create userLogInComplete action', () => {
		const options = {allowNavigate: true};
		const action = actions.userLogInComplete(options);
		expect(action.type).toEqual('[User] Sign In');
		expect(action.allowNavigate).toEqual(true);
	});

	it('should create userLoginError action', () => {
		const options = {message: 'Error'};
		const action = actions.userLoginError(options);
		expect(action.type).toEqual('[User] Login Error');
		expect(action.message).toEqual('Error');
	});

	it('should create userLogOutRequested action', () => {
		const action = actions.userLogOutRequested();
		expect(action.type).toEqual('[User] Sign Out Requested');
	});

	it('should create userLogOutCompleted action', () => {
		const action = actions.userLogOutCompleted();
		expect(action.type).toEqual('[User] Sign Out Complete');
	});

	it('should create userSessionRefreshed action', () => {
		const action = actions.userSessionRefreshed();
		expect(action.type).toEqual('[User] Session Refreshed');
	});

	it('should create userProfileUpdate action', () => {
		const options = {user: null};
		const action = actions.userProfileUpdate(options);
		expect(action.type).toEqual('[User] Profile Update');
		expect(action.user).toBeFalsy();
		const mockUser = getMockUser({id: 'face', userType: UserType.Email});
		const userAction = actions.userProfileUpdate({user: mockUser});
		expect(userAction.type).toEqual('[User] Profile Update');
		expect(userAction.user.id).toEqual('face');
		expect(userAction.user.userType).toEqual(UserType.Email);
	});

	it('should create userMergeModalAccountMadeChanges action', () => {
		const action = actions.userMergeModalAccountMadeChanges();
		expect(action.type).toEqual('[User] Merge Account Modal Made Changes');
	});

	it('should create userMergeModalAccountClosed action', () => {
		const action = actions.userMergeModalAccountClosed();
		expect(action.type).toEqual('[User] Merge Account Modal Closed');
	});

	it('should create userSetDetails action', () => {
		const mockUser = getMockUser({id: 'face'});
		const action = actions.userSetDetails({user: mockUser});
		expect(action.type).toEqual('[User] Set Details');
		expect(action.user).toEqual(mockUser);
	});

	it('should create userGetDetails action', () => {
		const action = actions.userGetDetails();
		expect(action.type).toEqual('[User] Get Details');
	});

	it('should create userSetPostLoginUrl action', () => {
		const options = {url: 'face'};
		const action = actions.userSetPostLoginUrl(options);
		expect(action.type).toEqual('[User] Set Post-Login Url');
		expect(action.url).toEqual('face');
	});

});

