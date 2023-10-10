import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {LandingPageComponent} from './landing-page.component';
import {CustomMocksModule} from '../../test.helpers';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule, HcPipesModule} from 'hillsdale-ng-helper-lib';
import {mockInitialState, State} from '../state';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Store} from '@ngrx/store';
import {userLogOutRequested} from '../state/user/actions';
import * as helpers from '../../test.helpers';
import {enrollInCourseRequested} from '../state/enrollment/actions';
import {UserType} from '../services/user.service';
import {BaseLandingPageContentsComponentDirective} from './base-landing-page-contents-component.directive';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

@Component({
	selector: 'app-test-landing-page-contents',
	template: '<h1>Test</h1><hc-video-player *ngIf="course" #trailerVideo class="trailer-art trailer-video" [attr.multimedia]="stringifyMM(course.course_trailer)" [ngStyle]="{\'z-index\': hideTrailerOverlay ? 1: -1}"  player-type-preference=\'["cf","v"]\'></hc-video-player>',
})
export class DemoLandingPageComponent extends BaseLandingPageContentsComponentDirective {}

describe('BaseLandingPageContentsComponentDirective', () => {
	let component: DemoLandingPageComponent;
	let fixture: ComponentFixture<DemoLandingPageComponent>;
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
			declarations: [DemoLandingPageComponent],
			imports: [
				CustomMocksModule,
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				HcPipesModule,
			],
			providers: [
				provideMockStore({initialState: mockInitialState})
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DemoLandingPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		store = TestBed.inject(Store) as MockStore<State>;
		jest.spyOn(store, 'dispatch');
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

	it('should logout', () => {
		const logoutSpy = jest.spyOn(component, 'logOut');
		component.logOut();
		expect(logoutSpy).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(userLogOutRequested());

		logoutSpy.mockReset();
	});

	it.todo('should show landing text if first load');


	it('should playTrailerVideo()', () => {
		component.course = {
			course_trailer: {id: '1', vimeo_id: 'vimeo'}
		} as any;

		fixture.detectChanges();

		const playSpy = jest.spyOn(component.trailerVideoRef.nativeElement, 'play');

		component.playTrailerVideo();
		expect(playSpy).toHaveBeenCalled();
		expect(component.hideTrailerOverlay).toBeTruthy();
		playSpy.mockReset();
	});

	it('should enrollInCourse', () => {
		const enrollSpy = jest.spyOn(component, 'enrollInCourse');
		//const mockCourse = helpers.getMockCourse();
		component.enrollInCourse(mockCourse);
		expect(enrollSpy).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(enrollInCourseRequested({
			course: mockCourse,
			title: component.enrollmentForm.getRawValue().title,
			firstname: component.enrollmentForm.getRawValue().firstname,
			lastname: component.enrollmentForm.getRawValue().lastname,
			email: component.enrollmentForm.getRawValue().email,
		}));
	});

	it('should scrollToEnroll', () => {
		component.enrollForm = {nativeElement: {scrollIntoView: jest.fn()}};
		const scrollSpy = jest.spyOn(component.enrollForm.nativeElement, 'scrollIntoView');
		component.scrollToEnroll();
		expect(scrollSpy).toHaveBeenCalled();
		scrollSpy.mockReset();
	});

	it('should getHeaderEnrollButtonText Accept Early Access', () => {
		const getHeaderSpy = jest.spyOn(component, 'getHeaderEnrollButtonText');
		const status = {isLoggedIn: true};
		component.earlyAccessToken = 'mockToken';
		component.getHeaderEnrollButtonText(status);
		expect(getHeaderSpy).toHaveBeenCalled();
		expect(component.getHeaderEnrollButtonText(status)).toEqual('Accept Early Access');
		getHeaderSpy.mockReset();
	});

	it('should getHeaderEnrollButtonText Pre-Enroll', () => {
		const getHeaderSpy = jest.spyOn(component, 'getHeaderEnrollButtonText');
		const status = {isLoggedIn: true};
		component.preEnrollmentActive = true;
		component.getHeaderEnrollButtonText(status);
		expect(getHeaderSpy).toHaveBeenCalled();
		expect(component.getHeaderEnrollButtonText(status)).toEqual('Pre-Enroll');
		getHeaderSpy.mockReset();
	});

	it('should getHeaderEnrollButtonText Enroll', () => {
		const getHeaderSpy = jest.spyOn(component, 'getHeaderEnrollButtonText');
		const status = {isLoggedIn: true};
		component.getHeaderEnrollButtonText(status);
		expect(getHeaderSpy).toHaveBeenCalled();
		expect(component.getHeaderEnrollButtonText(status)).toEqual('Enroll');
		getHeaderSpy.mockReset();
	});

	it('should getHeaderEnrollButtonText Start learning', () => {
		const getHeaderSpy = jest.spyOn(component, 'getHeaderEnrollButtonText');
		const status = {isLoggedIn: false};
		component.getHeaderEnrollButtonText(status);
		expect(getHeaderSpy).toHaveBeenCalled();
		expect(component.getHeaderEnrollButtonText(status)).toEqual('Start Learning');
		getHeaderSpy.mockReset();
	});

	it('should getToEnrollText = enroll', () => {
		const getToEnrollSpy = jest.spyOn(component, 'getToEnrollText');
		component.getToEnrollText();
		expect(getToEnrollSpy).toHaveBeenCalled();
		expect(component.getToEnrollText()).toEqual('enroll in');
		getToEnrollSpy.mockReset();
	});

	// temp disabling 1/10/2023 due to temporary changes for pre-registration
	// it('should getToEnrollText = pre-enroll', () => {
	// 	const getToEnrollSpy = jest.spyOn(component, 'getToEnrollText');
	// 	component.preEnrollmentActive = true;
	// 	component.getToEnrollText();
	// 	expect(getToEnrollSpy).toHaveBeenCalled();
	// 	expect(component.getToEnrollText()).toEqual('pre-enroll in');
	// 	getToEnrollSpy.mockReset();
	// });

	it('should getToEnrollText = accept early access', () => {
		const getToEnrollSpy = jest.spyOn(component, 'getToEnrollText');
		component.earlyAccessToken = 'mockToken';
		component.getToEnrollText();
		expect(getToEnrollSpy).toHaveBeenCalled();
		expect(component.getToEnrollText()).toEqual('accept early access to');
		getToEnrollSpy.mockReset();
	});

	it('should getReleaseDate = publication_date', () => {
		const getSpy = jest.spyOn(component, 'getReleaseDate');
		component.getReleaseDate(mockCourse);
		expect(getSpy).toHaveBeenCalledWith(mockCourse);
		expect(component.getReleaseDate(mockCourse)).toEqual(mockCourse.publication_date);
		getSpy.mockReset();
	});

	it('should getReleaseDate = early_access_date', () => {
		const getSpy = jest.spyOn(component, 'getReleaseDate');
		component.earlyAccessToken = 'mockToken';
		component.getReleaseDate(mockCourse);
		expect(getSpy).toHaveBeenCalledWith(mockCourse);
		expect(component.getReleaseDate(mockCourse)).toEqual(mockCourse.early_access_date);
		getSpy.mockReset();
	});
});
