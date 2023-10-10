import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {EnrolledProgressPieChartComponent} from './enrolled-progress-pie-chart.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import * as helpers from '../../../../test.helpers';

describe('EnrolledProgressPieChartComponent', () => {
	let component: EnrolledProgressPieChartComponent;
	let fixture: ComponentFixture<EnrolledProgressPieChartComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [EnrolledProgressPieChartComponent, HcSimpleMdPipe]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EnrolledProgressPieChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should getClasses = []', () => {
		expect(component.getClasses()).toEqual([]);
	});

	it('should getClasses', () => {
		component.course =  helpers.getMockCourse(); //25% complete progress
		expect(component.getClasses()).toEqual(['percent-25', 'progress-50-or-less']);
		component.course = helpers.getMockCourse({progress: helpers.getMockProgress({progressPercentage: .75})});
		expect(component.getClasses()).toEqual(['percent-75', 'progress-greater-50']);
	});
});
