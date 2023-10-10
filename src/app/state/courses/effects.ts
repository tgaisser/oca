
import {Injectable, NgZone} from '@angular/core';
import {Actions, createEffect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';
import {combineLatest, concat, concatAll, EMPTY, Observable, of, throttle} from 'rxjs';
import {catchError, filter, map, mergeMap, retry, switchMap, tap, throttleTime, withLatestFrom} from 'rxjs/operators';
import * as actions from './actions';
import {courseOpened, setCurrentLesson, setGeneralTestimonials, VideoPostInfo} from './actions';
import * as userActions from '../user/actions';
import {CourseDataService} from '../../services/course-data.service';
import {Action, select, Store} from '@ngrx/store';
import {State} from '../index';
import {getCurrentCourse, selectCurrentCourse, selectMultimediaDetails} from './selectors';
import {UserDataService} from '../../services/user-data.service';
import {onlyIfUserLoggedIn} from '../../common/helpers';
import {RxjsHelperService} from '../../services/rxjs-helper.service';
import {RxNgZoneScheduler} from 'ngx-rxjs-zone-scheduler';
import {saveVideoPostInfo} from '../offline/actions';
import {AltVideoResolutions} from '../../common/models';
import {userActivity} from '../app-update/actions';

const MAX_TESTIMONIALS = 100;

@Injectable()
export class CourseEffects {

	//load available multimedia items
	initialize$ = createEffect(() => this.actions$.pipe(
		ofType(ROOT_EFFECTS_INIT),
		map(() => actions.getStudyGroups())
	));
	//load available multimedia items
	initialize2$ = createEffect(() => this.actions$.pipe(
		ofType(ROOT_EFFECTS_INIT),
		map(() => actions.getMultimedia())
	));
	//load available multimedia items
	initializeTestimonials$ = createEffect(() => this.actions$.pipe(
		ofType(ROOT_EFFECTS_INIT),
		mergeMap(() => this.courseData.getKenticoObjects({
			limit: MAX_TESTIMONIALS,
			type: 'testimonial',
			elementQueries: {'referenced_course_id[empty]': ''}
		})),
		map(testimonials => setGeneralTestimonials({testimonials})),
		catchError(() => EMPTY)
	));

	//TODO with current course retrieval, do we still need two calls?
	getCourses$ = createEffect(() => this.actions$.pipe(
		ofType(actions.courseListRequested),
		this.rxjsHelper.throttle(90 * 1000, this.zoneScheduler.leaveNgZone()), //only run at most every minute and a half
		mergeMap(action =>
			this.courseData.getKenticoObjects({depth: 0, type: 'course'}).pipe(
				retry(2),
				tap(success => { }),
				map(result => actions.courseListReceived({courses: result})),
				catchError(err => {
					console.error('error with getKenticoObjects({depth: 0, type: \'course\'})', err);
					return EMPTY;
				}) //of(courseActions.userLoginError({message: 'An error occurred during login.'})))
			))
	)
	);

	getStudyGroups$ = createEffect(() => this.actions$.pipe(
		ofType(actions.getStudyGroups),
		this.rxjsHelper.throttle(90 * 1000, this.zoneScheduler.leaveNgZone()), //only run at most every minute and a half
		mergeMap(action => {

			//calculate start/end dates for group. This should be the first day this month and the first day of two months from now
			//e.g. on both 2/1/2022 and 2/25/2022 would be 2/1/2022 and 4/1/2022, 6/15/2022 would be 6/1/2022 and 8/1/2022, etc.
			const minStart = new Date();
			minStart.setUTCHours(0, 0, 0, 0);
			minStart.setUTCMonth(minStart.getUTCMonth() + 2);
			minStart.setUTCDate(1);

			const maxEnd = new Date();
			maxEnd.setUTCHours(0, 0, 0, 0);
			maxEnd.setUTCDate(1);

			// it might be useful to only pull future ending courses if this was for a list of study groups that you can enroll in.
			// However, this is incorrect for pulling ones that are currently available to enrollees
			// maxEnd.setDate(maxEnd.getDate() + 10);

			return this.courseData.getKenticoObjects({
				depth: 3,
				type: 'study_group',
				elementQueries: {'start_date[lte]': minStart.toISOString(), 'end_date[gte]': maxEnd.toISOString()}
			}).pipe(
				retry(2),
				tap(success => { }),
				map(result => actions.setStudyGroups({studyGroups: result})),
				catchError(() => EMPTY) //of(courseActions.userLoginError({message: 'An error occurred during login.'})))
			);
		})
	));

	getMultimedia$ = createEffect(() => this.actions$.pipe(
		ofType(actions.getMultimedia),
		this.rxjsHelper.throttle(600 * 1000, this.zoneScheduler.leaveNgZone()), //only run at most every ten minutes
		mergeMap(action =>
			this.courseData.getMultiMediaObjects().pipe(
				retry(2),
				catchError(err => {
					console.error('error with getMultiMediaObjects()', err);
					return EMPTY;
				}) //of(courseActions.userLoginError({message: 'An error occurred during login.'})))
			)
		),
		map(result => actions.setMultimedia({multimedia: result})),
	));

	// THIS WHOLE THING IS FOR DEBUGGING
	// frequently log how many multimedia items have the vimeo_360_s data set to see if the number keeps increasing
	// loggingMultimediaStuffTest$ = createEffect(() => combineLatest([
	// 	this.actions$.pipe(ofType(actions.setMultimedia)),
	// 	this.actions$.pipe(ofType(userActivity)),
	// 	this.actions$.pipe(ofType(setCurrentLesson))
	// ]).pipe(
	// 	withLatestFrom(this.store.pipe(select(selectMultimediaDetails))),
	// 	filter(([[{multimedia: setMm}, ua, ], mmDetails]) => {
	// 		// console.log('%c' + 'IN FILTER', 'background-color:cyan');
	// 		return !!mmDetails;
	// 	}),
	// 	tap(([[{multimedia: setMm}, ua, ], mmDetails]) => {
	// 		const has360pThing = mmDetails.filter(m => m.vimeo_360_s).length;
	// 		const notHas360pThing = mmDetails.filter(m => !m.vimeo_360_s).length;
	// 		console.log('%c' + 'has360pThing = ' + has360pThing, 'background-color:silver');
	// 		console.log('%c' + 'notHas360pThing = ' + notHas360pThing, 'background-color:silver');
	// 	})
	// ), {dispatch: false});

	// WHAT THIS DOES: Updates the multimedia items in state (which originally come from all.json), to add
	// vimeo signature & token for getting the 360p version of the video, so that users who have datasaver mode
	// turned on can play the 360p version
	// NOTE: It would be better if we could just scrape the signatures/tokens to have them in the all.json file
	// in the first place, then all this would be unnecessary!
	getLoweredResVideos$ = createEffect(() => combineLatest([
		this.actions$.pipe(ofType(actions.setCurrentCourse)),
		this.actions$.pipe(ofType(actions.setCourseDetails)),
		this.actions$.pipe(ofType(userActions.userSetPreferences)),
		this.actions$.pipe(ofType(actions.courseOpened))
	]).pipe(
		withLatestFrom(this.store.pipe(select(selectCurrentCourse))),
		withLatestFrom(this.store.pipe(select(selectMultimediaDetails))),
		filter(([[[ , , {preferences}], currentCourse], currentMmItems]) => {
			return preferences.dataSaver && !!currentCourse && !!currentMmItems.length;
		}),
		throttleTime(500),
		tap(([[[ , , {preferences}], currentCourse], currentMmItems]) => {
			// currentCourse: Course
			if (preferences.dataSaver) {
				const mmIdList_lectures: string[] = [];
				if (currentCourse.lectures) {
					currentCourse.lectures.forEach(l => mmIdList_lectures.push(l.multimedia_id));
				}

				const mmIdList_other: string[] = [];
				mmIdList_other.push(currentCourse.course_trailer_id);
				if (currentCourse.lectures) {
					currentCourse.lectures.forEach(l => {
						if (l.supplementary_videos){
							l.supplementary_videos.forEach(s => mmIdList_other.push(s.multimedia_id));
						}
					});
				}

				const mmsToUpdate_lectures = currentMmItems.filter(m => mmIdList_lectures.includes(m.id) && m.vimeo_id && !m.vimeo_360_s);
				const mmsToUpdate_other = currentMmItems.filter(m => mmIdList_other.includes(m.id) && m.vimeo_id && !m.vimeo_360_s);
				const mmsToUpdate = mmsToUpdate_lectures.concat(mmsToUpdate_other);

				// Doing lectures first, then doing trailer and supplementary vids
				concat(
					this.progressSvc.getAlternateVimeoResolutionsMulti(mmsToUpdate_lectures.map(m => m.vimeo_id)),
					this.progressSvc.getAlternateVimeoResolutionsMulti(mmsToUpdate_other.map(m => m.vimeo_id))
				).subscribe((r: AltVideoResolutions[]) => {
					r.forEach(avrs => {
						if (avrs.resolutions && avrs.resolutions['360p']){
							const mmToUpdate = mmsToUpdate.filter(mm => mm.vimeo_id === avrs.vimeo_id)[0];
							const newMm = {
								...mmToUpdate,
								vimeo_360_s: avrs.resolutions['360p'].signature,
								vimeo_360_p: avrs.resolutions['360p'].token,
							};
							this.store.dispatch(actions.setMultimediaItem({multimedia: newMm}));
						}
					});
				});
			}
		})
	), {dispatch: false});

	getCoursesProgress$ = createEffect(() => this.actions$.pipe(
		ofType(actions.getCoursesProgress),
		onlyIfUserLoggedIn(this.store),
		this.rxjsHelper.throttle(10000, this.zoneScheduler.leaveNgZone()), //only run at most every 10 seconds
		mergeMap(([action, state]) => this.progressSvc.getCoursesProgress()
			.pipe(
				map(result => actions.setCoursesProgress({progress: result})),
				catchError(err => {
					console.error('error retrieving progress', err);
					return EMPTY;
				})
			)
		)
	));

	mapCurrentItemToGetDetails$ = createEffect(() => this.actions$.pipe(
		ofType(actions.setCurrentCourse),
		map(curAction => {
			return actions.getCourseDetails({courseCodename: 'codename', courseSlug: curAction.currentCourse});
		})
	));

	mapSetDetailsToProgress$ = createEffect(() => this.actions$.pipe(
		ofType(actions.courseOpened),
		filter(a => !!a.courseId),
		onlyIfUserLoggedIn(this.store),
		this.rxjsHelper.throttle(5000, this.zoneScheduler.leaveNgZone()), //only run once every 5 seconds (at most)
		mergeMap(([detailsAction, state]) =>
			this.progressSvc.getCourseProgress(detailsAction.courseId).pipe(
				catchError(err => EMPTY)
			)
		),
		filter(r => !!r),
		map(r => actions.setCourseProgress({progress: r})),
	));

	handleCourseOpened$ = createEffect(() => this.actions$.pipe(
		ofType(actions.courseOpened),
		filter(a => !!a.courseId),
		this.rxjsHelper.throttle(10000, this.zoneScheduler.leaveNgZone()), //run at most every 10 seconds
		onlyIfUserLoggedIn(this.store),
		tap(([detailsAction, state]) => {
			// run request to mark progress
			this.progressSvc.markCourseOpen(detailsAction.courseId).subscribe(r => {
				// console.log('marked course open');
			});
		})
	), {dispatch: false});

	getCourseDetails$ = createEffect(() => this.actions$.pipe(
		ofType(actions.getCourseDetails),
		filter(action => !!action.courseSlug),
		withLatestFrom(this.store),
		//if we already have details, skip the remainder of the checks
		mergeMap(([action, store]) => {
			const courseMatch = store.course.courseDetails[action.courseSlug];
			if (!courseMatch) {
				return this.courseData.getKenticoObjects({slug: action.courseSlug, depth: 3, type: 'course'}).pipe(
					// tap(r => console.log('got')),
					filter(c => !!c.length),
					mergeMap(c => [
						actions.setCourseDetails({course: c[0]}),
						actions.courseOpened({courseId: c[0].system_id}),
					]),
					catchError(() => EMPTY) //of(courseActions.userLoginError({message: 'An error occurred during login.'})))
				);
			} else {
				return of(actions.courseOpened({courseId: courseMatch.system_id}));
			}
		})
	));

	getCourseTestimonials$ = createEffect(() => this.actions$.pipe(
		ofType(actions.setCourseDetails),
		withLatestFrom(this.store),
		//if we already have details, skip the remainder of the checks
		mergeMap(([action, store]) => {
			const courseMatch = store.course.courseTestimonials[action.course.url_slug];
			if (!courseMatch) {
				return this.courseData.getKenticoObjects({
					limit: MAX_TESTIMONIALS,
					type: 'testimonial',
					elementQueries: {referenced_course_id: action.course.system_id}
				}).pipe(
					// tap(r => console.log('got')),
					filter(c => !!c.length),
					map(testimonials => actions.setCourseTestimonials({courseSlug: action.course.url_slug, testimonials})),
					catchError(() => EMPTY) //of(courseActions.userLoginError({message: 'An error occurred during login.'})))
				);
			} else {
				return EMPTY;
			}
		})
	));

	getStudyGroup$ = createEffect(() => this.actions$.pipe(
		ofType(actions.getStudyGroup),
		withLatestFrom(this.store),
		// since this is per course (and currently triggered for each enrolled course), the throttle would often exclude valid
		// this.rxjsHelper.throttle(10000, this.zoneScheduler.leaveNgZone()),
		mergeMap(([action, store]) => {
			if (store.course.studyGroups[action.studyGroupID]) return EMPTY;

			return this.courseData.getKenticoObjects({itemId: action.studyGroupID, depth: 3, type: 'study_group'}).pipe(
				filter(sg => !!sg.length),
				retry(3),
				mergeMap(sg => [
					actions.setStudyGroup({studyGroup: sg[0]})
				]),
				catchError(() => EMPTY) //of(courseActions.userLoginError({message: 'An error occurred during login.'})))
			);
		})
	));


	markLectureOpenEvent$ = createEffect(() => this.actions$.pipe(
		ofType(actions.setCurrentLessonItem),
		withLatestFrom(this.store),
		tap(([action, store]) => {
			//if not a lecture or qa, bail
			if (!['lecture', 'qa'].includes(action.itemType)) return;

			const course = getCurrentCourse(store.course);
			if (course) {
				this.progressSvc.markLectureOpen(course.system_id, action.item.system_id).subscribe(r => {
					console.log('Marked lecture open');
				});
			}
		})
	), {dispatch: false});


	//TODO do we have the possibility of accidentally overwriting end items?
	postVideoProgress$ = createEffect(() => this.actions$.pipe(
		ofType(actions.setVideoProgress),
		this.rxjsHelper.sample(10000, this.zoneScheduler.leaveNgZone()), //debounce for 10 seconds
		withLatestFrom(this.store),
		map(([action, state]) => {
			const vidPostInfo: VideoPostInfo = {
				...action as VideoPostInfo,
				userId: state.user.currentUser.id
			};

			return saveVideoPostInfo(vidPostInfo);
		}),
	));

	postVideoProgressForce$ = createEffect(() => this.actions$.pipe(
		ofType(actions.setVideoProgressForce),
		withLatestFrom(this.store),
		map(([action, state]) => {

			const vidPostInfo: VideoPostInfo = {
				...action as VideoPostInfo,
				userId: state.user.currentUser.id
			};

			return saveVideoPostInfo(vidPostInfo);
		}),
	));

	loginToProgress$ = createEffect(() => this.actions$.pipe(
		ofType(userActions.userLogInComplete, userActions.userSetDetails),
		map(() => actions.getCoursesProgress())
	));

	clearProgressOnLogout$ = createEffect(() => this.actions$.pipe(
		ofType(userActions.userLogOutCompleted),
		switchMap(a => [
			actions.setVideoProgressList({list: []}),
			actions.setCoursesProgress({progress: []}),
			actions.setCurrentCourse({currentCourse: null}),
			actions.setCurrentLesson({currentLesson: null}),
			actions.setCurrentLessonItem({item: null, itemType: null})
		])
	));

	constructor(
		private actions$: Actions, private store: Store<State>,
		private courseData: CourseDataService, private progressSvc: UserDataService,
		private rxjsHelper: RxjsHelperService, private zoneScheduler: RxNgZoneScheduler,
	) {

		// setTimeout(() => {
		// 	this.store.dispatch(actions.getStudyGroups());
		// });
	}
}
