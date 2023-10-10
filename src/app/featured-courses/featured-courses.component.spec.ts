import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';

import {FeaturedCoursesComponent} from './featured-courses.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../state';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import {RouterTestingModule} from '@angular/router/testing';
import {mockJquery, getMockCourse} from '../../test.helpers';
import * as helpers from '../../test.helpers';
import {Store} from '@ngrx/store';
import {donateClicked} from '../state/ui/actions';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';


describe('FeaturedCoursesComponent', () => {
	let component: FeaturedCoursesComponent;
	let fixture: ComponentFixture<FeaturedCoursesComponent>;
	let store: MockStore<State>;
	const jquery = mockJquery();

	const courses = [
		helpers.getMockCourse({system_id: 'mockCourse1'}),
		helpers.getMockCourse({system_id: 'mockCourse2'}),
		helpers.getMockCourse({system_id: 'mockCourse3'})
	];

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [FeaturedCoursesComponent, HcSimpleMdPipe],
			imports: [CarouselModule, RouterTestingModule.withRoutes([])],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FeaturedCoursesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = getTestBed().get(Store);
		jest.spyOn(store, 'dispatch');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should getButtonText as Coming', () => {
		//test first condition where publication date is a future date
		const pubDate = new Date('2099-01-01Z09:00:00.000Z');
		const course = getMockCourse({enrolled: true, publication_date: pubDate});
		expect(component.getButtonText(course)).toEqual('<span class=\"sr-only\">mockCourseTitle </span>Coming 1/1/2099');
	});

	it('should getButtonText as Continue learning...', () => {
		//test next condition where date is in the past and user is enrolled
		const pastDate = new Date();
		pastDate.setMonth(pastDate.getMonth() - 3);
		const course = getMockCourse({enrolled: true, publication_date: pastDate});
		expect(component.getButtonText(course)).toEqual('Continue Learning<span class="sr-only"> about mockCourseTitle</span>');
	});

	it ('should getButtonText as Learn more...', () => {
		//test next condition where date is in the past and user is NOT enrolled
		const pastDate = new Date();
		pastDate.setMonth(pastDate.getMonth() - 3);
		const course = getMockCourse({enrolled: false, publication_date: pastDate});
		expect(component.getButtonText(course)).toEqual('Learn More<span class="sr-only"> about mockCourseTitle</span>');
	});

	it('should loadTrailerVideo', () => {
		expect(component.trailerModalVideoRef?.nativeElement?.multimedia).toBeFalsy();
		const video = helpers.getMockMultimediaItem();
		const course = helpers.getMockCourse({course_trailer: video});
		component.loadTrailerVideo(course);
		expect(component.trailerModalVideoRef?.nativeElement?.multimedia).toEqual(video);
	});

	it('should donateClicked', () => {
		const mouseEvent = new MouseEvent(String('click'));
		const ref = 'www';
		const testEvent = {
			...mouseEvent,
			target: {
				... new EventTarget(),
				href: ref
			}
		};
		component.donateClicked(testEvent);
		expect(store.dispatch).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(donateClicked({donateUrl: ref}));
	});

	it('should changeSlide with direction PREV and slideIndex > 0', () => {
		component.courses = courses;
		component.activeSlideIndex = 1;
		component.changeSlide('prev');
		expect(component.activeSlideIndex).toEqual(0);
	});

	it('should changeSlide with direction PREV and slideIndex = 0', () => {
		component.courses = courses;
		component.activeSlideIndex = 0;
		component.changeSlide('prev');
		expect(component.activeSlideIndex).toEqual(courses.length - 1);
	});

	it('should changeSlide with direction NEXT and slideIndex = 0', () => {
		component.courses = courses;
		component.activeSlideIndex = 0;
		component.changeSlide('next');
		expect(component.activeSlideIndex).toEqual(1);
	});

	it('should changeSlide with direction NEXT and slideIndex > courses.length', () => {
		component.courses = courses;
		component.activeSlideIndex = courses.length;
		component.changeSlide('next');
		expect(component.activeSlideIndex).toEqual(0);
	});
});
