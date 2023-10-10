import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';
import {ConfirmCodeComponent} from './confirm-code.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../../../state';
import {ToastrService} from 'ngx-toastr';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';
import {UserService} from '../../../services/user.service';
import {of, throwError} from 'rxjs';
import {ConfirmCodeService} from './confirm-code.service';
import {userConfirmComplete} from '../../../state/user/actions';
import {Store} from '@ngrx/store';
import {MockBrowserAbstractionModule} from '../../../../test.helpers';
import {WindowTrackingService} from '../../../services/window-tracking.service';

describe('ConfirmCodeComponent', () => {
	let component: ConfirmCodeComponent;
	let fixture: ComponentFixture<ConfirmCodeComponent>;
	let userService: UserService;
	let toast: ToastrService;
	let store: MockStore<State>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [ConfirmCodeComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				RouterTestingModule.withRoutes([]),
				HttpClientModule,
				MockBrowserAbstractionModule,
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: ToastrService, useValue: {
					success: jest.fn(),
					error: jest.fn(),
				}},
				{provide: UserService, useValue: {
					resendConfirmCode: jest.fn(() => of(true)),
					validateConfirmCode: jest.fn(() => of('SUCCESS')),
					logIn: jest.fn(() => of(true))
				}},
				{provide: ConfirmCodeService, useValue: {
					password: jest.fn(() => 'New45678')
				}},
				{provide: WindowTrackingService, useValue: {
					trackEvent: jest.fn()
				}}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfirmCodeComponent);
		component = fixture.componentInstance;
		userService = getTestBed().get(UserService);
		toast = getTestBed().get(ToastrService);
		store = getTestBed().get(Store);
		fixture.detectChanges();
		jest.spyOn(store, 'dispatch');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should prompt for email on call to sendAgain', () => {
		window.prompt = jest.fn().mockImplementationOnce(() => console.log('prompt'));
		component.sendAgain();
	});

	it('should call userService on call to sendAgain', () => {
		component.confirmForm.controls.email.setValue('user@test.com');
		fixture.detectChanges();
		component.sendAgain();
		expect(toast.success).toHaveBeenCalledWith('A code has been emailed to you');
	});

	it('should error on call to sendAgain', () => {
		component.confirmForm.controls.email.setValue('user@test.com');
		userService.resendConfirmCode = jest.fn().mockImplementationOnce(() => throwError('mockError'));
		fixture.detectChanges();
		component.sendAgain();
		expect(toast.error).toHaveBeenCalledWith('An error occurred');
	});

	it('should confirmCode', () => {
		component.confirmForm.controls.email.setValue('user@test.com');
		fixture.detectChanges();
		component.confirmCode();
		expect(component.accountConfirmed).toBeTruthy();
		expect(toast.success).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(userConfirmComplete({allowNavigate: true, email: 'user@test.com'}));
	});

	it('should toast and return on call to confirmCode', () => {
		userService.validateConfirmCode = jest.fn().mockImplementationOnce(() => of('WRONG'));
		component.confirmCode();
		expect(component.accountConfirmed).toBeFalsy();
		expect(toast.error).toHaveBeenCalledWith('Incorrect confirm code. Please try again.');
	});

	it('should error and toast on call to confirmCode', () => {
		userService.validateConfirmCode = jest.fn().mockImplementationOnce(() => throwError('mockError'));
		component.confirmCode();
		expect(component.accountConfirmed).toBeFalsy();
		expect(toast.error).toHaveBeenCalledWith(undefined);
	});

	it('should error and navigate to auth/signin on call to confirmCode', () => {
		component.confirmForm.controls.email.setValue('user@test.com');
		userService.logIn = jest.fn().mockImplementationOnce(() => throwError('mockError'));
		fixture.detectChanges();
		component.confirmCode();
		expect(component.accountConfirmed).toBeTruthy();
		//TODO find a way to spyon the router.navigate method for code coverage
	});
});
