import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CourseSubjectFilterPipe} from './course-subject-filter.pipe';
import {InstructorNamePipe} from './instructor-name.pipe';
import {QuizBlankPipe} from './quiz-blank.pipe';
import {InstructorComponent} from './instructor/instructor.component';
import {EnrolledProgressPieChartComponent} from './enrolled-progress-pie-chart/enrolled-progress-pie-chart.component';
import {CourseCatalogEntryComponent} from './course-catalog-entry/course-catalog-entry.component';
import {CompleteCertButtonComponent} from './complete-cert-button/complete-cert-button.component';
import {AudioPlayerComponent} from './audio-player/audio-player.component';
import {RouterModule} from '@angular/router';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';
import {CtaComponent} from './cta/cta.component';
import {AttributionsComponent} from './attributions/attributions.component';
import {CreativeCreditComponent} from './creative-credit/creative-credit.component';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {DurationPipe} from './duration.pipe';
import {IntroTextUniformStylePipe, IntroTextWithBreakPipe} from '../intro-text-pipe/intro-text.pipe';
import {NextCourseComponent} from './next-course/next-course.component';


@NgModule({
	declarations: [
		CourseSubjectFilterPipe,
		InstructorNamePipe,
		QuizBlankPipe,
		InstructorComponent,
		EnrolledProgressPieChartComponent,
		CourseCatalogEntryComponent,
		CompleteCertButtonComponent,
		AudioPlayerComponent,
		CtaComponent,
		AttributionsComponent,
		CreativeCreditComponent,
		DurationPipe,
		NextCourseComponent,
		IntroTextUniformStylePipe,
		IntroTextWithBreakPipe,
	],
	imports: [
		HcPipesModule,
		CommonModule,
		FontAwesomeModule,
		HttpClientModule,
		RouterModule,
	],
	exports: [
		CourseSubjectFilterPipe,
		InstructorNamePipe,
		QuizBlankPipe,
		InstructorComponent,
		EnrolledProgressPieChartComponent,
		CourseCatalogEntryComponent,
		CompleteCertButtonComponent,
		AudioPlayerComponent,
		CtaComponent,
		AttributionsComponent,
		CreativeCreditComponent,
		DurationPipe,
		NextCourseComponent,
		IntroTextUniformStylePipe,
		IntroTextWithBreakPipe
	]
})
export class CommonCourseModule {
}
