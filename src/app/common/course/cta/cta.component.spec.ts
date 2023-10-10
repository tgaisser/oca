import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {CtaComponent} from './cta.component';

describe('CtaComponent', () => {
	let component: CtaComponent;
	let fixture: ComponentFixture<CtaComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [CtaComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CtaComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
