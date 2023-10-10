import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {InstructorComponent} from './instructor.component';
import {InstructorNamePipe} from '../instructor-name.pipe';

describe('InstructorComponent', () => {
	let component: InstructorComponent;
	let fixture: ComponentFixture<InstructorComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [InstructorComponent, InstructorNamePipe]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(InstructorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
