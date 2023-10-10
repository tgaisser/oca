
import {ElementRef, OnInit, ViewChild, OnDestroy, Directive, Input} from '@angular/core';
import {Course, CourseDataService, CourseStatus} from '../services/course-data.service';
import { select, Store } from '@ngrx/store';
import { State } from '../state';
import * as enrollmentActions from '../state/enrollment/actions';
import * as userActions from '../state/user/actions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {setVideo} from '../common/helpers';
import {MultimediaItem} from 'hc-video-player';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import {VIDEO_PLAYER_TYPE_PREFERENCE} from '../common/constants';
import {UserService} from '../services/user.service';
import { selectTestimonials } from '../state/courses/selectors';

@Directive()
export class BaseLandingPageContentsComponentDirective implements OnDestroy, OnInit {
	@ViewChild('trailerVideo')
		trailerVideoRef: ElementRef<HTMLHcVideoPlayerElement>;

	@Input()
		pageVersion: string;

	faPlay = faPlay;
	playerPreference = VIDEO_PLAYER_TYPE_PREFERENCE;
	titleList = UserService.TITLE_LIST;

	anonymous_user = 'John Doe';
	testimonials$ = this.store.pipe(select(selectTestimonials(3)));

	@ViewChild('enrollForm') enrollForm: ElementRef;
	@ViewChild('enrollButton') enrollButton: ElementRef;

	_course: Course;
	@Input()
	get course() {return this._course; }
	set course(value) {
		if (value.course_trailer) {
			setVideo(this.trailerVideoRef, value.course_trailer);
			//this.loadVideo(value.course_trailer, false);
		}
		this._course = value;
	}

	@Input()
		userStatus: {isLoggedIn: boolean, shouldRenderDefaultLanding: boolean, email: string};


	@Input()
		earlyAccessToken: string = null;

	forceUnstuck = false;
	courseStatus: CourseStatus;

	hideTrailerOverlay = false;
	avgLectureDuration = '';

	enrollmentForm: FormGroup = new FormGroup({
		title: new FormControl(''),
		firstname: new FormControl(''),
		lastname: new FormControl(''),
		email: new FormControl('', [Validators.email, Validators.required]),
	});

	@Input()
		preEnrollmentActive = false;


	constructor(
		protected store: Store<State>,
	) {
	}

	ngOnInit() {
	}
	ngOnDestroy() {

	}

	logOut() {
		this.store.dispatch(userActions.userLogOutRequested());
	}

	playTrailerVideo() {
		this.hideTrailerOverlay = true;

		this.trailerVideoRef.nativeElement?.play().then();
	}

	enrollInCourse(course) {
		this.store.dispatch(enrollmentActions.enrollInCourseRequested({
			course,
			title: this.enrollmentForm.getRawValue().title,
			firstname: this.enrollmentForm.getRawValue().firstname,
			lastname: this.enrollmentForm.getRawValue().lastname,
			email: this.enrollmentForm.getRawValue().email,
		}));
	}

	scrollToEnroll() {
		this.enrollForm.nativeElement.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'nearest'
		});
	}

	getHeaderEnrollButtonText(userStatus: {isLoggedIn: boolean}) {
		if (this.earlyAccessToken) return 'Accept Early Access';
		if (this.preEnrollmentActive) return 'Pre-Enroll';
		return userStatus.isLoggedIn ? 'Enroll' : 'Start Learning';
	}

	getToEnrollText() {
		return !this.earlyAccessToken ? 'enroll in' : 'accept early access to';
	}

	getReleaseDate(course: Course) {
		return CourseDataService.getAccessDateWithDefault(course, !!this.earlyAccessToken);
	}

	stringifyMM(mm: MultimediaItem): string {
		return JSON.stringify(mm);
	}
}
