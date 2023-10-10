import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {DvdCatalogComponent} from './dvd-catalog.component';
import {CustomMocksModule} from '../../test.helpers';
import {HttpClientModule} from '@angular/common/http';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';

describe('DvdCatalogComponent', () => {
	let component: DvdCatalogComponent;
	let fixture: ComponentFixture<DvdCatalogComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [DvdCatalogComponent],
			imports: [CustomMocksModule, HttpClientModule, HcPipesModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DvdCatalogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
