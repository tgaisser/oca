import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AboutRoutingModule} from './about-routing.module';
import {AboutComponent} from './about.component';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import {HcCommonModule} from '../common/common.module';


@NgModule({
	declarations: [
		AboutComponent
	],
	imports: [
		CommonModule,
		HcPipesModule,
		AboutRoutingModule,
		CarouselModule,
		HcCommonModule,
	]
})
export class AboutModule {
}
