import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Course, CourseDataService, PageDvdCatalog, PageHelp} from '../services/course-data.service';
import {Meta} from '@angular/platform-browser';
import {startWith, tap} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {selectDvdCatalogCourses} from '../state/courses/selectors';
import {State} from '../state';
import {courseListRequested} from '../state/courses/actions';
import {setNonCourseMetaTags} from '../common/helpers';

@Component({
	selector: 'app-dvd-catalog',
	templateUrl: './dvd-catalog.component.html',
	styleUrls: ['./dvd-catalog.component.less']
})
export class DvdCatalogComponent implements OnInit {
	pageDvdCatalog$: Observable<PageDvdCatalog> = this.dataService.getPageDvdCatalog().pipe(
		startWith({} as PageDvdCatalog),
		tap(p => {
			setNonCourseMetaTags(this.meta, p);
		})
	);

	constructor(
		private store: Store<State>,
		private dataService: CourseDataService,
		private meta: Meta,
	) {
		store.dispatch(courseListRequested());
	}

	ngOnInit() {
	}

}
