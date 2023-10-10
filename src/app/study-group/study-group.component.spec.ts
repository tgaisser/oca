import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';
import * as helpers from '../../test.helpers';
import {StudyGroupComponent} from './study-group.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../state';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {RouterTestingModule} from '@angular/router/testing';
import {Store} from '@ngrx/store';
import {userLogOutRequested} from '../state/user/actions';
import {enrollInCourseRequested} from '../state/enrollment/actions';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Course} from '../services/course-data.service';
import {of} from 'rxjs';

describe('StudyGroupComponent', () => {
	let component: StudyGroupComponent;
	let fixture: ComponentFixture<StudyGroupComponent>;
	let store: MockStore<State>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StudyGroupComponent, HcSimpleMdPipe],
			imports: [FormsModule, ReactiveFormsModule, HcFormHelpersModule,
				RouterTestingModule.withRoutes([])],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		})
			.compileComponents().then();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(StudyGroupComponent);
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

	it('should logOut', () => {
		const logoutSpy = jest.spyOn(component, 'logOut');
		component.logOut();
		expect(logoutSpy).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(userLogOutRequested());
		logoutSpy.mockReset();
	});

	it('should playTrailerVideo', () => {
		const playSpy = jest.spyOn(component, 'playTrailerVideo');
		component.course$ = of(helpers.getMockCourse({course_trailer: {id: '1', vimeo_id: 1}}) as Course);
		fixture.detectChanges();
		const playEnableSpy = jest.spyOn(component.trailerVideoRef.nativeElement, 'play');
		component.playTrailerVideo();
		expect(playSpy).toHaveBeenCalled();
		expect(component.hideTrailerOverlay).toBeTruthy();
		expect(playEnableSpy).toHaveBeenCalled();
		playSpy.mockReset();
		playEnableSpy.mockReset();
	});

	it('should enrollInCourse ', () => {
		const enrollSpy = jest.spyOn(component, 'enrollInCourse');
		const mockCourse = helpers.getMockCourse({url_slug: 'the-great-american-story'});
		component.enrollInCourse(mockCourse);
		expect(enrollSpy).toHaveBeenCalledWith(mockCourse);
		expect(store.dispatch).toHaveBeenCalledWith(enrollInCourseRequested({
			course: mockCourse,
			email: component.enrollmentForm.getRawValue().email,
			studyGroupId: 'c4cacf25-0d84-43f8-9a03-2d0e646f84aa'
		}));
		enrollSpy.mockReset();
	});

});
