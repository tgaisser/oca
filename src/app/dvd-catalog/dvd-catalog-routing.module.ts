import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DvdCatalogComponent} from './dvd-catalog.component';

const routes: Routes = [{
	path: '',
	component: DvdCatalogComponent,
	data: {
		title: 'DVD Catalog',
		// description: handled in component
	}
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DvdCatalogRoutingModule {
}
