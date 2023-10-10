import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {ViewProfileComponent} from './view-profile.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../state';
import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {Course} from '../../services/course-data.service';
import {BsModalRef} from 'ngx-bootstrap/modal';

@Component({
	selector: 'app-user-user-course-list',
	template: 'COURSE LIST'
})
class MockUserCourseListComponent {
	courses$: Observable<Course[]>;
	coursesInProgress: Course[];
	coursesCompleted: Course[];
	selectedCourse: Course;
	modalRef: BsModalRef;
}

describe('ProfileComponent', () => {
	let component: ViewProfileComponent;
	let fixture: ComponentFixture<ViewProfileComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [ViewProfileComponent, HcSimpleMdPipe, MockUserCourseListComponent],
			imports: [FormsModule, ReactiveFormsModule],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ViewProfileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
