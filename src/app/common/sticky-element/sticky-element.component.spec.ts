import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {StickyElementComponent} from './sticky-element.component';

describe('StickyElementComponent', () => {
	let component: StickyElementComponent;
	let fixture: ComponentFixture<StickyElementComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StickyElementComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(StickyElementComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should ngOnDestroy', () => {
		component.ngOnDestroy();

		expect(component['observer']).toBeNull();
	});

	it('should return on call to ngAfterViewInit', () => {
		component.ngAfterViewInit();
	});
});
