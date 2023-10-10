import {inject, TestBed} from '@angular/core/testing';

import {UnauthGuard} from './unauth.guard';
import {RouterTestingModule} from '@angular/router/testing';

describe('UnauthGuard', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule.withRoutes([])],
			providers: [UnauthGuard]
		});
	});

	it('should ...', inject([UnauthGuard], (guard: UnauthGuard) => {
		expect(guard).toBeTruthy();
	}));
});
