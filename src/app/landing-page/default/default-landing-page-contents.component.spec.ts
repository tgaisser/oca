import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {CustomMocksModule} from '../../../test.helpers';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HcFormHelpersModule, HcPipesModule} from 'hillsdale-ng-helper-lib';
import {RouterTestingModule} from '@angular/router/testing';
import {mockInitialState, State} from '../../state';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Store} from '@ngrx/store';
import * as helpers from '../../../test.helpers';
import {UserType} from '../../services/user.service';
import {DefaultLandingPageContentsComponent} from './default-landing-page-contents.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {selectDonationLink, selectLandingPageAccountCreationForm} from '../../state/enrollment/selectors';
import { lastValueFrom } from 'rxjs';
import { ExpectedConditions } from 'protractor';
import {environment} from '../../../environments/environment';


describe('DefaultLandingPageContentsComponent', () => {
	let component: DefaultLandingPageContentsComponent;
	let fixture: ComponentFixture<DefaultLandingPageContentsComponent>;
	let store: MockStore<State>;
	const mockCourse = helpers.getMockCourse({system_id: 'mockCourseId'});
	const mockUser = {
		id: 'mockUserId',
		email: 'mockUserEmail',
		username: 'mockUsername',
		firstname: 'mockFirstname',
		lastname: 'mockLastname',
		address: 'mockAddress',
		city: 'mockCity',
		state: 'mockState',
		zip: 'mockZip',
		title: 'mockTitle',
		userType: UserType.Email,
		matchedAccounts: []
	};

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [DefaultLandingPageContentsComponent],
			imports: [
				CustomMocksModule,
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				HcPipesModule,
				RouterTestingModule.withRoutes([]),
			],
			providers: [
				provideMockStore({initialState: mockInitialState})
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DefaultLandingPageContentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = TestBed.inject(Store) as MockStore<State>;
		jest.spyOn(store, 'dispatch');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(lastValueFrom(store.select(selectDonationLink))).resolves.toBe(environment.defaultDonationUrl);
	});

	it('submitting valid enrollment form should update landingPageAccountCreationForm to true', () => {

		expect(lastValueFrom(store.select(selectLandingPageAccountCreationForm))).resolves.toBe(false);

		component.enrollmentForm.setValue({
			title: '',
			firstname: '',
			lastname: '',
			email: 'asdf@asdf.com',
		});
		expect(component.enrollmentForm.valid).toEqual(true);

		component.enrollInCourse(mockCourse);
		fixture.detectChanges();

		expect(store.select(selectLandingPageAccountCreationForm)).toBeTruthy();
	});

	// it('get getCourseStatus', () => {
	// 	const getSpy = jest.spyOn(component, 'getCourseStatus');
	// 	component.ngOnInit()
	// 	expect(getSpy).toBeCalled
	// });
});
