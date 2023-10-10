import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FaqComponent } from './faq.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {HttpClientModule} from '@angular/common/http';
import {BrowserTransferStateModule} from '@angular/platform-browser';

describe('FaqComponent', () => {
	let component: FaqComponent;
	let fixture: ComponentFixture<FaqComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [FaqComponent, HcSimpleMdPipe],
			imports: [HttpClientModule, BrowserTransferStateModule]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FaqComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
