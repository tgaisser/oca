import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import {Course} from '../services/course-data.service';
import { Store } from '@ngrx/store';
import { State } from '../state';
import { environment } from '../../environments/environment';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import { DatePipe } from '@angular/common';

import * as uiActions from '../state/ui/actions';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import {VIDEO_PLAYER_TYPE_PREFERENCE} from '../common/constants';

// eslint-disable-next-line no-var
declare var $;

@Component({
	selector: 'app-featured-courses',
	templateUrl: './featured-courses.component.html',
	styleUrls: ['./featured-courses.component.less']
})
export class FeaturedCoursesComponent implements OnInit {
	@Input() courses: Course[];

	// featuredCourses$: Observable<Course[]>;
	@ViewChild('trailerModalVideo')
		trailerModalVideoRef: ElementRef<HTMLHcVideoPlayerElement>;
	selectedMMString: string;

	faPlay = faPlay;

	playerPreference = VIDEO_PLAYER_TYPE_PREFERENCE;

	activeSlideIndex = 0;
	playerControlsDisabled = false;

	SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

	donationUrl = environment.defaultDonationUrl;

	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();
	private datePipe: DatePipe = new DatePipe('en-US');

	constructor(private store: Store<State>) {
		// this.featuredCourses$ = this.store.pipe(select(selectFeaturedCourses));

		$('body').on('hidden.bs.modal', '#trailerModal', e => {
			//console.log('Modal closed');
			this.trailerModalVideoRef.nativeElement?.pause().then();
		});
	}

	ngOnInit() {}

	getButtonText(course) {
		let buttonText = '';

		if (course.publication_date > new Date()) {
			buttonText = '<span class="sr-only">'
				+ this.simpleMdPipe.transform(course.title)
				+ ' </span>Coming '
				+ this.datePipe.transform(course.publication_date, 'M/d/yyyy');
		} else if (course.enrolled) {
			buttonText = 'Continue Learning<span class="sr-only"> about ' + this.simpleMdPipe.transform(course.title) + '</span>';
		} else {
			buttonText = 'Learn More<span class="sr-only"> about ' + this.simpleMdPipe.transform(course.title) + '</span>';
		}

		return buttonText;
	}

	loadTrailerVideo(course: Course) {
		this.selectedMMString = JSON.stringify(course.course_trailer);

		if (this.trailerModalVideoRef.nativeElement && course.course_trailer) {
			this.trailerModalVideoRef.nativeElement.multimedia = course.course_trailer;
		}
	}

	donateClicked($event: MouseEvent) {
		const donateUrl = $event.target && ($event.target as any).href;
		this.store.dispatch(uiActions.donateClicked({donateUrl}));
	}

	changeSlide(direction: string) {
		if (direction === 'prev') {
			if (this.activeSlideIndex > 0) {
				this.activeSlideIndex -= 1;
			} else {
				this.activeSlideIndex = this.courses.length - 1;
			}
		} else if (direction === 'next') {
			if (this.activeSlideIndex < this.courses.length - 1) {
				this.activeSlideIndex += 1;
			} else {
				this.activeSlideIndex = 0;
			}
		}
	}
}
