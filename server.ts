import 'zone.js/dist/zone-node';

import {ngExpressEngine} from '@nguniversal/express-engine';
import * as express from 'express';
import {join} from 'path';
import {createWindow} from 'domino';
import {existsSync, readFileSync} from 'fs';

// import * as sessionstorage from 'sessionstorage';
/*const storage = {
	getItem: key => null,
	setItem: () => {},
	clear: () => {},
	removeItem: key => null,
	length: 0,
};
// const template = readFileSync(join(process.cwd(), 'dist', 'browser', 'index.html')).toString();
// const win = createWindow(template) as any;
const win = {
	location: {hash: '', href: ''},
	scrollTo: () => {},
	pageYOffset: 0,
	document: {
		createElement: () => ({})
	},

} as any;
win.Map = Map;
win.sessionStorage = storage;
win.localStorage = storage;

global['sessionStorage'] = win.sessionStorage;

global['localStorage'] = win.localStorage;

global['window'] = win;*/

global['$'] = (selector) => {
	return {
		on: (handler) => {
		}
	};
};
/*
// win.document.prototype.
// Object.defineProperty(win.document, 'create', {value: '', writable: true});
Object.defineProperty(win.document, 'cookie', {value: '', writable: true});

global['document'] = win.document;
/*global['document'] = {
       ...global['document'],
//     cookie: '',
       createElement: () => ({
           classList: {
             toggle: () => {},
             contains: () => {}
        }
  }),
+};*/



import {AppServerModule} from './src/main.server';
import {APP_BASE_HREF} from '@angular/common';





// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
	const server = express();
	const distFolder = join(process.cwd(), 'dist/online-courses/browser');
	const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

	// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
	server.engine('html', ngExpressEngine({
		bootstrap: AppServerModule,
		inlineCriticalCss: true,
	}));

	server.set('view engine', 'html');
	server.set('views', distFolder);

	// Example Express Rest API endpoints
	// server.get('/api/**', (req, res) => { });
	// Serve static files from /browser
	server.get('*.*', express.static(distFolder, {
		maxAge: '1y'
	}));

	// All regular routes use the Universal engine
	server.get('*', (req, res) => {
		res.render(indexHtml, {req, providers: [{provide: APP_BASE_HREF, useValue: req.baseUrl}]});
	});

	return server;
}

function run(): void {
	const port = process.env.PORT || 4000;

	// Start up the Node server
	const server = app();
	server.listen(port, () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
	run();
}


export * from './src/main.server';
