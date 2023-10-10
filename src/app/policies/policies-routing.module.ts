import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PoliciesComponent} from './policies.component';

const routes: Routes = [{
	path: '',
	component: PoliciesComponent,
	data: {
		title: 'Policies',
		// description: handled in component
	}
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PoliciesRoutingModule {
}
