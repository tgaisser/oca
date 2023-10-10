import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';
import {CourseCatalogComponent} from './course-catalog.component';
import {HcFormHelpersModule, HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../state';
import {Component, ElementRef, Input, NgZone} from '@angular/core';
import {CourseSubjectFilterPipe} from '../common/course/course-subject-filter.pipe';
import {HttpClientModule} from '@angular/common/http';
import * as helpers from '../../test.helpers';
import {MemoizedSelector, select, Store} from '@ngrx/store';
import {selectAllCourses} from '../state/courses/selectors';
import {BrowserTransferStateModule} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {LOCAL_STORAGE, SESSION_STORAGE} from '../common/models';
import {MockStorage} from '../../test.helpers';
import {ToastrService} from 'ngx-toastr';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { lastValueFrom } from 'rxjs';

@Component({
	selector: 'app-featured-courses',
	template: 'COURSE'
})
class MockFeaturedCoursesComponent {
	@Input() courses: any[];
}

@Component({
	selector: 'app-course-catalog-entry',
	template: 'ENTRY'
})
class MockCourseCatalogEntryComponent {
	@Input() catalogEntry: any;

	preEnrollmentActive = false;
	availableDate = null;
}

@Component({
	selector: 'app-sticky-element',
	template: 'STICKY'
})
class MockStickyElementComponent {
	private elementRef: ElementRef;
	private zone: NgZone;

	public bottomMarkerRef: ElementRef;
	public topMarkerRef: ElementRef;

	private isBottomMarkerVisible: boolean;
	private isTopMarkerVisible: boolean;
	public isStuck: boolean;

	private observer: IntersectionObserver | null;
	public stickyClass = 'stuck';
}

describe('CourseCatalogComponent', () => {
	let component: CourseCatalogComponent;
	let fixture: ComponentFixture<CourseCatalogComponent>;
	let mockSelectAllCourses: MemoizedSelector<State, any>;
	let toast: ToastrService;
	let store: MockStore<State>;
	const mockCourses = [
		{
			...helpers.getMockCourse({system_id: 'mockCourse1'}),
			enrolled: true,
			userHasEarlyAccess: false,
			course_trailer: helpers.getMockMultimediaItem(),
		},
		{
			...helpers.getMockCourse({system_id: 'mockCourse2'}),
			enrolled: true,
			userHasEarlyAccess: false,
			course_trailer: helpers.getMockMultimediaItem(),
		},
		{
			...helpers.getMockCourse({system_id: 'mockCourse3'}),
			enrolled: true,
			userHasEarlyAccess: false,
			course_trailer: helpers.getMockMultimediaItem(),
		}
	];

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [
				CourseCatalogComponent,
				HcSimpleMdPipe,
				CourseSubjectFilterPipe,
				MockFeaturedCoursesComponent,
				MockCourseCatalogEntryComponent,
				MockStickyElementComponent
			],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				HttpClientModule,
				BrowserTransferStateModule,
				RouterTestingModule.withRoutes([])
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: ToastrService, useValue: {
					success: jest.fn(),
					error: jest.fn(),
				}},
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
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CourseCatalogComponent);
		component = fixture.componentInstance;
		toast = getTestBed().get(ToastrService);
		store = getTestBed().get(Store);
		mockSelectAllCourses = store.overrideSelector(selectAllCourses, mockCourses);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should keep up with changes in courses$ observable', waitForAsync(() => {
		mockSelectAllCourses.setResult(mockCourses);
		store.refreshState();
		fixture.detectChanges();
		lastValueFrom(store.pipe(select(mockSelectAllCourses))).then(c => {
			expect(c).toEqual(mockCourses);
		});
	}));

	it('should newCourses', () => {
		const courses = [
			helpers.getMockCourse({system_id: 'mockCourse1', publication_date: new Date('2020-01-02')}),
			helpers.getMockCourse({system_id: 'mockCourse2', publication_date: new Date('2020-06-02')})
		];
		expect(component.newCourses(courses).length).toEqual(2);
		expect(component.newCourses(courses)[0].system_id).toEqual('mockCourse2');
		const pubDate = new Date();
		pubDate.setMonth(pubDate.getMonth() + 3);
		courses.push(helpers.getMockCourse({system_id: 'mockCourse3', publication_date: pubDate}));
		expect(component.newCourses(courses)[0].system_id).toEqual('mockCourse3');
	});

	it('should hasEnrolled', () => {
		const courses = [
			helpers.getMockCourse({system_id: 'mockCourse1'}),
			helpers.getMockCourse({system_id: 'mockCourse2'})
		];
		expect(component.hasEnrolled(courses)).toBeFalsy();

		const pubDate = new Date();
		pubDate.setMonth(pubDate.getMonth() + 3);
		courses.push(helpers.getMockCourse({system_id: 'mockCourse3', publication_date: pubDate, enrolled: true}));
		expect(component.hasEnrolled(courses)).toBeTruthy();
	});

});
