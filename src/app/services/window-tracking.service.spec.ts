import { TestBed } from '@angular/core/testing';

import { WindowTrackingService } from './window-tracking.service';

describe('WindowTrackingService', () => {
	let service: WindowTrackingService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(WindowTrackingService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
