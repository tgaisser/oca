import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {AboutComponent} from './about.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {of} from 'rxjs';
import {CourseDataService} from '../services/course-data.service';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../state';
import {Component, Input} from '@angular/core';

@Component({
	selector: 'app-kentico-button',
	template: 'KENTICO BUTTON'
})
class MockKenticoButtonComponent {
	@Input() button: any;
	@Input() buttonClasses: any;
}
describe('AboutComponent', () => {
	let component: AboutComponent;
	let fixture: ComponentFixture<AboutComponent>;

	let courseService;

	beforeEach(waitForAsync(() => {
		courseService = {getPageAbout: jest.fn(() => of({meta_description: ''}))};

		TestBed.configureTestingModule({
			imports: [CarouselModule],
			declarations: [AboutComponent, HcSimpleMdPipe, MockKenticoButtonComponent],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: CourseDataService, useValue: courseService}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AboutComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	test.todo('should update meta tag on page retrieval');
});
