import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import Auth from '@aws-amplify/auth';

@Injectable({
	providedIn: 'root'
})
export class UnauthGuard implements CanActivate {
	constructor(private _router: Router) {
	}

	canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return Auth.currentAuthenticatedUser()
			.then(() => {
				if (next.queryParams.redirectUrl) {
					//console.log('routing to', next.queryParams.redirectUrl);
					return this._router.navigateByUrl(next.queryParams.redirectUrl);
				}
				this._router.navigate(['auth/profile']);
				return false;
			})
			.catch(() => {
				return true;
			});
	}
}
