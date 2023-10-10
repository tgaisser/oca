import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSerializer, DefaultUrlSerializer, UrlTree } from '@angular/router';
import { CourseCatalogComponent } from './course-catalog/course-catalog.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { EnrolledGuard } from './guards/enrolled.guard';
import { StudyGroupComponent } from './study-group/study-group.component';
import { PartnershipComponent } from './partnership/partnership.component';
import { CourseListComponent } from './course-list/course-list.component';
import { TvAdComponent } from './tv-ad/tv-ad.component';
import { TvAdExtendedComponent } from './tv-ad-extended/tv-ad-extended.component';

// Custom URL serializer for case-insensitive partnerId
class LowerCasePartnerIdUrlSerializer extends DefaultUrlSerializer {
	parse(url: string): UrlTree {
		// Convert the partnerId segment to lowercase
		url = url.replace(/(\/(?:partner|pages)\/[^\/]+)/gi, (match) => {
			return match.toLowerCase();
		});
		return super.parse(url);
	}
}

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: CourseCatalogComponent,
		data: {
			title: '',
			// description: handled in component
		},
	},
	{
		path: 'course-list',
		component: CourseListComponent,
		data: {
			external: false,
		}
	},
	{
		path: 'landing/chemistry/prereg',
		redirectTo: 'landing/chemistry',
		pathMatch: 'full'
	},
	{
		path: 'landing/ancient-christianity/prereg',
		redirectTo: 'landing/ancient-christianity',
		pathMatch: 'full'
	},
	{
		path: 'landing/:courseId/:pageVersion',
		component: LandingPageComponent,
		// canActivate: [EnrolledGuard],
		data: {
			requiredEnrollmentStatus: false, //tell enrolled guard to only allow if NOT enrolled
			external: false,
		}
	},
	{
		path: 'landing/:courseId',
		component: LandingPageComponent,
		// canActivate: [EnrolledGuard],
		data: {
			requiredEnrollmentStatus: false, //tell enrolled guard to only allow if NOT enrolled
			external: false,
		}
	},
	{
		path: 'prereg/:courseId',
		component: LandingPageComponent,
		// canActivate: [EnrolledGuard],
		data: {
			requiredEnrollmentStatus: false, //tell enrolled guard to only allow if NOT enrolled
			external: false,
		}
	},
	{
		path: 'register/:courseId',
		component: LandingPageComponent,
		data: {
			requiredEnrollmentStatus: false,
			external: false,
		}
	},
	{
		path: 'study-group/:courseId',
		component: StudyGroupComponent,
		data: {
			external: false,
		}
	},
	{
		path: 'partner/ffroa',
		redirectTo: '/',
		pathMatch: 'full'
	},
	{
		path: 'pages/ffroa',
		redirectTo: '/',
		pathMatch: 'full'
	},
	{
		path: 'partner/:partnerId',
		redirectTo: 'pages/:partnerId',
		pathMatch: 'prefix'
	},
	{
		path: 'pages/:partnerId',
		component: PartnershipComponent,
		data: {
			external: true,
		}
	},
	{
		path: 'tv/:tvAdId',
		component: TvAdComponent,
		data: {
			external: true,
		}
	},
	{
		path: 'ltv/:tvAdExtId',
		component: TvAdExtendedComponent,
		data: {
			external: true,
		}
	},
	{
		path: 'courses',
		loadChildren: () => import('./course/course.module').then(r => r.CourseModule),
	},
	{
		path: 'dvd-catalog',
		loadChildren: () => import('./dvd-catalog/dvd-catalog.module').then(r => r.DvdCatalogModule),
	},
	{
		path: 'faq',
		redirectTo: '/help/faq',
		pathMatch: 'full'
	},
	{
		path: 'help',
		loadChildren: () => import('./help/help.module').then(r => r.HelpModule),
	},
	{
		path: 'about',
		loadChildren: () => import('./about/about.module').then(r => r.AboutModule),
	},
	{
		path: 'learn',
		loadChildren: () => import('./learn/learn.module').then(r => r.LearnModule),
	},
	{
		path: 'policies',
		loadChildren: () => import('./policies/policies.module').then(r => r.PoliciesModule),
	},
	{
		path: 'profile',
		//component: ViewProfileComponent,
		//canActivate: [AuthGuard]
		redirectTo: 'auth/profile',
	},
	{
		path: 'auth',
		loadChildren: () => import('./user/user.module').then(r => r.UserModule),
	},
	{
		path: '**',
		redirectTo: '/'
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			scrollPositionRestoration: 'enabled',
			anchorScrolling: 'enabled',
			relativeLinkResolution: 'legacy',
			initialNavigation: 'enabledBlocking'
		})
	],
	exports: [RouterModule],
	providers: [
		{ provide: UrlSerializer, useClass: LowerCasePartnerIdUrlSerializer }
	]
})
export class AppRoutingModule { }
