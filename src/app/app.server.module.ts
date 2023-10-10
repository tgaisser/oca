import {NgModule} from '@angular/core';
import {ServerModule, ServerTransferStateModule} from '@angular/platform-server';

import {AppModule} from './app.module';
import {AppComponent} from './app.component';
import {ServerWindowTrackingService, WindowTrackingService} from './services/window-tracking.service';
import {ServerWindowBehaviorService, WindowBehaviorService} from './services/window-behavior.service';
import {IntroJsService, ServerIntroJsService} from './services/intro-js.service';
import {LOCAL_STORAGE, SESSION_STORAGE} from './common/models';
import {RxjsHelperService, ServerRxjsHelperService} from './services/rxjs-helper.service';
import {EffectsModule} from '@ngrx/effects';
import {CourseEffects} from './state/courses/effects';
import {SidebarEffects} from './state/ui/effects';
import {Angulartics2GoogleTagManager} from 'angulartics2';
import {AuthGuard} from './guards/auth.guard';
import {EnrolledGuard} from './guards/enrolled.guard';
import {BrowserModule} from '@angular/platform-browser';

const storage: Storage = {
	key: num => '',
	getItem: key => null,
	setItem: (key, val) => {},
	clear: () => {},
	removeItem: key => null,
	length: 0,
};

@NgModule({
	imports: [
		AppModule,
		ServerModule,
		ServerTransferStateModule,
		BrowserModule.withServerTransition({appId: 'serverApp'}),
		EffectsModule.forRoot([
			// UserEffects,
			CourseEffects,
			/*EnrollmentEffects,*/
			SidebarEffects,
			/*NotesEffects,
			QuizEffects,
			AnalyticsEffects,
			OfflineDbEffects,*/
		]),
	],
	providers: [
		{provide: RxjsHelperService, useClass: ServerRxjsHelperService},
		{provide: WindowTrackingService, useClass: ServerWindowTrackingService},
		{provide: WindowBehaviorService, useClass: ServerWindowBehaviorService},
		{provide: IntroJsService, useClass: ServerIntroJsService},
		{provide: Angulartics2GoogleTagManager, useValue: {
			startTracking: () => {}
		}
		},
		{
			provide: AuthGuard,
			useValue: {
				canActivate: () => Promise.resolve(false),
			}
		},
		{
			provide: EnrolledGuard,
			useValue: {
				canActivate: () => Promise.resolve(true),
			}
		},
		{ provide: LOCAL_STORAGE, useValue: storage },
		{ provide: SESSION_STORAGE, useValue: storage },
	],
	bootstrap: [AppComponent],
})
export class AppServerModule {
}
