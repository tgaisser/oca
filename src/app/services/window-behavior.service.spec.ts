import { TestBed } from '@angular/core/testing';

import { WindowBehaviorService } from './window-behavior.service';

describe('WindowBehaviorService', () => {
	let service: WindowBehaviorService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(WindowBehaviorService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
