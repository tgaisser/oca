import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

import {defineCustomElements} from 'hc-video-player';

import '@egjs/hammerjs';

/*** Amplify Configuration ***/
import Auth from '@aws-amplify/auth';
Auth.configure({
	region: 'us-east-1',
	userPoolId: environment.cognitoPoolId,
	userPoolWebClientId: environment.cognitoClientId,
	authenticationFlowType: 'USER_PASSWORD_AUTH',
	oauth: {
		domain: environment.cognitoDomain,
		scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
		redirectSignIn: environment.cognitoRedirectUrl,
		redirectSignOut: environment.cognitoRedirectUrl,
		responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
	}
});
/**** End Amplify Configuration ****/

if (environment.production) {
	enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
	platformBrowserDynamic().bootstrapModule(AppModule)
		.catch(err => console.error(err));
});
defineCustomElements();
