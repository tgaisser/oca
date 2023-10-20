import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SignInComponent} from './sign-in.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../../state';
import pickby from 'lodash.pickby';
import {ToastrService} from 'ngx-toastr';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {MockBrowserAbstractionModule} from '../../../../test.helpers';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import { UserService } from '../../../services/user.service';
import { of } from 'rxjs';


describe('SignInComponent', () => {
	let component: SignInComponent;
	let fixture: ComponentFixture<SignInComponent>;
	jest.mock('lodash.pickby');

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [SignInComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HttpClientModule,
				RouterTestingModule.withRoutes([]),
				MockBrowserAbstractionModule,
				FontAwesomeTestingModule
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{ provide: ToastrService, useValue: {error: jest.fn()}},
				UserService
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SignInComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should getEmailInputError = Please enter a valid email address', () => {
		component.signinForm.setValue({
			email: 'badEmail',
			password: '',
		});
		expect(component.getEmailInputError()).toEqual('Please enter a valid email address.');
	});

	it('should getEmailInputError = required', () => {
		component.signinForm.setValue({
			email: '',
			password: '',
		});
		expect(component.getEmailInputError()).toEqual('Email is required.');
	});

	it('should getPasswordInputError', () => {
		component.signinForm.setValue({
			email: '',
			password: '',
		});
		expect(component.getPasswordInputError()).toEqual('Password is required.');
	});

	it('should login', () => {

		const mockUserService: UserService = TestBed.inject(UserService);
		jest.spyOn(mockUserService, 'logIn').mockReturnValue(of('success'));

		const formData = {
			email: 'email@email.com',
			password: 'password',
		};
		component.signinForm.setValue(formData);
		component.signIn();

		expect(mockUserService.logIn).toHaveBeenCalled();
	});
});
