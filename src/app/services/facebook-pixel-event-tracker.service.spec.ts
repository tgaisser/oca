import {TestBed} from '@angular/core/testing';

import {FacebookPixelEventTrackerService} from './facebook-pixel-event-tracker.service';

describe('FacebookPixelEventTrackerService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: FacebookPixelEventTrackerService = TestBed.get(FacebookPixelEventTrackerService);
		expect(service).toBeTruthy();
	});

	it('should return on call to trackEvent', () => {
		const service: FacebookPixelEventTrackerService = TestBed.get(FacebookPixelEventTrackerService);
		service.trackEvent('test', {}, false);
	});
});
