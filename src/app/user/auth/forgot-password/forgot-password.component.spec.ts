import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {ForgotPasswordComponent} from './forgot-password.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../../state';
import {ToastrService} from 'ngx-toastr';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {Component, Input} from '@angular/core';
import {LoadingService} from '../../../common/loading.service';
import * as helpers from '../../../../test.helpers';
import {UserService} from '../../../services/user.service';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {of, throwError} from 'rxjs';
import {Router} from '@angular/router';

@Component({
	selector: 'app-password-validate-list',
	template: ''
})
class MockPasswordValidateListComponent {
	@Input() passwordInput: any;
}

describe('ForgotPasswordComponent', () => {
	let service: UserService;
	let loadingService: LoadingService;
	let router: Router;
	let component: ForgotPasswordComponent;
	let fixture: ComponentFixture<ForgotPasswordComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [ForgotPasswordComponent, MockPasswordValidateListComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HttpClientModule,
				RouterTestingModule.withRoutes([]),
				HcFormHelpersModule,
				FontAwesomeTestingModule
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn()}},
				{provide: LoadingService, useValue: {
					hide: jest.fn(),
					show: jest.fn()
				}},
				{provide: UserService, useValue: {
					requestPasswordReset: jest.fn(() => of(true)),
					confirmPasswordReset: jest.fn(() => of(true)),
				}},
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		service = TestBed.inject(UserService);
		loadingService = TestBed.inject(LoadingService);
		router = TestBed.inject(Router);
		fixture = TestBed.createComponent(ForgotPasswordComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should requestReset', waitForAsync(() => {
		component.requestReset();
		expect(service.requestPasswordReset).toHaveBeenCalled();
	}));

	it('should catch error on requestReset', waitForAsync(() => {
		const spy = jest.spyOn(router, 'navigateByUrl').mockImplementation(() => Promise.resolve(true));
		service.requestPasswordReset = jest.fn().mockImplementation(() => throwError(new Error('mock error')));
		component.requestReset();
		expect(loadingService.hide).toBeCalled();
		expect(spy).not.toHaveBeenCalled();
	}));

	it('should resetPassword', waitForAsync(() => {
		const spy = jest.spyOn(router, 'navigateByUrl').mockImplementation(() => Promise.resolve(true));
		component.resetPassword();
		expect(spy).toHaveBeenCalledWith('/auth/signin');
		expect(service.confirmPasswordReset).toHaveBeenCalled();
	}));

	it('should catch error on resetPassword', waitForAsync(() => {
		const spy = jest.spyOn(router, 'navigateByUrl').mockImplementation(() => Promise.resolve(true));
		service.confirmPasswordReset = jest.fn().mockImplementation(() => throwError(new Error('mock error')));
		component.resetPassword();
		expect(loadingService.hide).toBeCalled();
		expect(spy).not.toHaveBeenCalled();
	}));

	it('should showConfirmForm', () => {
		const confirmSpy = jest.spyOn(component, 'showConfirmForm');
		component.showConfirmForm();
		expect(confirmSpy).toHaveBeenCalled();
		expect(component.showResetPanel).toBeTruthy();
	});

	it('should showRequestForm', () => {
		const showSpy = jest.spyOn(component, 'showRequestForm');
		component.showRequestForm();
		expect(showSpy).toHaveBeenCalled();
		expect(component.showResetPanel).toBeFalsy();
	});
});
