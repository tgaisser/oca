import {Component, OnInit} from '@angular/core';
import {CourseDataService, PageHelp} from '../../services/course-data.service';
import {Observable} from 'rxjs';
import { Meta } from '@angular/platform-browser';
import {startWith, tap} from 'rxjs/operators';
import {setNonCourseMetaTags} from '../../common/helpers';

@Component({
	selector: 'app-faq',
	templateUrl: './faq.component.html',
	styleUrls: ['./faq.component.less'],
})
export class FaqComponent implements OnInit {
	pageHelp$: Observable<PageHelp> = this.dataService.getPageHelp().pipe(
		startWith({} as PageHelp),
		tap(p => {
			setNonCourseMetaTags(this.meta, p);
		})
	);

	constructor(
		private dataService: CourseDataService,
		private meta: Meta,
	) { }

	ngOnInit() {

	}
}
