import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpRoutingModule } from './help-routing.module';
import {ContactComponent} from './contact/contact.component';
import {FaqComponent} from './faq/faq.component';
import { HelpComponent } from './help.component';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';


@NgModule({
	declarations: [
		ContactComponent,
		FaqComponent,
		HelpComponent
	],
	imports: [
		CommonModule,
		HelpRoutingModule,
		HcPipesModule
	]
})
export class HelpModule { }
