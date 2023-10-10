import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';

import {FinalQuizComponent} from './final-quiz.component';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {Component, Input} from '@angular/core';
import {mockInitialState, State} from '../../state';
import {RouterTestingModule} from '@angular/router/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Meta, Title} from '@angular/platform-browser';
import {MemoizedSelector, Store} from '@ngrx/store';
import {selectCurrentCourseWithProgress} from '../../state/courses/selectors';
import * as helpers from '../../../test.helpers';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {setCurrentCourse, setCurrentLesson} from '../../state/courses/actions';
import {FINAL_QUIZ_LECTURE_ID} from '../../common/constants';

@Component({
	selector: 'app-quiz',
	template: 'QUIZ'
})
class MockQuizComponent {
	@Input()
		quiz: any;
	@Input() layout = 'main';
	@Input() quizType = 'ordinary';
	@Input() courseId: string;
	@Input() course: any;

	@Input()
		shouldShowResultsByDefault: boolean;
}

describe('FinalQuizComponent', () => {
	let component: FinalQuizComponent;
	let fixture: ComponentFixture<FinalQuizComponent>;
	let titleSvc: Title;
	let metaSvc: Meta;
	let store: MockStore<State>;
	let mockselectCurrentCourseWithProgress: MemoizedSelector<State, any>;
	const mockCourse = helpers.getMockCourse({system_id: 'mockCourse1'});

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [
				FinalQuizComponent,
				HcSimpleMdPipe,
				MockQuizComponent
			],
			imports: [
				RouterTestingModule.withRoutes([]),
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{
					provide: ActivatedRoute, useValue: {
						params: of({
							courseId: 'mockCourse',
							contentId: 'mockContentId'
						})
					}
				},
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FinalQuizComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		titleSvc = TestBed.inject(Title);
		jest.spyOn(titleSvc, 'setTitle');
		metaSvc = TestBed.inject(Meta);
		jest.spyOn(metaSvc, 'updateTag');
		store = TestBed.inject(Store) as MockStore<State>;
		jest.spyOn(store, 'dispatch');
		mockselectCurrentCourseWithProgress = store.overrideSelector(selectCurrentCourseWithProgress, mockCourse);
		fixture.detectChanges();
	});

	afterEach(() => {
		jest.resetAllMocks();
		store.resetSelectors();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should ngOnInit', () => {
		const initSpy = jest.spyOn(component, 'ngOnInit');
		component.ngOnInit();
		expect(initSpy).toHaveBeenCalled();
	});

	it('should ngOnInit with route params', () => {
		component.ngOnInit();
		expect(store.dispatch).toHaveBeenCalledTimes(2);
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentCourse({ currentCourse: 'mockCourse'}));
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentLesson({currentLesson: FINAL_QUIZ_LECTURE_ID}));
	});

	it('should keep up with current course from NgRx', () => {
		mockselectCurrentCourseWithProgress.setResult(mockCourse);
		store.refreshState();
		fixture.detectChanges();
		expect(titleSvc.setTitle).toHaveBeenCalled();
		expect(metaSvc.updateTag).toHaveBeenCalled();
	});

	it('should render quiz component for current course final quiz', () => {
		component.ngOnInit();
		expect(store.dispatch).toHaveBeenCalledWith(setCurrentLesson({currentLesson: FINAL_QUIZ_LECTURE_ID}));
	});
});
