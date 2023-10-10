import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';
import {getMockCourse, MockStorage} from '../../test.helpers';
import {LandingPageComponent} from './landing-page.component';
import {CustomMocksModule} from '../../test.helpers';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule, HcPipesModule} from 'hillsdale-ng-helper-lib';
import {RouterTestingModule} from '@angular/router/testing';
import {mockInitialState, State} from '../state';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MemoizedSelector, Store} from '@ngrx/store';
import * as helpers from '../../test.helpers';
import {selectCurrentCourse} from '../state/courses/selectors';
import {BrowserTransferStateModule, Meta, Title} from '@angular/platform-browser';
import {selectCurrentUser} from '../state/user/selectors';
import {UserType} from '../services/user.service';
import {ToastrService} from 'ngx-toastr';
import {Course} from '../services/course-data.service';
import {Component, Directive, Input} from '@angular/core';
import {SESSION_STORAGE} from '../common/models';

@Directive()
export class MockOnPlatformLandingPageDirective {
	@Input()
		course: Course;

	@Input()
		userStatus: any;

	@Input()
		earlyAccessToken: string;

	@Input()
		preEnrollmentActive: boolean;
}

@Component({
	selector: 'app-detailed-landing-page-contents',
	template: 'DETAILED',
})
export class MockOnPlatformLandingPageComponent extends MockOnPlatformLandingPageDirective { }

@Component({
	selector: 'app-default-landing-page-contents',
	template: 'DETAILED',
})
export class MockDefaultLandingPageComponent extends MockOnPlatformLandingPageDirective { }

@Component({
	selector: 'app-alt-layout-landing-page-contents',
	template: 'DETAILED',
})
export class MockAltLayoutLandingPageComponent extends MockOnPlatformLandingPageDirective { }

describe('LandingPageComponent', () => {
	let component: LandingPageComponent;
	let fixture: ComponentFixture<LandingPageComponent>;
	let store: MockStore<State>;
	let mockSelectCurrentCourse: MemoizedSelector<State, any>;
	let mockSelectCurrentUser: MemoizedSelector<State, any>;
	let titleSvc: Title;
	let metaSvc: Meta;
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
			declarations: [
				LandingPageComponent,
				MockOnPlatformLandingPageComponent,
				MockDefaultLandingPageComponent,
				MockAltLayoutLandingPageComponent
			],
			imports: [
				CustomMocksModule,
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				HcPipesModule,
				RouterTestingModule.withRoutes([]),
				BrowserTransferStateModule,
			],
			providers: [
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn(), info: jest.fn()}},
				provideMockStore({initialState: mockInitialState}),
				{provide: SESSION_STORAGE, useClass: MockStorage},
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LandingPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		titleSvc = getTestBed().get(Title);
		jest.spyOn(titleSvc, 'setTitle');
		metaSvc = getTestBed().get(Meta);
		jest.spyOn(metaSvc, 'updateTag');
		store = getTestBed().get(Store);
		jest.spyOn(store, 'dispatch');
		mockSelectCurrentCourse = store.overrideSelector(
			selectCurrentCourse,
			getMockCourse(mockCourse)
		);
		mockSelectCurrentUser = store.overrideSelector(
			selectCurrentUser,
			mockUser
		);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should ngOnInit', () => {
		const initSpy = jest.spyOn(component, 'ngOnInit');
		component.ngOnInit();
		expect(initSpy).toHaveBeenCalled();
		initSpy.mockReset();
	});

	it.todo('should show landing text if first load');

	it('should keep up with this.course$ observable', () => {
		mockSelectCurrentCourse.setResult(mockCourse);
		store.refreshState();
		fixture.detectChanges();

		expect(component.preEnrollmentActive).toBeFalsy();
		expect(titleSvc.setTitle).toHaveBeenCalledWith(mockCourse.title + ' | Hillsdale College Online Courses');
		expect(metaSvc.updateTag).toHaveBeenCalledWith({
			name: 'description',
			content: mockCourse.meta_description
		});
	});

	it('should keep up with userStatus$ observable', () => {
		mockSelectCurrentUser.setResult(mockUser);
		store.refreshState();
		fixture.detectChanges();
	});

});
