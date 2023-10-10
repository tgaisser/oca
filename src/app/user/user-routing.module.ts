import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from './auth/auth.component';
import {SignInComponent} from './auth/sign-in/sign-in.component';
import {UnauthGuard} from '../guards/unauth.guard';
import {SignUpComponent} from './auth/sign-up/sign-up.component';
import {ChangePasswordComponent} from './auth/change-password/change-password.component';
import {AuthGuard} from '../guards/auth.guard';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {ConfirmCodeComponent} from './auth/confirm-code/confirm-code.component';
import {UserCourseListComponent} from './user-course-list/user-course-list.component';
import {EditProfileComponent} from './auth/edit-profile/edit-profile.component';
import {DiscourseSsoComponent} from './auth/discourse-sso/discourse-sso.component';
import {UserPreferencesComponent} from './auth/preferences/user-preferences.component';
import { SignUpPageComponent } from './auth/sign-up-page/sign-up-page.component';

const routes: Routes = [{
	path: '',
	component: AuthComponent,
	children: [
		{
			path: 'signin',
			component: SignInComponent,
			canActivate: [UnauthGuard],
			data: {
				title: 'Sign In',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		},
		{
			path: 'signup',
			component: SignUpPageComponent,
			canActivate: [UnauthGuard],
			data: {
				title: 'Sign Up',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		},
		{
			path: 'change-password',
			component: ChangePasswordComponent,
			canActivate: [AuthGuard],
			data: {
				title: 'Change Password',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		},
		{
			path: 'forgot-password',
			component: ForgotPasswordComponent,
			canActivate: [UnauthGuard],
			data: {
				title: 'Forgot password',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		},
		{
			path: 'confirm',
			component: ConfirmCodeComponent,
			canActivate: [UnauthGuard],
			data: {
				title: 'Confirm Email',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		},
		{
			path: 'courses',
			component: UserCourseListComponent,
			canActivate: [AuthGuard],
			data: {
				title: 'My Courses',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		},
		{
			path: 'profile',
			component: EditProfileComponent,
			canActivate: [AuthGuard],
			data: {
				title: 'Account Information',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		},
		{
			path: 'preferences',
			component: UserPreferencesComponent,
			canActivate: [AuthGuard],
			data: {
				title: 'User Preferences',
				description: 'Update your preferences to for the Online Courses app',
			}
		},
		{
			path: 'discourse',
			component: DiscourseSsoComponent,
			canActivate: [AuthGuard],
			data: {
				title: 'Discussion Board Login',
				description: 'Free courses taught by Hillsdale College faculty to pursue knowledge of the highest things, form character, and defend constitutional government.',
			}
		}
	]
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserRoutingModule {
}
