import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {SocialShareComponent} from './social-share.component';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';

describe('SocialShareComponent', () => {
	let component: SocialShareComponent;
	let fixture: ComponentFixture<SocialShareComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [SocialShareComponent],
			imports: [FontAwesomeTestingModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SocialShareComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
