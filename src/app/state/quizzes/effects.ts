import {Actions, createEffect, ofType} from '@ngrx/effects';
import {select, Store} from '@ngrx/store';
import {State} from '../index';
import {UserDataService} from '../../services/user-data.service';
import {Injectable} from '@angular/core';
import * as courseActions from '../courses/actions';
import * as courseSelectors from '../courses/selectors';
import {catchError, concatMap, filter, map, mergeMap, tap, withLatestFrom} from 'rxjs/operators';
import {combineLatest, EMPTY, of} from 'rxjs';

import * as quizActions from './actions';

import {ToastrService} from 'ngx-toastr';
import {LoadingService} from '../../common/loading.service';
import * as userActions from '../user/actions';
import {RxjsHelperService} from '../../services/rxjs-helper.service';

@Injectable()
export class QuizEffects {

	quizLoader$ = createEffect(() => combineLatest([
		this.actions$.pipe(ofType(courseActions.setCourseDetails)),
		this.actions$.pipe(ofType(userActions.userSetDetails))
	]).pipe(
		this.rxjsHelper.debounce(1000),
		withLatestFrom(this.store),
		//only request quiz details if there is a logged in user
		filter(([[setCourse, setUser], state]) => state.user.currentUser && !!state.user.currentUser.id),
		map(([[setCourse, setUser], state]) => {
			return quizActions.getCourseQuizResults({courseId: setCourse.course.system_id});
		})
	));

	quizLoader2$ = createEffect(() => this.actions$.pipe(
		ofType(quizActions.getCourseQuizResults),
		mergeMap(action => {
			return this.progressSvc.getQuizResults(action.courseId).pipe(map(res => {
				return quizActions.setCourseQuizResults({courseId: action.courseId, results: res});
			}),
			catchError(err => EMPTY));
		})
	));

	quizSaver$ = createEffect(() => this.actions$.pipe(
		ofType(quizActions.submitQuiz),
		concatMap(action => of(action).pipe(
			withLatestFrom(this.store.pipe(select(courseSelectors.selectCurrentStateSystemIds)))
		)),
		tap(([action, currentIds]) => {
			this.loadingService.show();
			console.log('Effect: Got quiz submit', action, currentIds);
			//TODO replace lectureId
			this.progressSvc.recordQuiz(currentIds.courseId, currentIds.lessonId, action.quizName, action.answers).subscribe(r => {
				this.store.dispatch(quizActions.setCourseQuizResult({result: r}));
				this.store.dispatch(courseActions.updateCourseContentProgress({
					courseSystemId: currentIds.courseId,
					contentSystemId: r.quizId,
					progressPercentage: r.percentageCorrect,
					completedThreshold: action.quizType === 'ordinary' ? 0.0 : 0.8,
					started: true,
				}));
				this.loadingService.hide();
				this.toastr.success('Quiz submitted');
			}, err => {
				console.log('quiz save error', err);
				this.toastr.error('Failed to submit quiz: ' + (err.message || 'Unknown error'));
				this.loadingService.hide();
			});
		})
	), {dispatch: false});

	clearQuizzesOnLogout$ = createEffect(() => this.actions$.pipe(
		ofType(userActions.userLogOutCompleted),
		map(a => quizActions.obliterateQuizzesState())
	));

	constructor(
		private actions$: Actions,
		private store: Store<State>,
		private progressSvc: UserDataService,
		private loadingService: LoadingService,
		private toastr: ToastrService,
		private rxjsHelper: RxjsHelperService
	) {

	}
}
