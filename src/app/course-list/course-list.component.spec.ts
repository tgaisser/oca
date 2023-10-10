import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import { CourseListComponent } from './course-list.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';
import {BrowserTransferStateModule} from '@angular/platform-browser';
import {HcFormHelpersModule, HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {CourseSubjectFilterPipe} from '../common/course/course-subject-filter.pipe';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LOCAL_STORAGE, SESSION_STORAGE} from '../common/models';
import {MockStorage} from '../../test.helpers';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../state';
import {MemoizedSelector, Store} from '@ngrx/store';
import {selectAllCourses} from '../state/courses/selectors';
import * as helpers from '../../test.helpers';
import { fixtureState } from '../state/fixtures/state.fixture';
import { lastValueFrom } from 'rxjs';

describe('CourseListComponent', () => {
	let component: CourseListComponent;
	let fixture: ComponentFixture<CourseListComponent>;
	let mockSelectAllCourses: MemoizedSelector<State, any>;
	let store: MockStore<State>;
	const mockCourses = [
		{
			...helpers.getMockCourse({system_id: 'mockCourse1'}),
			enrolled: true,
			isEarlyEnroll: false,
			course_trailer: helpers.getMockMultimediaItem(),
		},
		{
			...helpers.getMockCourse({system_id: 'mockCourse2'}),
			enrolled: true,
			isEarlyEnroll: false,
			course_trailer: helpers.getMockMultimediaItem(),
		},
		{
			...helpers.getMockCourse({system_id: 'mockCourse3'}),
			enrolled: true,
			isEarlyEnroll: false,
			course_trailer: helpers.getMockMultimediaItem(),
		}
	];

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				CourseListComponent,
				HcSimpleMdPipe,
				CourseSubjectFilterPipe,
			],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				HttpClientModule,
				RouterTestingModule.withRoutes([]),
				BrowserTransferStateModule
			],
			providers: [
				provideMockStore({initialState: fixtureState}),
				{provide: LOCAL_STORAGE, useClass: MockStorage},
				{provide: SESSION_STORAGE, useValue: {
					key: num => '',
					getItem: key => null,
					setItem: (key, val) => {},
					clear: () => {},
					removeItem: key => null,
					length: 0,
				}
				},
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CourseListComponent);
		component = fixture.componentInstance;

		store = TestBed.inject(MockStore);
		// mockSelectAllCourses = store.overrideSelector(selectAllCourses, mockCourses);
		fixture.detectChanges();
	});

	afterEach(() => {
		store?.resetSelectors();
	  });

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('Sort Courses', () =>{

		it('should sort Courses -- AtoZ', waitForAsync(() => {
			component.sortCourses('AtoZ');
			lastValueFrom(component.filteredCourses$).then((courses) => {
				expect(courses[1].system_id).toEqual('course3');
			});
		}));

		it('should sort Courses -- ZtoA', waitForAsync(() => {
			component.sortCourses('ZtoA');
			lastValueFrom(component.filteredCourses$).then((courses) => {
				expect(courses[0].system_id).toEqual('course2');
			});
		}));

		it('should sort Courses -- OtoN', waitForAsync(() => {
			component.sortCourses('OtoN');
			lastValueFrom(component.filteredCourses$).then((courses) => {
				expect(courses[0].system_id).toEqual('course2');
			});
		}));

		it('should sort Courses -- NtoO', waitForAsync(() => {
			component.sortCourses('NtoO');
			lastValueFrom(component.filteredCourses$).then((courses) => {
				expect(courses[0].system_id).toEqual('course1');
			});
		}));
	});

	it('toggleListSize', () => {
		component.toggleListSize('courseSubjectList');
		component.toggleListSize('instructorList');
		expect(component.courseSubjectShowAll).toBe(true);
		expect(component.instructorShowAll).toBe(true);
	});

	it('clearFilters', () => {
		component.clearFilters();
		expect(component.searchForm.controls.filterForm).toBeNull;
	});

});
