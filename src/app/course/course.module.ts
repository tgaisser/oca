import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CourseRoutingModule} from './course-routing.module';
import {CommonCourseModule} from '../common/course/common-course.module';
import {CourseDonateLinksComponent} from './course-donate-links/course-donate-links.component';
import {FinalQuizComponent} from './final-quiz/final-quiz.component';
import {LectureComponent} from './lecture/lecture.component';
import {LessonComponent} from './lesson/lesson.component';
import {QAComponent} from './qa/qa.component';
import {QuizComponent} from './quiz/quiz.component';
import {SocialShareComponent} from './social-share/social-share.component';
import {CourseComponent, CourseNotesComponent} from './course.component';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';
import {AngularEditorModule} from '@kolkov/angular-editor';
import {NgxJsonLdModule} from '@ngx-lite/json-ld';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonsModule} from 'ngx-bootstrap/buttons';

import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';


@NgModule({
	declarations: [
		CourseDonateLinksComponent,
		FinalQuizComponent, //TODO split??,
		LectureComponent,
		LessonComponent,
		QAComponent,
		QuizComponent,
		SocialShareComponent,
		CourseComponent,
		CourseNotesComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		CommonCourseModule,
		HcPipesModule,
		CourseRoutingModule,
		AngularEditorModule,
		FontAwesomeModule,
		NgxJsonLdModule,
		ButtonsModule,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CourseModule {
}
