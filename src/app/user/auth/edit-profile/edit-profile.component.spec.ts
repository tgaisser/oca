import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {EditProfileComponent} from './edit-profile.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {CustomMocksModule, MockBrowserAbstractionModule} from '../../../../test.helpers';
import {NgxMaskModule} from 'ngx-mask';
import {RouterTestingModule} from '@angular/router/testing';
import {ToastrModule} from 'ngx-toastr';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { Auth } from 'aws-amplify';
import { userProfileUpdate } from 'src/app/state/user/actions';

describe('auth/EditProfileComponent', () => {
	let component: EditProfileComponent;
	let fixture: ComponentFixture<EditProfileComponent>;
	let loadUserMock;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [EditProfileComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				CustomMocksModule,
				NgxMaskModule.forRoot(),
				RouterTestingModule.withRoutes([]),
				ToastrModule.forRoot(),
				MockBrowserAbstractionModule,
				HttpClientTestingModule
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditProfileComponent);
		component = fixture.componentInstance;
		loadUserMock = jest.spyOn(component, 'loadUserProfile').mockImplementationOnce(() => Promise.resolve());

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should loadUserProfile', waitForAsync(() => {

		loadUserMock.mockClear();

		const data = {
			attributes: {
				email: 'mockValue',
				'custom:title': 'mockTitle',
				given_name: 'mockFirstName',
				family_name: 'mockLastName',
				phone_number: 'mockNumber',
				'custom:address_line1': 'mockAddress',
				'custom:address_line2': 'mockAddress2',
				'custom:address_city': 'mockCity',
				'custom:address_state': 'mockState',
				'custom:address_postal_code': 'mockPostal'
			}
		};

		const expectedData = {
			email: 'mockValue',
			title: 'mockTitle',
			fname: 'mockFirstName',
			lname: 'mockLastName',
			phone: 'mockNumber',
			address_line1: 'mockAddress',
			address_line2: 'mockAddress2',
			address_city: 'mockCity',
			address_state: 'mockState',
			address_postal_code: 'mockPostal'
		};

		const userInfoSpy = jest.spyOn(Auth, 'currentUserInfo').mockResolvedValue(data);
		const userSpy = jest.spyOn(Auth, 'currentAuthenticatedUser').mockResolvedValue('mockUser');

		const func = component.loadUserProfile().then(() => {
			expect(userInfoSpy).toBeCalled();
			expect(userSpy).toBeCalled();
			expect(component.savedProfile).toEqual(expectedData);
		});

	}));


	it('should editProfile', waitForAsync(() => {
		loadUserMock.mockClear();

		const data = {
			attributes: {
				email: 'mockValue',
				'custom:title': 'mockTitle',
				given_name: 'mockFirstName',
				family_name: 'mockLastName',
				phone_number: 'mockNumber',
				'custom:address_line1': 'mockAddress',
				'custom:address_line2': 'mockAddress2',
				'custom:address_city': 'mockCity',
				'custom:address_state': 'mockState',
				'custom:address_postal_code': 'mockPostal'
			}
		};

		const newData = {
			email: 'new_mockValue',
			title: 'new_mockTitle',
			fname: 'new_mockFirstName',
			lname: 'new_mockLastName',
			phone: 'new_mockNumber',
			address_line1: 'new_mockAddress',
			address_line2: 'new_mockAddress2',
			address_city: 'new_mockCity',
			address_state: 'new_mockState',
			address_postal_code: 'new_mockPostal'
		};

		const userInfoSpy = jest.spyOn(Auth, 'updateUserAttributes').mockResolvedValue('mockData');
		component.profileForm.patchValue(newData);

		const promise = component.editProfile().then(() => {
			expect(userInfoSpy).toBeCalled();
			expect(component.savedProfile).toEqual(newData);
		});

	}));

});
