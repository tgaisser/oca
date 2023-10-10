import {ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {Course, CourseDataService, CourseSubject, PageHome, PagePolicies} from '../services/course-data.service';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {State} from '../state';
import {selectAllCourses, selectCourseSubjects, selectTestimonials} from '../state/courses/selectors';
import {User, UserService} from '../services/user.service';
import {selectCurrentUser} from '../state/user/selectors';
import {map, startWith, tap} from 'rxjs/operators';
import {DomSanitizer, Meta, SafeResourceUrl} from '@angular/platform-browser';
import {courseListRequested} from '../state/courses/actions';
import {selectHomepage} from '../state/ui/selectors';
import {getHomePage} from '../state/ui/actions';
import {setNonCourseMetaTags} from '../common/helpers';
import {DOCUMENT} from '@angular/common';
import {WindowBehaviorService} from '../services/window-behavior.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from 'ngx-toastr';

@Component({
	selector: 'app-courses',
	templateUrl: './course-catalog.component.html',
	styleUrls: ['./course-catalog.component.less']
})
export class CourseCatalogComponent implements OnInit {
	@ViewChild('featuredSlider') featuredSlider: ElementRef;
	welcomeVideoEmbedUrl: SafeResourceUrl;
	welcomeVideoEmbedUrlSignedIn: SafeResourceUrl;
	introductionVideoEmbedUrl: SafeResourceUrl;
	announcementVideoEmbedUrl: SafeResourceUrl;

	environment = environment;
	blogFeed: any;

	pageHome$: Observable<PageHome> = this.store.pipe(
		select(selectHomepage),
		tap(p => {
			// console.log('Home page:', p);
			if (p.welcome_video_embed_url) {
				this.welcomeVideoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(p.welcome_video_embed_url);
			}
			if (p.welcome_video_embed_url__signed_in_) {
				this.welcomeVideoEmbedUrlSignedIn = this.sanitizer.bypassSecurityTrustResourceUrl(p.welcome_video_embed_url__signed_in_);
			}
			if (p.introduction_video_embed_url) {
				this.introductionVideoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(p.introduction_video_embed_url);
			}
			if (p.announcement_video_embed_url) {
				this.announcementVideoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(p.announcement_video_embed_url);
			}
			setNonCourseMetaTags(this.meta, p);
		})
	);
	courses$: Observable<Course[]> = this.store.pipe(select(selectAllCourses));
	enrolledCourse$: Observable<Course[]> = this.courses$.pipe(
		map(courses =>
			courses
				//TODO handle early access
				.filter(i => i.enrolled && i.progress && !i.progress.completed && !CourseDataService.courseIsPreEnroll(i))
				.sort((a, b) => {
					if (!a.progress.lastActivityDate) return -1;
					if (!b.progress.lastActivityDate) return 1;
					return  b.progress.lastActivityDate.localeCompare(a.progress.lastActivityDate);
				})
				// .sort((a, b) => b.progress.progressPercentage - a.progress.progressPercentage)
				.slice(0, 3) //only pull first (max) 3
		)
	);
	user$: Observable<User> = this.store.pipe(
		select(selectCurrentUser),
		tap(u => {
			this.isLoggedIn = !!u;
			// console.log('Is Logged In:', this.isLoggedIn);
		})
	);

	testimonials$ = this.store.pipe(select(selectTestimonials(5)));
	activeSlideIndex = 0;

	isLoggedIn = false;
	selectedSubject = 'all';

	signupForm: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.email, Validators.required]),
	});
	signupForm2: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.email, Validators.required]),
	});

	constructor(
		private dataService: CourseDataService, private meta: Meta,
		private store: Store<State>, @Inject(DOCUMENT) private document: Document,
		private windowBehaviorService: WindowBehaviorService,
		private router: Router,
		private sanitizer: DomSanitizer,
		private http: HttpClient,
		private userService: UserService,
		private toastr: ToastrService,
		private cdr: ChangeDetectorRef,
	) {
		store.dispatch(courseListRequested());
		store.dispatch(getHomePage());

		this.retrieveBlogFeedJSON(environment.blogJsonFeedUrl);
	}

	ngOnInit() {
	}

	newCourses(courses: Course[]) {
		return courses.slice()
			.sort((a, b) => a.publication_date < b.publication_date ? 1 : (a.publication_date === b.publication_date ? 0 : -1))
			.slice(0, 3);
	}

	// hasSubjects() {
	// 	return Object.keys(this.selectedSubjects)
	// 		.map(k => this.selectedSubjects[k])
	// 		.filter(k => k)
	// 		.length > 0;
	// }

	hasEnrolled(courses: Course[]) {
		return courses.some(i => i.enrolled);
	}

	routeToSignup(form) {
		this.userService.isUsernameAvailable(form.getRawValue().email).subscribe(isAvailable => {
			if (isAvailable) {
				this.router.navigate(['/', 'auth', 'signup'], {
					queryParams: { email: form.getRawValue().email },
					queryParamsHandling: 'merge'
				}).then(r => {
					if (!r) console.log('navigation failed');
				});
			} else {
				this.toastr.info('This email is connected to an existing account. Please sign in.');
				this.router.navigate(['/', 'auth', 'signin'], {
					queryParams: { email: form.getRawValue().email },
					queryParamsHandling: 'merge'
				}).then(r => {
					if (!r) console.log('navigation failed');
				});
			}
		});
	}

	moveSlider(distance) {
		this.featuredSlider.nativeElement.scrollTo({ left: (this.featuredSlider.nativeElement.scrollLeft + distance), behavior: 'smooth' });
	}

	retrieveBlogFeedJSON(url) {
		// console.log('retrieveBlogFeedJSON(url): ', url);
		this.http.get(url)
			.subscribe((data) => {
				// console.log('retrieveBlogFeedJSON() data: ', data);
				if (data) {
					this.blogFeed = data;
					// console.log('this.blogFeed before slice: ', this.blogFeed);
					this.blogFeed.items = this.blogFeed.items.slice(0, 4);
					// console.log('this.blogFeed after slice: ', this.blogFeed);
					this.cdr.detectChanges();
				}
			}
			);
	}
}
