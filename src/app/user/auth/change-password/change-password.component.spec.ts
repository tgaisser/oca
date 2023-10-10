import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';

import {ChangePasswordComponent} from './change-password.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {Component, Input} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {UserDataService} from '../../../services/user-data.service';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../../state';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {of, throwError} from 'rxjs';
import {UserService} from '../../../services/user.service';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';

@Component({
	selector: 'app-password-validate-list',
	template: ''
})
class MockPasswordValidateListComponent {
	@Input() passwordInput: any;
}

describe('ChangePasswordComponent', () => {
	let component: ChangePasswordComponent;
	let fixture: ComponentFixture<ChangePasswordComponent>;
	let userService;
	let toastr: ToastrService;

	beforeEach(waitForAsync(() => {
		//userService = createSpyObj('UserDataService', ['getIdentityProviders']);
		TestBed.configureTestingModule({
			declarations: [ChangePasswordComponent, MockPasswordValidateListComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				HttpClientModule,
				RouterTestingModule.withRoutes([]),
				FontAwesomeTestingModule
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: UserDataService},
				{
					provide: UserService, useValue: {
						getIdentityProviders: jest.fn(() => of(['mockIdentity'])),
						changePassword: jest.fn(() => of(true)),
						isPasswordUser: jest.fn(() => of(true))
					}
				},
				{
					provide: ToastrService, useValue: {
						info: jest.fn(),
						success: jest.fn(),
						error: jest.fn()
					}
				},
			]
		})
			.compileComponents().then();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ChangePasswordComponent);
		component = fixture.componentInstance;

		//TODO
		jest.spyOn(component, 'ngOnInit').mockImplementation(() => {
		});
		toastr = TestBed.inject(ToastrService);
		userService = TestBed.inject(UserService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should ngOnInit', () => {
		expect(component.changeCompleted).toBeFalsy();
	});

	it('should changePassword', waitForAsync(() => {
		component.changePassForm.controls.newPassword.setValue('New45678');
		component.changePassForm.controls.oldPassword.setValue('Old45678');
		fixture.detectChanges();
		component.changePassword();
		expect(toastr.success).toHaveBeenCalledWith('Password changed');
		expect(component.changeCompleted).toBeTruthy();
	}));

	it('should notify same password on call to changePassword', () => {
		component.changePassForm.controls.newPassword.setValue('Old45678');
		component.changePassForm.controls.oldPassword.setValue('Old45678');
		fixture.detectChanges();
		component.changePassword();
		expect(toastr.info).toHaveBeenCalledWith('New password must not be the same as current password');
		expect(component.changeCompleted).toBeFalsy();
	});

	it('should notify error on call to changePassword', () => {
		component.changePassForm.controls.newPassword.setValue('Old45678');
		component.changePassForm.controls.oldPassword.setValue('Old45678');

		userService.changePassword = jest.fn().mockImplementationOnce(() => {
			console.log('should throw error');
			return throwError('mockError');
		});
		fixture.detectChanges();
		component.changePassword();
		expect(component.changeCompleted).toBeFalsy();
		//expect(toastr.error).toHaveBeenCalledWith('Unable to change password. mockError');
	});
});
