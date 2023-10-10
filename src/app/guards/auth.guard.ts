import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment} from '@angular/router';
import Auth from '@aws-amplify/auth';
import {Store} from '@ngrx/store';
import {State} from '../state';
import * as userActions from '../state/user/actions';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private _router: Router, private store: Store<State>) {
	}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		return Auth.currentAuthenticatedUser()
			.then(() => {
				return true;
			})
			.catch(() => {
				//Save the currently URL they are trying to access and kick them to signup
				const queryParams = next.queryParams && Object.keys(next.queryParams) ?
					'?' + Object.keys(next.queryParams).map(k => `${k}=${encodeURIComponent(next.queryParams[k])}`).join('&') :
					'';
				const nextUrl =
					next.pathFromRoot.map(
						(p : ActivatedRouteSnapshot) => p.url.map((u : UrlSegment) => u.path).join('/')
					)
						.join('/')
						.replace(/\/\/+/, '/') //replace two or more forward slashes with a single one
					+ queryParams;
				if (nextUrl) {
					this.store.dispatch(userActions.userSetPostLoginUrl({url: nextUrl}));
				}
				this._router.navigate(['auth/signin']).then();

				//reject the access
				return false;
			});
	}
}
