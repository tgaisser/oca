/***************************************************************************************************
 * Initialize the server environment - for example, adding DOM built-in types to the global scope.
 *
 * NOTE:
 * This import must come before any imports (direct or transitive) that rely on DOM built-ins being
 * available, such as `@angular/elements`.
 */
import '@angular/platform-server/init';

import {enableProdMode} from '@angular/core';

import {environment} from './environments/environment';

/*** Amplify Configuration ***/
import {Auth} from 'aws-amplify';
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


// import {createWindow} from 'domino';
// import {existsSync, readFileSync} from 'fs';
// import {join} from 'path';
//
// import * as sessionstorage from 'sessionstorage';
// const template = readFileSync(join(process.cwd(), 'dist', 'browser', 'index.html')).toString();
// const win = createWindow(template) as any;
// win.Map = Map;
// win.sessionStorage = sessionstorage;
// win.localStorage = sessionstorage;

// global['sessionStorage'] = win.sessionStorage;

// global['localStorage'] = win.localStorage;

// global['window'] = win;
//
// Object.defineProperty(win.document, 'cookie', {value: '', writable: true});

// global['document'] = win.document;
// /*global['document'] = {
//        ...global['document'],
// //     cookie: '',
//        createElement: () => ({
//            classList: {
//              toggle: () => {},
//              contains: () => {}
//         }
//   }),
// +};*/


export {AppServerModule} from './app/app.server.module';
export {renderModule, renderModuleFactory} from '@angular/platform-server';
