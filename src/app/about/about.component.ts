import {Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import {PageAbout, CourseDataService, PageDvdCatalog} from '../services/course-data.service';
import {DomSanitizer, Meta } from '@angular/platform-browser';
import {startWith, tap} from 'rxjs/operators';
import {setNonCourseMetaTags} from '../common/helpers';
import {select, Store} from '@ngrx/store';
import {selectTestimonials} from '../state/courses/selectors';
import {State} from '../state';

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.less']
})
export class AboutComponent implements OnInit {
	testimonials$ = this.store.pipe(select(selectTestimonials(3)));
	public lifetimeOfLearningVideoSrc;

	pageAbout$: Observable<PageAbout> = this.dataService.getPageAbout().pipe(
		startWith({} as PageAbout),
		tap(p => {
			this.lifetimeOfLearningVideoSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(p.n4th_row_video_embed_url);
			setNonCourseMetaTags(this.meta, p);
		})
	);
	activeSlideIndex = 0;

	constructor(
		private dataService: CourseDataService,
		private meta: Meta,
		private store: Store<State>,
		public domSanitizer: DomSanitizer,
	) { }

	ngOnInit() {
	}

}

// This comment is being added to create a dummy commit for testing the pipeline.
