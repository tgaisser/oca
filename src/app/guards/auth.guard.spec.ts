import {inject, TestBed} from '@angular/core/testing';
import {AuthGuard} from './auth.guard';
import {RouterTestingModule} from '@angular/router/testing';
import {CustomMocksModule} from '../../test.helpers';
import Auth from '@aws-amplify/auth';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

describe('AuthGuard', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule.withRoutes([]), CustomMocksModule],
			// providers: [AuthGuard]
		})
			.compileComponents();
	});

	it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
		expect(guard).toBeTruthy();
	}));

	it('should ...', inject([AuthGuard], async (guard) => {
		const spy = jest.spyOn(Auth, 'currentAuthenticatedUser');
		spy.mockRejectedValue('dummy value');

		// these values are the real values from a situation where a logged-out user is navigating to /auth/profile
		const activatedRouteSnapshot =
			({
				queryParams: {},
				pathFromRoot: [
					{url:[]},
					{url:[{path:'auth'}]},
					{url:[]},
					{url:[{path:'profile'}]}
				]
			});

		const canActivate = await guard.canActivate(
			activatedRouteSnapshot as ActivatedRouteSnapshot,
			{} as RouterStateSnapshot
		);

		expect(canActivate).toBe(false);
	}));
});
