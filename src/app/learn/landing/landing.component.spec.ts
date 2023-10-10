import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {LandingComponent} from './landing.component';
import {CustomMocksModule} from '../../../test.helpers';
import {Component, Input} from '@angular/core';

@Component({
	selector: 'app-sign-up',
	template: '[app-signup simpleMode={{simpleMode}} includeSubjectPreference={{includeSubjectPreference}}]'
})
class MockAppSignupComponent {
	@Input()
		simpleMode: boolean;

	@Input()
		includeSubjectPreference: boolean;
}

describe('LandingComponent', () => {
	let component: LandingComponent;
	let fixture: ComponentFixture<LandingComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [LandingComponent, MockAppSignupComponent],
			imports: [CustomMocksModule],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LandingComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be true', () => {
		expect(true).toBeTruthy();
	});
});
