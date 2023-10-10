import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';

import {UserCourseListComponent, ConfirmUserUnenrollComponent} from './user-course-list.component';
import {CustomMocksModule, getMockCourse} from '../../../test.helpers';
import {RouterTestingModule} from '@angular/router/testing';
import {BsModalRef, ModalModule} from 'ngx-bootstrap/modal';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../../state';
import {Store} from '@ngrx/store';
import {getWithdrawalReasons, withdrawFromCourseRequested} from '../../state/enrollment/actions';
import {FormsModule} from '@angular/forms';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';


describe('UserCourseListComponent', () => {
	let component: UserCourseListComponent;
	let fixture: ComponentFixture<UserCourseListComponent>;
	const course = getMockCourse({system_id: 'mockCourse1'});
	const pubDate = new Date();
	pubDate.setMonth(pubDate.getMonth() + 3);
	const futureCourse = getMockCourse({system_id: 'mockCourse2', publication_date: pubDate});

	let store: MockStore<State>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [UserCourseListComponent],
			imports: [CustomMocksModule, RouterTestingModule.withRoutes([]), ModalModule.forRoot(), HcPipesModule ],
			providers: [provideMockStore({initialState: mockInitialState})]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UserCourseListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = getTestBed().get(Store);
		jest.spyOn(store, 'dispatch');

	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it.todo('should leaveCourse');

	it('should userHasFullCourseAccess = true', () => {
		expect(component.userHasFullCourseAccess(course)).toBeTruthy();
	});

	it('should userHasFullCourseAccess = false', () => {
		expect(component.userHasFullCourseAccess(futureCourse)).toBeFalsy();
	});

	it('should getAccessDateForCurrentUser = publication_date', () => {
		expect(component.getAccessDateForCurrentUser(course)).toEqual(course.publication_date);
	});

	it('should getAccessDateForCurrentUser = early_access_date', () => {
		futureCourse.userHasEarlyAccess = true;
		expect(component.getAccessDateForCurrentUser(futureCourse)).toEqual(futureCourse.early_access_date);
	});
});

describe('ConfirmUserUnenrollComponent', () => {
	let confUnenrollComponent: ConfirmUserUnenrollComponent;
	let fixture: ComponentFixture<ConfirmUserUnenrollComponent>;
	let store: MockStore<State>;
	const mockCourse = getMockCourse();

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [ConfirmUserUnenrollComponent],
			imports: [FormsModule, CustomMocksModule, HcPipesModule],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: BsModalRef, useValue: {
					hide: jest.fn()
				}}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfirmUserUnenrollComponent);
		confUnenrollComponent = fixture.componentInstance;
		confUnenrollComponent.course = mockCourse;
		fixture.detectChanges();
		store = getTestBed().get(Store);
		jest.spyOn(store, 'dispatch');
	});

	it('should create', () => {
		expect(confUnenrollComponent).toBeTruthy();
	});

	it('should ngOnInit', () => {
		confUnenrollComponent.ngOnInit();
		expect(store.dispatch).toHaveBeenCalledWith(getWithdrawalReasons());
	});

	it('should confirmRemove', () => {
		confUnenrollComponent.confirmRemove();
		expect(store.dispatch).toHaveBeenCalledWith(withdrawFromCourseRequested({
			course: confUnenrollComponent.course,
			reason: confUnenrollComponent.withdrawalReason
		}));
	});
});
