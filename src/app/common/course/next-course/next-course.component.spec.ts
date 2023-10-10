import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {NextCourseComponent} from './next-course.component';
import {CustomMocksModule} from '../../../../test.helpers';


describe('NextCourseComponent', () => {
	let component: NextCourseComponent;
	let fixture: ComponentFixture<NextCourseComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [NextCourseComponent],
			imports: [CustomMocksModule],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NextCourseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	test.todo('should switch layouts with input flag');
});
