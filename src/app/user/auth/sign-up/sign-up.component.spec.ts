import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SignUpComponent} from './sign-up.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {ComponentPortal, ToastrService} from 'ngx-toastr';
import {createSpyObj, CustomMocksModule, MockBrowserAbstractionModule} from '../../../../test.helpers';
import {RouterTestingModule} from '@angular/router/testing';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../../../state';
import {BsModalService} from 'ngx-bootstrap/modal';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { UserService } from '../../../services/user.service';
import { of, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {Auth} from 'aws-amplify';
import { fixtureState } from '../../../state/fixtures/state.fixture';
import * as userActions from '../../../state/user/actions';

describe('SignUpComponent', () => {
	let component: SignUpComponent;
	let fixture: ComponentFixture<SignUpComponent>;
	let modalService;
	let store: MockStore<State>;
	let mockUserService;

	beforeEach(waitForAsync(() => {
		modalService = createSpyObj('ModalService', ['show']);

		return TestBed.configureTestingModule({
			declarations: [SignUpComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				CustomMocksModule,
				RouterTestingModule.withRoutes([]),
				MockBrowserAbstractionModule,
				FontAwesomeTestingModule,
				HttpClientTestingModule
			],
			providers: [
				provideMockStore({initialState: fixtureState}),
				{provide: ToastrService, useValue: {error: jest.fn()}},
				provideMockStore({initialState: mockInitialState}),
				{provide: BsModalService, useValue:  modalService},
				{provide: ActivatedRoute, useValue: {
					queryParams: of({
						email: 'email@email.com'
					})
				}},
				UserService
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		mockUserService = TestBed.inject(UserService);
		store = TestBed.inject(MockStore);
		jest.spyOn(store, 'dispatch');
		fixture = TestBed.createComponent(SignUpComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		store?.resetSelectors();
		jest.clearAllMocks();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should dispatch userSetPostLoginUrl when subject preferences true', () => {
		component._includeSubjectPreference = true;
		component.handleSignin();
		expect(store.dispatch).toBeCalledWith(userActions.userSetPostLoginUrl({
			url: '/'
		}));
	});

	it('should getSubjectPreference -- no subject preferences', () => {
		return expect(component.getSubjectPreference()).resolves.toBe(true);
	});

	it('should getSubjectPreference -- invalid subject preferences', () => {
		component._includeSubjectPreference = true;
		modalService.show = jest.fn().mockReturnValue({
			onHide: of('nope')
		});
		return expect(component.getSubjectPreference()).resolves.toBe(false);
	});

	it('should getSubjectPreference -- with subject preferences', () => {
		component._includeSubjectPreference = true;
		modalService.show = jest.fn().mockReturnValue({
			onHide: of('politics')
		});
		return expect(component.getSubjectPreference()).resolves.toBe(true);
	});

	it('should fail on invalid signup form', () => {
		const formData = {
			title: '',
			firstname: '',
			lastname: '',
			email: 'email@email.com',
			password: '',
			optInMarketing: '' ,
			invalidEmail: ''
		};
		component.signupForm.setValue(formData);

		component.signUp();

		expect(component.signupForm.valid).toBeFalsy();
	});

	it('signUp should not execute authService when form invalid', waitForAsync(() => {
		const mockUserService: UserService = TestBed.inject(UserService);
		jest.spyOn(mockUserService, 'checkEmailWithDebounce').mockReturnValue(of('success'));

		const formData = {
			title: '',
			firstname: '',
			lastname: '',
			email: '',
			password: '',
			optInMarketing: '' ,
			invalidEmail: ''
		};
		component.signupForm.setValue(formData);
		expect(component.signupForm.valid).toBe(false);

		component.signUp();
		expect(mockUserService.checkEmailWithDebounce).toHaveBeenCalledTimes(0);
	}));

	it('should sign Up', waitForAsync(() => {

		const mockUserService: UserService = TestBed.inject(UserService);
		jest.spyOn(mockUserService, 'createAccount').mockReturnValue(of('success'));
		jest.spyOn(mockUserService, 'checkEmailWithDebounce').mockReturnValue(of(
			{ isValid: true, input: null, message: null }
		));

		const formData = {
			title: 'Mr.',
			firstname: 'Name',
			lastname: 'Name',
			email: 'email@email.com',
			password: 'myP4s$$wordIsCompl3x',
			optInMarketing: 'false' ,
			invalidEmail: '',
		};
		component.signupForm.setValue(formData);
		expect(component.signupForm.valid).toBe(true);

		component.signUp();
		expect(mockUserService.createAccount).toHaveBeenCalled();
	}));
});
