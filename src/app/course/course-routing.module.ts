import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CourseComponent} from './course.component';
import {EnrolledGuard} from '../guards/enrolled.guard';
import {FinalQuizComponent} from './final-quiz/final-quiz.component';

const routes: Routes = [{
	path: ':courseId/final-quiz',
	component: FinalQuizComponent,
	canActivate: [EnrolledGuard],
	data: {
		requiredEnrollmentStatus: true
	}
},
{
	path: ':courseId',
	component: CourseComponent,
	canActivate: [EnrolledGuard],
	data: {
		requiredEnrollmentStatus: true,
		hasSidebar: true,
	} //tell enrolled guard to only allow if IS enrolled
},
	/*{
		path: '',
		pathMatch: 'full',
		redirectTo: '/'
	},*/];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CourseRoutingModule {
}
