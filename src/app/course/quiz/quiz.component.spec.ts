import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';
import * as helpers from '../../../test.helpers';

import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QuizBlankPipe} from '../../common/course/quiz-blank.pipe';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {createSpyObj, CustomMocksModule} from '../../../test.helpers';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../../state';
import {CookieService} from 'ngx-cookie-service';
import {MemoizedSelectorWithProps, Store} from '@ngrx/store';
import {submitQuiz} from '../../state/quizzes/actions';
import * as quizSelectors from '../../state/quizzes/selectors';
import {QuizComponent} from './quiz.component';
import {QuizResult} from '../../common/models';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';
import { lastValueFrom } from 'rxjs';

@Component({
	selector: 'app-next-course',
	template: 'NEXT COURSE'
})
class MockNextCourseComponent {
	@Input() singleColumnLayout = false;
}

@Component({
	selector: 'app-social-share',
	template: 'SocialShare'
})
class MockSocialShareComponent {
	@Input() shareURL = '';
	@Input() shareText = '';
	@Input() facebook = false;
	@Input() twitter = false;
	@Input() email = false;
}

describe('QuizComponent', () => {
	let component: QuizComponent;
	let fixture: ComponentFixture<QuizComponent>;
	let store: MockStore<State>;
	let curQuizSelector: MemoizedSelectorWithProps<State, QuizResult, {quizId: string}>;
	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [QuizComponent,
				MockNextCourseComponent,
				MockSocialShareComponent,
				QuizBlankPipe],
			imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, CustomMocksModule, HcPipesModule],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: CookieService, useValue: createSpyObj('CookieService', ['get', 'set'])},
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(QuizComponent);
		component = fixture.componentInstance;
		component.quiz = helpers.getMockQuiz();
		fixture.detectChanges();
		store = getTestBed().get(Store);
		curQuizSelector = store.overrideSelector(quizSelectors.selectCurrentQuiz, helpers.getMockQuizResult());
		jest.spyOn(store, 'dispatch');
	});

	afterEach(() => {
		store.resetSelectors();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should ngOnInit with course', () => {
		const consoleSpy = jest.spyOn(console, 'log');
		component.course = helpers.getMockCourse();
		component.ngOnInit();
		if (component.courseId) {
			expect(consoleSpy).toHaveBeenCalled();
		}
	});

	it('should initForm with quiz', () => {
		const mockQuiz = helpers.getMockQuiz();
		component.quiz = mockQuiz;
		component.initForm();
		expect(component.quiz.questions).toEqual(mockQuiz.questions);
	});

	it('should do nothing on initForm with no quiz', () => {
		const initSpy = jest.spyOn(component, 'initForm');
		component.initForm();
		expect(initSpy).toHaveBeenCalled();
		if (!component.quiz || !component.quiz.questions) {
			expect(JSON.stringify(initSpy, null, 2)).toEqual(JSON.stringify(jest.fn(), null, 2));
		}
		initSpy.mockReset();
	});

	it('should getOptions', () => {
		const question = helpers.getMockQuizQuestion();
		component.getOptions(question);
		expect(component.getOptions(question)).toEqual([
			{key: 'option_1', value: 'mockOption1'},
			{key: 'option_2', value: 'mockOption2'},
			{key: 'option_3', value: 'mockOption3'},
			{key: 'option_4', value: 'mockOption4'},
			{key: 'option_5', value: 'mockOption5'}]);
	});

	function createFakeEvent(isCardCollapsed) {
		const closestObj = {
			classList: {
				contains: jest.fn(() => isCardCollapsed)
			},
			click: jest.fn(),
			getBoundingClientRect: jest.fn(() => ({top: 5})),
		};
		const clickEvent = {
			stopPropagation: jest.fn(),
			target: {
				closest: jest.fn(() => closestObj)
			}
		};

		return {
			event: clickEvent,
			closestObj
		};
	}

	it('should setSelection', () => {
		const {closestObj, event: clickEvent} = createFakeEvent(true);
		const expectType = 'something';
		component.setSelection(clickEvent, expectType);
		expect(clickEvent.target.closest).toHaveBeenCalledWith('.card-header');
		expect(closestObj.classList.contains).toHaveBeenCalledWith('collapsed');
		expect(component.currentSelection).toBeTruthy();
	});

	it('should getParsedResults', () => {
		//const formatTimeSpy = jest.spyOn<any, any>(component, 'formatTime');
		const getOptionsSpy = jest.spyOn(component, 'getOptions');

		const result = helpers.getMockQuizResult();
		component.quiz = helpers.getMockQuiz();
		component.getParsedResults(result);
		//formatTimeSpy.mockReset();
		getOptionsSpy.mockReset();
	});

	it('should getLastTakenDateText', () => {
		const getLastTakenDateSpy = jest.spyOn(component, 'getLastTakenDateText');
		const result = helpers.getMockQuizResult();
		component.getLastTakenDateText(result);
		expect(getLastTakenDateSpy).toHaveBeenCalledWith(result);
		//expect(getLastTakenDateSpy).toEqual(`You took this quiz on X, and scored <strong>Y</strong>.`);
		getLastTakenDateSpy.mockReset();
	});

	it('should submitQuiz', () => {
		component.quiz = helpers.getMockQuiz();
		component.submitQuiz();
		expect(store.dispatch).toHaveBeenCalledWith(submitQuiz({
			quizName: component.quiz.system_codename,
			quizType: component.quizType,
			answers: component.quizForm.getRawValue()
		}));
	});

	it('should retakeQuiz', () => {
		component.retakeQuiz();
		expect(component.takingQuiz).toBeTruthy();
	});

	it('should update observable questionStatus$', waitForAsync(() => {
		lastValueFrom(component.questionStatus$).then(result => {
			expect(result).toEqual({
				incompleteQuestions: [1],
				numIncomplete: 1,
				numQuestions: 1,
				percentIncomplete: 1
			});
		});
	}));

	it('should render normally (no description)', () => {
		component._quiz = helpers.getMockQuiz();

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});

	it('should render normally (quiz description)', () => {
		component.quiz = helpers.getMockQuiz();
		component.quiz.description = 'Test Description';

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});

	it('should render normally (question extra)', () => {
		component.quiz = helpers.getMockQuiz();
		component.quiz.questions[0].extra_details = 'This is Extra';

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});

	it('should render normally (quiz description and question extra)', () => {
		component.quiz = helpers.getMockQuiz();
		component.quiz.description = '<p>Desc</p><p><img src="https://placehold.it/12x12" alt="test" /></p>';
		component.quiz.questions[1].extra_details = 'This is Extra 2';

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});
});
