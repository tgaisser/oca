import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LearnRoutingModule} from './learn-routing.module';
import {LearnComponent} from './learn.component';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';
import {HcCommonModule} from '../common/common.module';
import {LandingComponent} from './landing/landing.component';
import {ThankYouComponent} from './thank-you/thank-you.component';
import {UserModule} from '../user/user.module';
import {CommonCourseModule} from '../common/course/common-course.module';


@NgModule({
	declarations: [
		LearnComponent,
		LandingComponent,
		ThankYouComponent,
	],
	imports: [
		CommonModule,
		HcPipesModule,
		LearnRoutingModule,
		HcCommonModule,
		CommonCourseModule,
		UserModule,
	]
})
export class LearnModule {
}
