import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PoliciesComponent } from './policies.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {HttpClientModule} from '@angular/common/http';
import {BrowserTestingModule} from '@angular/platform-browser/testing';
import {CustomMocksModule} from '../../test.helpers';

describe('PoliciesComponent', () => {
	let component: PoliciesComponent;
	let fixture: ComponentFixture<PoliciesComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [PoliciesComponent, HcSimpleMdPipe],
			imports: [HttpClientModule, BrowserTestingModule, CustomMocksModule],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PoliciesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
