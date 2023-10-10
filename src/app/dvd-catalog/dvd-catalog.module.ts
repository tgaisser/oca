import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DvdCatalogRoutingModule} from './dvd-catalog-routing.module';
import {DvdCatalogComponent} from './dvd-catalog.component';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';


@NgModule({
	declarations: [
		DvdCatalogComponent,
	],
	imports: [
		CommonModule,
		HcPipesModule,
		DvdCatalogRoutingModule
	]
})
export class DvdCatalogModule {
}
