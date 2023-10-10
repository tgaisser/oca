import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FaqComponent} from './faq/faq.component';
import {ContactComponent} from './contact/contact.component';
import {HelpComponent} from './help.component';

const routes: Routes = [{
	path: '',
	component: HelpComponent,
	children: [
		{
			path: 'faq',
			component: FaqComponent,
			data: {
				title: 'Frequently Asked Questions',
				// description: handled in component
			}
		},
		{
			path: 'contact',
			component: ContactComponent,
			data: {
				title: 'Contact Us',
				// description: handled in component
			}
		}
	]
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HelpRoutingModule { }
