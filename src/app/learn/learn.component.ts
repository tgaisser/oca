import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {CourseDataService, PageLearn} from '../services/course-data.service';
import {startWith, tap} from 'rxjs/operators';
import {setNonCourseMetaTags} from '../common/helpers';
import {Meta} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
	selector: 'app-learn',
	templateUrl: './learn.component.html',
	styleUrls: ['./learn.component.less']
})
export class LearnComponent implements OnInit {
	pageLearn$: Observable<PageLearn> = this.dataService.getPageLearn().pipe(
		startWith({} as PageLearn),
		tap(p => {
			setNonCourseMetaTags(this.meta, p);
			// console.log('Learn Page:', p);
		})
	);

	constructor(
		private dataService: CourseDataService,
		private meta: Meta,
		public router: Router,
	) { }

	ngOnInit(): void { }

}
