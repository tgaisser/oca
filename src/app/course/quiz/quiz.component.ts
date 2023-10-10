import {Component, Inject, Input, LOCALE_ID, OnInit} from '@angular/core';
import {Course, CourseQuiz, QuizQuestion} from '../../services/course-data.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserDataService} from '../../services/user-data.service';
import {select, Store} from '@ngrx/store';
import {State} from '../../state';
import * as quizActions from '../../state/quizzes/actions';
import * as quizSelectors from '../../state/quizzes/selectors';

import {Observable} from 'rxjs';
import {tap, map, startWith} from 'rxjs/operators';

import {formatDate, formatPercent} from '@angular/common';
import {QuizResult} from '../../common/models';
@Component({
	selector: 'app-quiz',
	templateUrl: './quiz.component.html',
	styleUrls: ['./quiz.component.less']
})
export class QuizComponent implements OnInit {
	@Input()
	get quiz() {
		return this._quiz;
	}
	set quiz(value) {
		if (!this._quiz || this._quiz.system_id !== value.system_id) {
			this.quizResult$ = this.store.pipe(
				select(quizSelectors.selectCurrentQuiz, {quizId: value.system_id}),
				//whenever we get a new quiz result, switch back to results mode
				tap(q => this.takingQuiz = false)
			);
		}

		this._quiz = value;
		this.initForm();
	}

	constructor(private userDataService: UserDataService, private store: Store<State>, @Inject(LOCALE_ID) private locale: string) {

	}

	_quiz: CourseQuiz = null;

	@Input() layout = 'main';
	@Input() quizType = 'ordinary';
	@Input() courseId: string;
	@Input() course: Course;

	showResultsWhenAvailable = true;
	@Input()
	set shouldShowResultsByDefault(val: boolean) {
		this.showResultsWhenAvailable = val;
	}

	currentSelection = 'quiz';

	mappedQuiz = {} as any;

	takingQuiz = true;

	quizForm: FormGroup = new FormGroup({
	});

	quizResult$: Observable<QuizResult>;

	questionStatus$: Observable<{
		numQuestions: number,
		numIncomplete: number,
		percentIncomplete: number,
		incompleteQuestions: number[]
	}> = this.quizForm.statusChanges
			.pipe(startWith(1), map((s) => {
				const ctrls = this.quizForm.controls;
				const questions =  Object.getOwnPropertyNames(ctrls)
					.map((k, i) => ({invalid: ctrls[k].invalid, num: i + 1}));
				const invalid = questions.filter(i => i.invalid);
				return {
					numQuestions: questions.length,
					numIncomplete: invalid.length,
					incompleteQuestions: invalid.map(i => i.num),
					percentIncomplete: invalid.length / questions.length,
				};
			}));

	private static formatTime(timestamp: number, formatType: string = 'timestamp') {
		const timeObj = new Date(timestamp * 1000);
		const hours = timeObj.getUTCHours();
		const minutes = timeObj.getUTCMinutes();
		const seconds = timeObj.getSeconds();

		let timeString = '';

		if (formatType === 'text') {
			const hourDesc = hours !== 1 ? 'hours' : 'hour';
			const minuteDesc = hours !== 1 ? 'minutes' : 'minute';
			const secondDesc = hours !== 1 ? 'seconds' : 'second';
			timeString = (hours > 0 ? `${hours} ${hourDesc}` : '') +
				(hours > 0 && (minutes > 0 || seconds > 0) ? ', ' : '') +
				(minutes > 0 ? `${minutes} ${minuteDesc}` : '') +
				(minutes > 0 && seconds > 0 ? ', ' : '') +
				(seconds > 0 ? `${seconds} ${secondDesc}` : '');
		} else {
			timeString = (hours > 0 ? hours.toString().padStart(2, '0') + ':' : '') +
				minutes.toString().padStart(2, '0') + ':' +
				seconds.toString().padStart(2, '0');
		}

		return timeString;
	}

	ngOnInit() {
		if (this.courseId) {
			console.log('Quiz -- Course ID:', this.courseId);
		}
	}

	initForm() {
		if (!this._quiz || !this._quiz.questions) {
			console.log('no questions');
			return;
		}

		const newQuestions = new Set(this.quiz.questions.map(q => q.system_id));
		const existingQuestions = new Set(Object.keys(this.quizForm.controls));
		const removed = Array.from(existingQuestions).filter(x => !newQuestions.has(x));
		const added = new Set(Array.from(newQuestions).filter(x => !existingQuestions.has(x)));
		// console.log('to remove', removed);
		// console.log('to add', added);

		//remove any controls that are no longer in the active question list
		removed.forEach(c => this.quizForm.removeControl(c));

		//add all of the new questions for the form
		this.quiz.questions.filter(q => added.has(q.system_id)).forEach(q => {
			this.mappedQuiz[q.system_id] = this.getOptions(q);
			this.quizForm.addControl(q.system_id, new FormControl('', Validators.required));
		});
	}

	getOptions(question: QuizQuestion) {
		return Object.keys(question)
			.filter(k => k.startsWith('option_'))
			.map(k => ({key: k, value: question[k]}))
			.filter(o => o.value);
	}

	setSelection(event: any, type: string) {
		event.stopPropagation();

		// console.log("setSelection():", type);
		// console.log("Event:", event);

		const target = event.target || event.srcElement || event.currentTarget;
		// console.log("Nearest .card-header:", target.closest(".card-header"));

		const cardHeader = target.closest('.card-header');

		if (cardHeader.classList.contains('collapsed')) {
			// console.log("Expanding this .card-header");
			cardHeader.click();
		}

		this.currentSelection = type;
	}

	getParsedResults(quizResult: QuizResult) {
		const results = quizResult.results;
		return this.quiz.questions.map(q => {
			const match = results.find(r => r.id === q.system_id);
			const options = this.getOptions(q).map(o => ({
				...o,
				correct: match && q.answer === o.key,
				selected: match && match.selectedOption === o.key,
			}));

			return {
				question: q.question,
				options,
				correct: match.correct,
				answerLocation: q.answer_video_position,
				answerLocationTimestamp: q.answer_video_position ? QuizComponent.formatTime(q.answer_video_position, 'timestamp') : null,
				answerLocationText: q.answer_video_position ? QuizComponent.formatTime(q.answer_video_position, 'text') : null
			};
		});
	}

	getBestScoreText(quizResult: QuizResult) {
		const percCorrect = formatPercent(quizResult.bestPercentageCorrect, this.locale);
		return `Your best score on this quiz is <strong>${percCorrect}</strong>.`;
	}

	getLastTakenDateText(quizResult: QuizResult) {
		const compTime = formatDate(quizResult.completeTime, 'MMMM d, y', this.locale);
		return `Below are your quiz results from ${compTime}.`;
	}

	submitQuiz() {
		console.log('quiz result', this.quizForm.getRawValue());

		this.store.dispatch(quizActions.submitQuiz({
			quizName: this.quiz.system_codename,
			quizType: this.quizType, //this.quiz.system_type,
			answers: this.quizForm.getRawValue()
		}));
	}

	retakeQuiz() {
		console.log('take quiz');
		this.takingQuiz = true;
	}

}
