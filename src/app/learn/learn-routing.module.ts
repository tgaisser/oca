import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LearnComponent} from './learn.component';

const routes: Routes = [
	{
		path: '',
		component: LearnComponent,
		data: {
			title: 'Learn',
		},
	},
	{
		path: 'thank-you',
		component: LearnComponent,
		data: {
			title: 'Thank You',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LearnRoutingModule {
}
