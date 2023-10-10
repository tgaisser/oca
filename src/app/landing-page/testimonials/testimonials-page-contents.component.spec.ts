import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {CustomMocksModule} from '../../../test.helpers';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule, HcPipesModule} from 'hillsdale-ng-helper-lib';
import {RouterTestingModule} from '@angular/router/testing';
import {mockInitialState, State} from '../../state';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Store} from '@ngrx/store';
import * as helpers from '../../../test.helpers';
import {UserType} from '../../services/user.service';
import {TestimonialsLandingPageContentsComponent} from './testimonials-landing-page-contents.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { selectLandingPageAccountCreationForm } from '../../state/enrollment/selectors';
import { lastValueFrom } from 'rxjs';


describe('TestimonialsLandingPageContentsComponent', () => {
	let component: TestimonialsLandingPageContentsComponent;
	let fixture: ComponentFixture<TestimonialsLandingPageContentsComponent>;
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
			declarations: [TestimonialsLandingPageContentsComponent],
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
		fixture = TestBed.createComponent(TestimonialsLandingPageContentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = TestBed.inject(Store) as MockStore<State>;
		jest.spyOn(store, 'dispatch');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
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

});
