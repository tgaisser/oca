import {
	BrowserModule,
	HammerGestureConfig,
	HAMMER_GESTURE_CONFIG,
	BrowserTransferStateModule
} from '@angular/platform-browser';
import {NgModule, Injectable, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AngularEditorModule} from '@kolkov/angular-editor';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {CourseCatalogComponent} from './course-catalog/course-catalog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastrModule} from 'ngx-toastr';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {NgxUiLoaderModule} from 'ngx-ui-loader';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {ModalModule} from 'ngx-bootstrap/modal';
import {CarouselModule} from 'ngx-bootstrap/carousel';

import {HcFormHelpersModule, HcPipesModule} from 'hillsdale-ng-helper-lib';
import {StoreModule} from '@ngrx/store';
import {reducers, metaReducers} from './state';
import {EffectsModule} from '@ngrx/effects';
import {UserEffects} from './state/user/effects';

import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

import {CookieService} from 'ngx-cookie-service';

import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {CourseEffects} from './state/courses/effects';
import {environment} from '../environments/environment';
import {AddCognitoAuthHeaderInterceptor} from './add-cognito-auth-header-interceptor';
import {EnrollmentEffects} from './state/enrollment/effects';
import {QuizEffects} from './state/quizzes/effects';
import {FeaturedCoursesComponent} from './featured-courses/featured-courses.component';
import {SidebarEffects} from './state/ui/effects';
import {NotesEffects} from './state/notes/effects';
import {AnalyticsEffects} from './state/analytics/effects';
import {StickyElementComponent} from './common/sticky-element/sticky-element.component';
import {BottomBarComponent} from './donation/bottom-bar/bottom-bar.component';
import {BannerComponent} from './donation/banner/banner.component';
import {ModalComponent} from './donation/modal/modal.component';

import {Angulartics2Module} from 'angulartics2';
import {StudyGroupComponent} from './study-group/study-group.component';
import {MatchingAccountsComponent} from './matching-accounts/matching-accounts.component';
import * as Hammer from '@egjs/hammerjs';
import {OfflineDbEffects} from './state/offline/effects';
import {LOCAL_STORAGE, SESSION_STORAGE} from './common/models';
import {CommonCourseModule} from './common/course/common-course.module';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {OnPlatformLandingPageContentsComponent} from './landing-page/detailed/detailed-landing-page-contents.component';
import {DefaultLandingPageContentsComponent} from './landing-page/default/default-landing-page-contents.component';
import {AltLayoutLandingPageContentsComponent} from './landing-page/alt-layout/alt-layout-landing-page-contents.component';
import {PreRegistrationLandingPageContentsComponent} from './landing-page/pre-registration/pre-registration-landing-page-contents.component';
import {QuotesLandingPageContentsComponent} from './landing-page/quotes/quotes-landing-page-contents.component';
import {TestimonialsLandingPageContentsComponent} from './landing-page/testimonials/testimonials-landing-page-contents.component';
import {TopRegistrationLandingPageContentsComponent} from './landing-page/top-registration/top-registration-landing-page-contents.component';
import {PartnershipComponent} from './partnership/partnership.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {RxNgZoneSchedulerModule} from 'ngx-rxjs-zone-scheduler';
import {AppUpdateEffects} from './state/app-update/effects';
import {CourseListComponent} from './course-list/course-list.component';
import {TvAdComponent} from './tv-ad/tv-ad.component';
import {SignInComponent} from './user/auth/sign-in/sign-in.component';
import {UserModule} from './user/user.module';
import { TvAdExtendedComponent } from './tv-ad-extended/tv-ad-extended.component';

@Injectable()
export class OcHammerConfig extends HammerGestureConfig {
	overrides = {
		swipe: {velocity: 0.4, threshold: 20, direction: Hammer.DIRECTION_HORIZONTAL}
	} as any;
}

@NgModule({
	declarations: [
		AppComponent,
		CourseCatalogComponent,

		//split to it's own module?
		LandingPageComponent,
		OnPlatformLandingPageContentsComponent,
		DefaultLandingPageContentsComponent,
		AltLayoutLandingPageContentsComponent,
		PreRegistrationLandingPageContentsComponent,
		QuotesLandingPageContentsComponent,
		TestimonialsLandingPageContentsComponent,
		TopRegistrationLandingPageContentsComponent,
		FeaturedCoursesComponent,
		StudyGroupComponent,

		StickyElementComponent,

		BottomBarComponent,
		BannerComponent,
		ModalComponent,
		MatchingAccountsComponent,
		PartnershipComponent,
		CourseListComponent,
		TvAdComponent,
		TvAdExtendedComponent,
	],
	entryComponents: [
		ModalComponent,
		MatchingAccountsComponent
	],
	imports: [
		BrowserModule.withServerTransition({appId: 'serverApp'}),
		BrowserTransferStateModule,
		BrowserAnimationsModule, // required animations module
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		HcFormHelpersModule,
		ToastrModule.forRoot(), // ToastrModule added
		NgxUiLoaderModule,
		ButtonsModule.forRoot(),
		ModalModule.forRoot(),
		CarouselModule.forRoot(),
		FontAwesomeModule,
		CommonCourseModule,
		HcPipesModule,
		RxNgZoneSchedulerModule,
		StoreModule.forRoot(reducers, {
			metaReducers,
			runtimeChecks: {
				strictStateImmutability: true,
				strictActionImmutability: true,
			}
		}),
		EffectsModule.forRoot([
			UserEffects,
			CourseEffects,
			EnrollmentEffects,
			SidebarEffects,
			NotesEffects,
			QuizEffects,
			AnalyticsEffects,
			OfflineDbEffects,
			AppUpdateEffects
		]),
		StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
		Angulartics2Module.forRoot(),
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: true, //environment.production,
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerImmediately',
			scope: environment.serviceWorkerScope
		}),
		UserModule,
	],
	providers: [
		CookieService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AddCognitoAuthHeaderInterceptor,
			multi: true,
		},
		{
			//handle only putting the auth tokens on requests to hillsdale resources
			provide: 'HC_AUTHORIZE_REQUESTS_TO_URLS_PATT',
			useValue: `${environment.dataStoreRoot}.*`, // 'https?://api-staging.hillsdale.edu/.*'
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: OcHammerConfig
		},
		{
			provide: LOCAL_STORAGE,
			useValue: typeof localStorage !== 'undefined' ? localStorage : null,
		},
		{
			provide: SESSION_STORAGE,
			useValue: typeof sessionStorage !== 'undefined' ? sessionStorage : null,
		},
	],
	bootstrap: [AppComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
