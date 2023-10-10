import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {KenticoButtonComponent} from './kentico-button/kentico-button.component';
import {CommonModule} from '@angular/common';
import { DonationPortalComponent } from './donation-portal/donation-portal.component';
import { SafePipe } from './safe-url-pipe/safe-url.pipe';

@NgModule({
	declarations: [
		KenticoButtonComponent,
		DonationPortalComponent,
		SafePipe
	],
	imports: [CommonModule, RouterModule],
	exports: [
		KenticoButtonComponent,
		DonationPortalComponent,
		SafePipe,
	]
})
export class HcCommonModule {}
