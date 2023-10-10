import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UserRoutingModule} from './user-routing.module';
import {CommonCourseModule} from '../common/course/common-course.module';
import {AuthComponent} from './auth/auth.component';
import {ViewProfileComponent} from './view-profile/view-profile.component';
import {ConfirmUserUnenrollComponent, UserCourseListComponent} from './user-course-list/user-course-list.component';
import {CourseProgressComponent} from './user-course-list/course-progress/course-progress.component';
import {ChangePasswordComponent} from './auth/change-password/change-password.component';
import {ConfirmCodeComponent} from './auth/confirm-code/confirm-code.component';
import {DiscourseSsoComponent} from './auth/discourse-sso/discourse-sso.component';
import {EditProfileComponent} from './auth/edit-profile/edit-profile.component';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {PasswordValidateListComponent} from './auth/password-validate-list/password-validate-list.component';
import {SignInComponent} from './auth/sign-in/sign-in.component';
import {SignUpComponent} from './auth/sign-up/sign-up.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SubjectPreferenceComponent } from './auth/sign-up/subject-preference.component';
import {HcFormHelpersModule, HcPipesModule} from 'hillsdale-ng-helper-lib';

import {NgxMaskModule} from 'ngx-mask';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {UserPreferencesComponent} from './auth/preferences/user-preferences.component';
import { SignUpPageComponent } from './auth/sign-up-page/sign-up-page.component';


@NgModule({
	declarations: [
		AuthComponent,
		ChangePasswordComponent,
		ConfirmCodeComponent,
		ConfirmUserUnenrollComponent,
		CourseProgressComponent,
		DiscourseSsoComponent,
		EditProfileComponent,
		UserPreferencesComponent,
		ForgotPasswordComponent,
		PasswordValidateListComponent,
		SignInComponent,
		SubjectPreferenceComponent,
		SignUpComponent,
		SignUpPageComponent,
		UserCourseListComponent,
		ViewProfileComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		HcFormHelpersModule,
		HcPipesModule,
		CommonCourseModule,
		FontAwesomeModule,
		NgxMaskModule.forRoot(),
		UserRoutingModule,
		RouterModule,
	],
	exports: [
		SignUpComponent,
		SignInComponent,
	]
})
export class UserModule {
}
