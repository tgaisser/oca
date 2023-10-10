import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
} from '@angular/common/http';
import {Inject, Injectable, Optional} from '@angular/core';
import Auth from '@aws-amplify/auth';
import {from, Observable} from 'rxjs';
import {catchError, flatMap} from 'rxjs/operators';

@Injectable()
export class AddCognitoAuthHeaderInterceptor implements HttpInterceptor {
	private authorizeUrlPatternRegex;

	constructor(@Inject('HC_AUTHORIZE_REQUESTS_TO_URLS_PATT') @Optional() authorizeUrlPatt: string) {
		this.authorizeUrlPatternRegex = new RegExp(authorizeUrlPatt || '.*');
	}

	/*
	 * Calling app should be able to inject "HC_AUTHORIZE_REQUESTS_TO_URLS_PATT".
	 * Any request that matches pattern have the auth header added (if available)
	 * Requests that don't match are passed through unmodified.
	 * If no value is injected all requests are checked.
	 */
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// if the request needs to be checked (URL matches and no existing auth header)
		if (this.authorizeUrlPatternRegex.test(req.url) && !req.headers.has('Authorization')) {

			// get current authorization session from Cognito Auth library
			return from(
				Auth.currentSession().catch(e => null) //get the current session or null if not logged in
			).pipe(
				flatMap(sess => {
					// get the access token (if available)
					// console.log('session', sess);
					//get the token (normally use the access token, but if the appropriate header is set, use the ID token.
					const authToken = sess && (!req.headers.has('X-HC-UserInfo') ? sess.getAccessToken() : sess.getIdToken());

					// if there is a token, add the header
					if (authToken) {
						// Clone the request to add the new header
						// Pass the cloned request instead of the original request to the next handle
						return next.handle(req.clone({headers: req.headers.set('Authorization', `Bearer ${authToken.getJwtToken()}`)}));
					} else {
						//no token or non-matched domain
						return next.handle(req);
					}
				}),
				// catchError(e => {
				// 	//Handle errors?
				// })
			);
		} else {
			//irrelevant requests get passed through
			return next.handle(req);
		}
	}
}
