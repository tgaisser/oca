import { Component, OnInit } from '@angular/core';
import { PagePolicies, CourseDataService } from '../services/course-data.service';
import {Observable} from 'rxjs';
import { Meta } from '@angular/platform-browser';
import {startWith, tap} from 'rxjs/operators';
import {setNonCourseMetaTags} from '../common/helpers';

@Component({
	selector: 'app-policies',
	templateUrl: './policies.component.html',
	styleUrls: ['./policies.component.less']
})
export class PoliciesComponent implements OnInit {
	pagePolicies$: Observable<PagePolicies> = this.dataService.getPagePolicies().pipe(
		startWith({} as PagePolicies),
		tap(p => {
			setNonCourseMetaTags(this.meta, p);
		})
	);

	constructor( private dataService: CourseDataService, private meta: Meta) { }

	ngOnInit() { }
}
