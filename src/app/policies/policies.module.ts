import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PoliciesRoutingModule} from './policies-routing.module';
import {PoliciesComponent} from './policies.component';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';


@NgModule({
	declarations: [
		PoliciesComponent
	],
	imports: [
		CommonModule,
		HcPipesModule,
		PoliciesRoutingModule
	]
})
export class PoliciesModule {
}
