import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvAdComponent } from './tv-ad.component';
import {HcFormHelpersModule, HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {RouterTestingModule} from '@angular/router/testing';
import {CustomMocksModule} from '../../test.helpers';
import {CourseDataService} from '../services/course-data.service';
import {UtmService} from '../services/utm.service';
import {of} from 'rxjs';

describe('TvAdComponent', () => {
	let component: TvAdComponent;
	let fixture: ComponentFixture<TvAdComponent>;
	let courseService;
	let utmService;

	beforeEach(async () => {
		courseService = {getTvAdLandingPage: jest.fn(() => of({meta_description: ''}))};
		utmService = {setUtmCodes: jest.fn(() => {})};

		await TestBed.configureTestingModule({
			declarations: [TvAdComponent, HcSimpleMdPipe],
			imports: [RouterTestingModule.withRoutes([]), CustomMocksModule, HcFormHelpersModule],
			providers: [
				{provide: CourseDataService, useValue: courseService},
				{provide: UtmService, useValue: utmService}
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TvAdComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
