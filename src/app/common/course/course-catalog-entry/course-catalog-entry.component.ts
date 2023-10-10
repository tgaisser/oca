import { Component, Input, OnInit } from '@angular/core';
import { Course, CourseDataService, StudyGroup } from '../../../services/course-data.service';
import { select, Store } from '@ngrx/store';
import { State } from '../../../state';
import { Observable } from 'rxjs';
import { getStudyGroupForCourseId } from '../../../state/courses/selectors';

@Component({
	selector: 'app-course-catalog-entry',
	templateUrl: './course-catalog-entry.component.html',
	styleUrls: ['./course-catalog-entry.component.less'],
	host: { class: 'course-catalog-entry' }
})
export class CourseCatalogEntryComponent implements OnInit {
	_catalogEntry: Course;
	@Input()
	get catalogEntry() { return this._catalogEntry; }
	set catalogEntry(val) {
		this._catalogEntry = val;
		if (val && val.system_id) {
			this.studyGroup$ = this.store.pipe(select(getStudyGroupForCourseId(val.system_id)));
		}
	}

	@Input() showSubjects = true;

	courseIsInPreRegistrationWindow = false;
	routerLink: string;

	studyGroup$: Observable<StudyGroup>;

	constructor(public store: Store<State>) { }

	ngOnInit() {
		this.courseIsInPreRegistrationWindow = this.catalogEntry && CourseDataService.isInPreRegWindow(this.catalogEntry);

		if (this.catalogEntry?.enrolled) {
			this.routerLink = `/courses/${this.catalogEntry?.url_slug}`;
		} else if (this.courseIsInPreRegistrationWindow) {
			this.routerLink = `/prereg/${this.catalogEntry?.url_slug}`;
		} else {
			this.routerLink = `/landing/${this.catalogEntry?.url_slug}`;
		}
	}

}
