import {Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../services/course-data.service';
import { filter, map, tap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { State } from '../state';
import * as enrollmentActions from '../state/enrollment/actions';
import * as userActions from '../state/user/actions';
import { selectCurrentCourse, selectTestimonials } from '../state/courses/selectors';
import {Observable, Subscription} from 'rxjs';
import { setCurrentCourse } from '../state/courses/actions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { selectCurrentUser } from '../state/user/selectors';
import { Title, Meta } from '@angular/platform-browser';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {STUDY_GROUP_COURSES, VIDEO_PLAYER_TYPE_PREFERENCE} from '../common/constants';
import {setCourseMetaTags, setVideo} from '../common/helpers';
import {WindowBehaviorService} from '../services/window-behavior.service';
import {MultimediaItem} from 'hc-video-player';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-study-group',
	templateUrl: './study-group.component.html',
	styleUrls: ['./study-group.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class StudyGroupComponent implements OnDestroy, OnInit, AfterViewInit {
	course$: Observable<Course>;
	userStatus$: Observable<{ isLoggedIn: boolean, email: string }>;
	@ViewChild('trailerVideo')
		trailerVideoRef: ElementRef<HTMLHcVideoPlayerElement>;

	@ViewChild('enrollForm') enrollForm: ElementRef;
	@ViewChild('enrollButton') enrollButton: ElementRef;

	anonymous_user = 'John Doe';
	testimonials$ = this.store.pipe(select(selectTestimonials(3)));

	paramsSub: Subscription;

	forceUnstuck = false;

	playerPreference = VIDEO_PLAYER_TYPE_PREFERENCE;

	faPlay = faPlay;

	hideTrailerOverlay = false;
	avgLectureDuration = '';

	enrollmentForm: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.email, Validators.required]),
	});

	preEnrollmentActive = false;

	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private store: Store<State>,
		private meta: Meta,
		private titleService: Title,
		private windowBehaviorService: WindowBehaviorService
	) {

		this.course$ = this.store.pipe(
			select(selectCurrentCourse),
			filter(c => !!c),
			tap(c => {
				console.log('got course');

				this.preEnrollmentActive = c.publication_date && c.publication_date > new Date();
				// console.log('Pre-enrollment -- Publication date:', c.publication_date);
				// console.log('Pre-enrollment -- Now:', new Date());
				// console.log('Pre-enrollment --', this.preEnrollmentActive);

				// Load Brightcove video trailer
				//this.loadTrailerVideo(c);
				if (c.course_trailer) {
					// console.log('about to call loadTimeout', c);
					setVideo(this.trailerVideoRef, c.course_trailer);
				}

				// Update the page title to with the Course title
				this.titleService.setTitle(this.simpleMdPipe.transform(c.title, 'plaintext') + ' Study Group | Hillsdale College Online Courses');
				setCourseMetaTags(c, this.meta, this.simpleMdPipe, this.windowBehaviorService.getCurrentUrl());
			})
		);

		this.userStatus$ = this.store.pipe(
			select(selectCurrentUser),
			map(u => ({
				isLoggedIn: !!u,
				email: (!!u ? u.email : '')
			}))
		);
	}

	ngOnInit() {
		// if we got the campaignId parameter, then get the details for that campaign
		// console.log(this.route);
		this.paramsSub = this.route.params
			.pipe(
				map(p => ({ courseId: p.courseId, contentId: p.contentId })),
				filter(p => p.courseId),
				tap(p => {
					// If this course is not part of Study Group, go to the Landing page instead
					if (!STUDY_GROUP_COURSES[p.courseId]) {
						this.router.navigate(['/landing', p.courseId]);
					}
					// console.log('course params', p);
				})
			)
			.subscribe(
				params => {
					this.store.dispatch(setCurrentCourse({ currentCourse: params.courseId }));
					// this.store.dispatch(setCurrentCourse({ currentCourse: 'the-great-american-story' }));
				},
				err => console.log('err', err)
			);
	}
	ngOnDestroy() {
		if (this.paramsSub && !this.paramsSub.closed) {
			this.paramsSub.unsubscribe();
			this.paramsSub = null;
		}
	}

	ngAfterViewInit() { }

	logOut() {
		this.store.dispatch(userActions.userLogOutRequested());
	}

	playTrailerVideo() {
		this.hideTrailerOverlay = true;

		this.trailerVideoRef.nativeElement?.play();
	}

	enrollInCourse(course: Course) {
		this.store.dispatch(enrollmentActions.enrollInCourseRequested({
			course,
			email: this.enrollmentForm.getRawValue().email,
			studyGroupId: STUDY_GROUP_COURSES[course.url_slug] ?? null
		}));
	}
	stringifyMM(mm: MultimediaItem): string {
		return JSON.stringify(mm);
	}
}
