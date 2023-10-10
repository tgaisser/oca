import {TestBed} from '@angular/core/testing';

import {EnrolledGuard} from './enrolled.guard';
import {RouterTestingModule} from '@angular/router/testing';

describe('EnrolledGuard', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule.withRoutes([])],
			providers: [EnrolledGuard]
		});
	});

	it.todo('should canActivate');
});
