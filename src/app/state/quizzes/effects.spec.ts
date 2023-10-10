import {from, Observable, of, throwError} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ToastrService} from 'ngx-toastr';
import {createSpyWithMultipleObservableValues, CustomMocksModule} from '../../../test.helpers';
import {MockStore} from '@ngrx/store/testing';
import {State} from '../index';
import {UserDataService} from '../../services/user-data.service';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {QuizEffects} from './effects';
import {LoadingService} from '../../common/loading.service';
import * as courseActions from '../courses/actions';
import * as courseSelectors from '../courses/selectors';
import * as quizActions from './actions';
import * as userActions from '../user/actions';

describe('Quizzes effects', () => {
	let effects;

	let actions$ = new Observable<Action>();
	let testScheduler;
	let store;
	let userDataService;
	let toastr;
	let loader;

	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				QuizEffects,
				provideMockActions(() => actions$),
				{provide: ToastrService, useValue: {error: jest.fn(), success: jest.fn()}},
				{provide: LoadingService, useValue: {show: jest.fn(), hide: jest.fn()}}
			],
			imports: [
				CustomMocksModule,
			]
		});

		effects = TestBed.get<QuizEffects>(QuizEffects);
		store = TestBed.get(Store) as MockStore<State>;
		userDataService = TestBed.get(UserDataService);
		toastr = TestBed.get(ToastrService);
		loader = TestBed.get(LoadingService);

		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

	});

	const setupQuizLoaderActions = hot => {
		actions$ = hot('a 1s b 1s c', {
			a: userActions.userSetDetails({user: {id: '1'} as any}),
			b: courseActions.setCourseDetails({course: {system_id: '1'} as any}),
			c: courseActions.setCourseDetails({course: {system_id: 'b'} as any}),
		});
	};
	it('quizLoader$ should translate setCourseDetails to getCourseQuizResults (if user)', () => {
		store.setState({
			...store.lastState,
			user: {
				currentUser: {
					id: '1',
				}
			}
		});
		testScheduler.run(({hot, expectObservable}) => {
			setupQuizLoaderActions(hot);
			expectObservable(effects.quizLoader$).toBe('1s - 1s b 1s c', {
				b: quizActions.getCourseQuizResults({courseId: '1'}),
				c: quizActions.getCourseQuizResults({courseId: 'b'}),
			});
		});
	});
	it('quizLoader$ should do nothing (if no user)', () => {
		testScheduler.run(({hot, expectObservable}) => {
			setupQuizLoaderActions(hot);
			expectObservable(effects.quizLoader$).toBe('-------');
		});
	});

	it('quizLoader2$ should get results from API and swallow errors', () => {
		userDataService.getQuizResults = createSpyWithMultipleObservableValues([
			of('q1'),
			throwError(''),
			of('q3')
		]);

		testScheduler.run(({hot, expectObservable}) => {
			actions$ = hot('-a---b---c', {
				a: quizActions.getCourseQuizResults({courseId: '1'}),
				b: quizActions.getCourseQuizResults({courseId: '2'}),
				c: quizActions.getCourseQuizResults({courseId: '3'}),
			});

			expectObservable(effects.quizLoader2$).toBe('-a-------c', {
				a: quizActions.setCourseQuizResults({courseId: '1', results: 'q1' as any}),
				c: quizActions.setCourseQuizResults({courseId: '3', results: 'q3' as any}),
			});

			testScheduler.flush();

			expect(userDataService.getQuizResults.mock.calls).toEqual([['1'], ['2'], ['3']]);
		});
	});

	const testQuizSaverSuccess = async quizType => {
		jest.spyOn(courseSelectors, 'selectCurrentStateSystemIds').mockImplementation(() => {
			return {
				courseId: 'c',
				lessonId: 'l',
				contentId: 'ct'
			};
		});
		jest.spyOn(store, 'dispatch');

		const quizRes = {quizId: 'qr1', percentageCorrect: 42};
		userDataService.recordQuiz = jest.fn(() => of(quizRes));

		actions$ = from([quizActions.submitQuiz({quizName: 'q1', answers: {a: 'b'}, quizType})]);

		await effects.quizSaver$.toPromise();

		expect(userDataService.recordQuiz.mock.calls).toEqual([
			['c', 'l', 'q1', {a: 'b'}],
		]);

		expect(store.dispatch.mock.calls).toEqual([
			[quizActions.setCourseQuizResult({result: quizRes} as any)],
			[courseActions.updateCourseContentProgress({
				courseSystemId: 'c',
				contentSystemId: quizRes.quizId,
				progressPercentage: quizRes.percentageCorrect,
				completedThreshold: quizType === 'ordinary' ? 0.0 : 0.8,
				started: true,
			})]
		]);
		expect(toastr.success).toHaveBeenCalledWith('Quiz submitted');
		expect(loader.show).toHaveBeenCalled();
		expect(loader.hide).toHaveBeenCalled();
	};

	it('quizSaver$ should call API and then dispatch events (final quiz)', async () => {
		return testQuizSaverSuccess('final');
	});
	it('quizSaver$ should call API and then dispatch events (lecture quiz)', async () => {
		return testQuizSaverSuccess('ordinary');
	});
	it('quizSaver$ should call API and then show toastr if error', async () => {
		jest.spyOn(courseSelectors, 'selectCurrentStateSystemIds').mockImplementation(() => {
			return {
				courseId: 'c',
				lessonId: 'l',
				contentId: 'ct'
			};
		});
		jest.spyOn(store, 'dispatch');

		userDataService.recordQuiz = jest.fn(() => throwError(new Error('err')));

		actions$ = from([quizActions.submitQuiz({quizName: 'q1', answers: {a: 'b'}, quizType: 'a'})]);

		await effects.quizSaver$.toPromise();

		expect(userDataService.recordQuiz.mock.calls).toEqual([
			['c', 'l', 'q1', {a: 'b'}],
		]);

		expect(store.dispatch).not.toHaveBeenCalled();
		expect(toastr.success).not.toHaveBeenCalled();
		expect(toastr.error).toHaveBeenCalledWith('Failed to submit quiz: err');
		expect(loader.show).toHaveBeenCalled();
		expect(loader.hide).toHaveBeenCalled();
	});
});
