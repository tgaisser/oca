import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {CourseProgressComponent} from './course-progress.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../../state';
import {RouterTestingModule} from '@angular/router/testing';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';

describe('CourseProgressComponent', () => {
	let component: CourseProgressComponent;
	let fixture: ComponentFixture<CourseProgressComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [CourseProgressComponent, HcSimpleMdPipe],
			imports: [
				RouterTestingModule.withRoutes([]),
				FontAwesomeTestingModule
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CourseProgressComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
