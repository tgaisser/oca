import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {LearnComponent} from './learn.component';
import {CustomMocksModule, MockNextCourseComponent} from '../../test.helpers';
import {ThankYouComponent} from './thank-you/thank-you.component';
import {Component, Input} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';

@Component({
	selector: 'app-landing',
	template: '[app-landing pageLearn={{pageLearn}}]'
})
class MockAppLandingComponent {
	@Input()
		pageLearn: any;
}

describe('LearnComponent', () => {
	let component: LearnComponent;
	let fixture: ComponentFixture<LearnComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [LearnComponent, ThankYouComponent, MockAppLandingComponent, MockNextCourseComponent],
			imports: [CustomMocksModule, RouterTestingModule],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LearnComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be true', () => {
		expect(true).toBeTruthy();
	});
});
