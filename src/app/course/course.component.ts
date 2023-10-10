import {Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Course, CourseDataService, CourseLecture, CourseStatus, StudyGroup, StudyGroupSession} from '../services/course-data.service';
import {filter, map, mergeMap, tap, withLatestFrom} from 'rxjs/operators';
import {DomSanitizer, Meta, SafeResourceUrl, Title} from '@angular/platform-browser';
import {select, Store} from '@ngrx/store';
import {State} from '../state';
import {selectCurrentCourseWithProgress, selectCurrentLesson, selectCurrentStudyGroup} from '../state/courses/selectors';
import {combineLatest, Observable, of, Subscription} from 'rxjs';
import {setCurrentCourse, setCurrentLesson} from '../state/courses/actions';
import * as notesSelectors from '../state/notes/selectors';
import * as notesActions from '../state/notes/actions';
import * as uiSelectors from '../state/ui/selectors';
import * as uiActions from '../state/ui/actions';
import {AngularEditorConfig} from '@kolkov/angular-editor';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {CourseProgress} from '../services/user.service';
import {environment} from '../../environments/environment';
import {DonationService} from '../donation/donation.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal'; //TODO ngx-bootstrap
import {DOCUMENT, KeyValue} from '@angular/common';
import {addMinutes, addSeconds, setCourseMetaTags, setVideo} from '../common/helpers';
import {WindowBehaviorService} from '../services/window-behavior.service';
import {IntroJsService} from '../services/intro-js.service';
import {MultimediaItem} from 'hc-video-player';
import {faPlay, faArrowLeft, faArrowRight, faSpinner, faPrint } from '@fortawesome/free-solid-svg-icons';
import {EARLY_ACCESS_TOKEN, HAS_PENDING_LEARN_SUBMISSION, VIDEO_PLAYER_TYPE_PREFERENCE} from '../common/constants';
import {CourseEnrollment, SESSION_STORAGE} from '../common/models';
import { Location } from '@angular/common';
import {UserDataService} from '../services/user-data.service';



@Component({
	selector: 'app-course',
	templateUrl: './course.component.html',
	styleUrls: ['./course.component.less']
})
export class CourseComponent implements OnInit, OnDestroy {

	@ViewChild('trailerVideo')
		trailerVideoRef: ElementRef<HTMLHcVideoPlayerElement>;

	faArrowLeft = faArrowLeft;
	faArrowRight = faArrowRight;
	faPlay = faPlay;
	faSpinner = faSpinner;

	playerPreference = VIDEO_PLAYER_TYPE_PREFERENCE;

	constructor(
		private route: ActivatedRoute,
		private store: Store<State>,
		private meta: Meta,
		private titleService: Title,
		private renderer: Renderer2,
		private donationService: DonationService,
		private modalService: BsModalService,
		@Inject(DOCUMENT) private document: Document,
		private windowBehaviorService: WindowBehaviorService,
		private introJs: IntroJsService,
		private sanitizer: DomSanitizer,
		private location: Location,
		private userDataService: UserDataService,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage
	) { }

	@ViewChild('sidebar') sidebar: ElementRef;
	hideTrailerOverlay = false;


	now = new Date();
	isStudyGroup = false;
	currentStudyGroupSession: StudyGroupSession;

	notesSubscription: Subscription;
	routeParamsSub: Subscription;
	queryParamsSub: Subscription;

	numLectures: number;
	numQuizzes: number;
	numFinalQuizzes: number;
	numCompletedLectures: number;
	numCompletedQuizzes: number;
	numCompletedFinalQuizzes: number;

	finalQuizProgress: CourseProgress;

	private currentCourseId: string;
	private currentLessonId: string;
	private currentLessonSlug: string;
	finalQuizEligible = false;

	numLecturesAvailableDuringPrereg = 1;

	sidebarStatus$ = this.store.pipe(select(uiSelectors.selectSidebarStatus));
	studyGroup$: Observable<StudyGroup> = this.store.pipe(
		select(selectCurrentStudyGroup),
		tap(g => {
			this.isStudyGroup = !!g;
		})
	);
	course$: Observable<Course> = this.store.pipe(
		select(selectCurrentCourseWithProgress),
		tap(c => {
			this.finalQuizEligible = this.checkFinalQuizEligibility(c);

			if (!c) return;
			this.numLecturesAvailableDuringPrereg = typeof(c.pre_reg_available_lectures) == "number" && c.pre_reg_available_lectures || 1;

			if (this.currentCourseId !== c.system_id) {
				// Place to init any course-specific donation asks
				// this.donationService.requestDonationAsk({
				// 	priority: 0,
				// 	displayType: 'bottom-bar',
				// 	donationBody: '<p>Test body donation ask.</p>',
				// 	donationButtons: [
				// 		{
				// 			buttonText: 'Donate',
				// 			buttonLink: 'https://secured.hillsdale.edu/hillsdale/support-online-courses/',
				// 			buttonTarget: '_blank'
				// 		}
				// 	],
				// 	openTimeout: 1000,
				// 	closeTimeout: null,
				// 	closeOnRouteChange: false
				// });

				if(CourseDataService.userHasAccessToFullCourse(c) === false)
					this.displayCoursePublicationDate = true;

				// Update the page title to with the Course title
				this.titleService.setTitle('Course - ' + this.simpleMdPipe.transform(c.title, 'plaintext') + ' | Hillsdale College Online Courses');
				setCourseMetaTags(c, this.meta, this.simpleMdPipe, this.windowBehaviorService.getCurrentUrl());

				this.schema = {
					'@context': 'http://schema.org',
					'@type': 'Course',
					name: this.simpleMdPipe.transform(c.title, 'plaintext'),
					description: c.meta_description,
					provider: {
						'@type': 'CollegeOrUniversity',
						name: 'Hillsdale College Online Courses',
						url: 'https://online.hillsdale.edu/'
					}
				};
			}

			//set the current course caching ID
			this.currentCourseId = c.system_id;
			// console.log('Course:', c);

			if (c.progress && c.progress.children) {
				this.numCompletedLectures = c.progress.children.filter(i => i.itemType === 'Lecture' && i.completed).length;
				this.numCompletedQuizzes = c.progress.children.filter(i => i.itemType === 'Quiz' && i.completed).length;
				this.numCompletedFinalQuizzes = c.progress.children.filter(i => i.itemType === 'FinalQuiz' && i.completed).length;

				this.finalQuizProgress = c.progress.children.find(i => i.itemType === 'FinalQuiz');
			}

			// console.log('Final Quiz Progress:', this.finalQuizProgress);

			if (c.lectures) {
				this.numLectures = c.lectures.length;
				this.numQuizzes = c.lectures.filter(i => i.quiz).length;
				this.introJs.runIntroIfNeeded(!this.isStudyGroup ? 'course' : 'study-group');
			}

			if (c.final_quiz) {
				this.numFinalQuizzes = 1;
			}

			if (!c.userHasEarlyAccess && CourseDataService.isInEarlyAccessWindow(c)) {
				const eaToken = this.sessionStorage.getItem(EARLY_ACCESS_TOKEN);
				if (eaToken){
					this.userDataService.validateAndUpdateEarlyAccess(c.system_id, eaToken).subscribe((isEarlyAccessTokenValid) => {
						if (isEarlyAccessTokenValid) {
							this.hasValidEarlyAccessToken = true;
							this.allowAccessToLecture_cache = {};
							this.sessionStorage.removeItem(EARLY_ACCESS_TOKEN);
						}
					});
				}
			}
		})
	);
	courseAndStudyGroup$: Observable<{ course: Course, studyGroup: StudyGroup }> = combineLatest([this.course$, this.studyGroup$]).pipe(
		map(([course, studyGroup]) => ({course, studyGroup})),
		tap(currentInfo => {
			if (currentInfo.studyGroup && currentInfo.studyGroup.intro_video) {
				setVideo(this.trailerVideoRef, currentInfo.studyGroup.intro_video);
			}
		})
	);
	currentLesson$: Observable<CourseLecture> = this.store.pipe(
		select(selectCurrentLesson),
		tap(l => {
			if (!l) return; //Should this be a filter?
			this.currentLessonId = l.system_id;
			this.currentLessonSlug = l.url_slug;

			this.store.dispatch(notesActions.getNote({courseId: this.currentCourseId, lectureId: l.system_id})); //TODO move this to the notes effect
		}) //retrieve notes for current lesson
	);


	notesText = '';

	isCleanNotesSave = true;
	notesSaveStatus$ = this.store.pipe(
		select(notesSelectors.selectNotesSaveStatus),
		tap(() => this.isCleanNotesSave = true)
	);

	editorConfig: AngularEditorConfig = {
		editable: true,
		// spellcheck: true,
		// height: 'auto',
		minHeight: '200px',
		// maxHeight: 'auto',
		// width: 'auto',
		// minWidth: '0',
		sanitize: true,
		toolbarPosition: 'top',
	};

	discourseUrl = environment.discourseCategoryRootUrl;

	displayCoursePublicationDate = false;

	donationUrl = environment.defaultDonationUrl;

	private simpleMdPipe: HcSimpleMdPipe = new HcSimpleMdPipe();

	schema;

	livestreamChatUrl: SafeResourceUrl;

	hasValidEarlyAccessToken = false;

	allowAccessToLecture_cache: {[key: number]: boolean} = {};
	public allowAccessToLecture(course: Course, lectureIndex: number): boolean {
		if (typeof this.allowAccessToLecture_cache[lectureIndex] !== 'undefined'){
			return this.allowAccessToLecture_cache[lectureIndex];
		}
		let result: boolean;
		if (CourseDataService.hasPublicationDatePassed(course)) {
			result = true;
		} else if (CourseDataService.hasPreRegDatePassed(course) && lectureIndex < this.numLecturesAvailableDuringPrereg) {
			result = true;
		} else if (this.hasValidEarlyAccessToken || (CourseDataService.hasEarlyAccessDatePassed(course) && course.userHasEarlyAccess)) {
			result = true;
		} else {
			result = false;
		}

		this.allowAccessToLecture_cache[lectureIndex] = result;
		return result;
	}



	ngOnInit() {
		this.queryParamsSub = this.route.queryParams.pipe(
			filter(p => !!p),
		).subscribe((p) => {
			// remove the query params from the end of the URL
			const newState = window.location.href.replace(window.location.origin, '').replace(/\?.*$/, '');
			this.location.replaceState(newState);

			if (p.earlyAccessToken){
				this.sessionStorage.setItem(EARLY_ACCESS_TOKEN, p.earlyAccessToken);
			}
		},
		err => console.log('err', err)
		);

		// if we got the campaignId parameter, then get the details for that campaign
		this.routeParamsSub = this.route.params
			.pipe(
				map(p => ({ courseId: p.courseId, contentId: p.contentId })),
				filter(p => p.courseId),
				// flatMap(p => this.dataService.getCourseDetails(p.courseId).pipe(map(c => [c, p])))
				// flatMap(courseId => forkJoin(this.dataService.getCourseDetails(courseId), this.dataService.getCourseInstructors(courseId)))
			)
			.subscribe(
				params => {
					this.store.dispatch(setCurrentCourse({ currentCourse: params.courseId }));

					//TODO what if this isn't a lesson?
					if (params.contentId) this.store.dispatch(setCurrentLesson({ currentLesson: params.contentId }));
				},
				err => console.log('err', err)
			);

		this.notesSubscription = this.store.pipe(select(notesSelectors.selectLectureNotes)).subscribe(note => {
			// console.log('got new notes', note);
			if (!this.isCleanNotesSave) return; // we've added to the notes, so dont replace them (screws up cursor location)
			this.notesText = note;
		});
	}

	ngOnDestroy(): void {

		this.store.dispatch(setCurrentCourse({ currentCourse: null }));

		if (this.notesSubscription && !this.notesSubscription.closed) {
			this.notesSubscription.unsubscribe();
			this.notesSubscription = null;
		}

		if (this.routeParamsSub && !this.routeParamsSub.closed) {
			this.routeParamsSub.unsubscribe();
			this.routeParamsSub = null;
		}

		if (this.donationService.currentOptions && this.donationService.currentOptions.closeOnRouteChange) {
			this.donationService.softClose();
		}
	}

	updateActiveLesson(lesson: CourseLecture): void {
		console.log('Parent updating active lesson', lesson);
		this.store.dispatch(setCurrentLesson({ currentLesson: lesson.url_slug }));
	}

	toggleSidebar(sidebarIsOpen) {
		this.store.dispatch(sidebarIsOpen ? uiActions.closeSidebar() : uiActions.openSidebar());
	}

	trackLesson(index, item) {
		return item && item.system_id;
	}

	playTrailerVideo() {
		this.hideTrailerOverlay = true;

		this.trailerVideoRef.nativeElement?.play();
	}

	storeNotes() {
		this.isCleanNotesSave = false;

		this.store.dispatch(notesActions.saveNotes({courseId: this.currentCourseId, lectureId: this.currentLessonId, noteContent: this.notesText }));
	}

	getReleaseDateForCurrentUser(course: Course) {
		return CourseDataService.getAccessDateForCurrentUser(course);
	}

	checkFinalQuizEligibility(course) {
		// console.log('Course for iterating:', course);
		if (course && course.progress && course.progress.children) {
			this.numCompletedLectures = course.progress.children.filter(i => i.itemType === 'Lecture' && i.completed).length;
			this.numCompletedQuizzes = course.progress.children.filter(i => i.itemType === 'Quiz' && i.completed).length;

			const finalQuizEligIgnoreTypes = ['FinalQuiz', 'PreQuiz'];
			for (const child of course.progress.children) {
				if (!finalQuizEligIgnoreTypes.includes(child.itemType) && !child.completed) {
					// console.log('Child incomplete:', child);
					return false;
				}
			}

			// console.log("All children complete");
			return true;
		} else {
			// console.log("No progress found on course");
			return false;
		}
	}

	openOtherNotes() {
		this.modalService.show(
			CourseNotesComponent,
			{ initialState: { courseId: this.currentCourseId },
				class: 'modal-lg modal-dialog-centered modal-dialog-scrollable' }
		);
	}

	skipToSidebar() {
		this.sidebar.nativeElement.focus();
	}

	skipToCurrentLesson() {
		this.renderer.selectRootElement('#course-anchor--' + this.currentLessonSlug).focus();
	}

	getPodcastText(session: StudyGroupSession) {
		const date = typeof session.available_date === 'string' ? new Date(session.available_date) : session.available_date;
		return date.toLocaleDateString() + ' Podcast';
	}

	donateClicked($event: MouseEvent) {
		const donateUrl = $event.target && ($event.target as any).href;
		this.store.dispatch(uiActions.donateClicked({donateUrl}));
	}

	podcastDownloaded(url: string, courseId: string, podcastId: string) {
		this.store.dispatch(uiActions.audioDownloaded({
			url,
			courseId,
			lectureId: podcastId,
		}));
	}

	getSessionClass(course: Course, session: StudyGroupSession) {
		const classList = [];

		if (session.optional_lectures.length){
			// If it's a livestream, unlock session 15 minutes early
			if (addMinutes(session.available_date, -15) > this.now){
				classList.push('future');
			}

			const durationInSeconds = session.optional_lectures[0].multimedia?.duration || 0;
			const liveSessionComplete = addSeconds(session.available_date, durationInSeconds);

			// Mark 'started' for everyone during live session
			if (this.now > session.available_date && this.now < liveSessionComplete){
				classList.push('started');
			}

			// Mark 'completed' for everyone when the live session is done
			if (this.now > liveSessionComplete){
				classList.push('completed');
			}
		}else{
			if (session.available_date > this.now) {
				classList.push('future');
			}

			const lectures = course.lectures.filter(l => session.lecture_ids.includes(l.system_id));

			const stats = lectures.reduce((agg, l) => {
				const quizProg = l.quiz && l.quiz.progress || {completed: true, started: false};
				const lProg = l.progress || {completed: false, started: false};


				if (lProg.completed && quizProg.completed) {
					agg.completed++;
				}
				if (lProg.started || quizProg.started) {
					agg.started++;
				}

				return agg;
			}, {completed: 0, started: 0});

			if (stats.completed === lectures.length) {
				classList.push('completed');
			}

			if (stats.started > 0) {
				classList.push('started');
			}
		}

		return classList;
	}

	setStudySession(session: StudyGroupSession) {
		this.currentStudyGroupSession = session;
		const vimeoId = session.optional_lectures?.[0]?.multimedia.vimeo_id;
		if (!vimeoId) return;
		this.livestreamChatUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://vimeo.com/live-chat/' + vimeoId + '/');
	}

	stringifyMM(mm: MultimediaItem): string {
		return JSON.stringify(mm);
	}

}

@Component({
	selector: 'app-course-all-notes',
	host: { class: 'modal-content' },
	template: `
		<div class="modal-header">
			<h4 class="modal-title" id="modal-title">Course Notes</h4>
			<button type="button" class="close" aria-describedby="modal-title" (click)="modal.hide()">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="modal-body">
			<div *ngFor="let lecture of allNotes$ | async; index as i; last as isLast" class="note">
				<div class="row align-items-center mb-3">
					<div class="col-auto lesson-number">{{i + 1}}</div>
					<div class="col">
						<h5 class='lecture-title' [innerHTML]="lecture.title | hcSimpleMd"></h5>
					</div>
				</div>
				<div class="note-text" [innerHTML]="lecture.note" *ngIf="lecture.note; else noNote"></div>
				<ng-template #noNote><div class="no-notes">No notes yet</div></ng-template>
				<hr *ngIf="!isLast" class="my-5">
			</div>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-primary" (click)="modal.hide()">Close</button>
			<button type="button" class="btn btn-primary" (click)="print()"><fa-icon [icon]="faPrint"></fa-icon> Print</button>
		</div>
	`,
	styles: [
		`
			.lecture-title { margin: 0; }
			.no-notes { font-family: monospace; }
			.note { margin-bottom: 25px; }
			.lesson-number { text-align: center; padding: 0 0 0 15px; }
		`,
	],
})
export class CourseNotesComponent implements OnInit, OnDestroy {
	@Input()
		courseId: string;
	constructor(public modal: BsModalRef, private store: Store<State>, @Inject(DOCUMENT) private document: Document) {}

	faPrint = faPrint;

	allNotes$ = this.store.pipe(select(notesSelectors.selectCourseNotes));

	ngOnInit() {
		this.store.dispatch(notesActions.getNotes({courseId: this.courseId}));
		this.document.body.className += ' modal-only';
	}

	ngOnDestroy(): void {
		this.document.body.className = this.document.body.className.replace(/(\s|^)modal-only(\s|$)/, '');
	}

	print() {
		(this.document.defaultView || {print: () => {}}).print();
	}


}
