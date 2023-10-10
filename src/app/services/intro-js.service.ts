import {Injectable, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WindowBehaviorService} from './window-behavior.service';
import {LOCAL_STORAGE} from '../common/models';

const tourKey = 'guided-tour-has-run';
const curTourDate = '2019-11-05';

interface IntroJsOptions {
	steps: {intro: string, element?: any, position?: string}[];
	doneLabel: string;
}
declare interface IntroJs {
	onbeforechange(param: (nextElem) => void);
	oncomplete(param: () => void);
	onexit(param: () => void);
	setOptions(options: IntroJsOptions);
	start();
}


@Injectable({
	providedIn: 'root'
})
export class IntroJsService {

	private _tourHasRun: {[key: string]: boolean} = {};
	private _tourIsOpen = false;

	tourHasRun(type: string) { return !!this._tourHasRun[type]; }
	get tourIsOpen() { return this._tourIsOpen; }


	constructor(
		@Inject(DOCUMENT) private document: Document,
		private windowBehaviorService: WindowBehaviorService,
		@Inject(LOCAL_STORAGE) private localStorage: Storage
	) {
		for (let i = 0; i < localStorage.length; i++){
			const key = localStorage.key(i);
			if (key.startsWith(tourKey)) {
				const type = (key === tourKey) ? 'course' : key.replace(new RegExp('^' + tourKey + '\-'), '');
				this._tourHasRun[type] = this.localStorage && this.localStorage.getItem(key) === curTourDate;
			}
		}
		// console.log('hasRun', this._tourHasRun);
	}

	runIntroIfNeeded(type = 'course') {
		if (!this.tourHasRun(type)) {
			this.runIntro(type);
		}
	}

	runIntro(type: string) {
		const runTour = () => {
			if (this.tourIsOpen) return;
			this._tourHasRun[type] = true;
			this._tourIsOpen = true;

			//TODO add types: https://github.com/usablica/intro.js/issues/701
			//delay the tour a second to make sure everything loads
			setTimeout(() => {


				const intro: IntroJs = this.document.defaultView['introJs']();
				const steps = [
					{
						intro: 'This is the ' + (type === 'study-group'? 'study group' : type) + ' page, where all course materials are located. ' +
							'Click next for navigation demo, or click skip to begin learning.'
					},
					{
						element: this.document.querySelector('.course-card .card-header'),
						intro: 'This is lecture 1. To open or close the lecture, click anywhere in this box.'
					},
					{
						element: this.document.querySelector('.course-card .card-header .content-toggle'),
						intro: `<p>Use these navigation buttons to:</p>
									<ul style="list-style: none; width: 325px; padding-left: 5px;">
										<li>
											<img src="assets/demo-lecture-toggle.png" alt="lecture" style="height: 38px;" />
											Watch main lecture video
										</li>
										<li>
											<img src="assets/demo-quiz-toggle.png" alt="quiz" style="height: 38px;" />
										  	Take lecture quiz
										</li>
										<li>
											<img src="assets/demo-supplemental-video-toggle.png" alt="supplemental videos" style="height: 38px;" />
											Watch supplementary video(s)
										</li>
									</ul>`,
						// position: 'bottom'
					},
					{
						// element: document.querySelector('.sidebar-content'),
						element: this.document.getElementById('sidebar'),
						intro: 'This is your course toolbar. ' +
							'When you click on a lecture, you will see lecture-specific materials, ' +
							'including lecture notes and links to available readings, study guides, and special offers.',
						// position: 'auto'
						position: 'top-middle-aligned',
					},
					{
						element: this.document.querySelector('.overall-progress-wrapper'),
						intro: 'You can track your overall progress at the bottom of the course page. ' +
							'This percentage increases as you watch the main lecture videos, complete lecture quizzes, and pass the final quiz.',
					},
					{
						element: this.document.querySelector('.final-quiz-button'),
						intro: 'In order to unlock the final quiz and qualify for a certificate of completion, ' +
							'you must watch the lecture videos and take the lecture quizzes.',
					},
					{
						intro: (type === 'course' ? '' : 'At the end of this study group, all your progress on the lectures, quizzes, and notes will be saved and you can access them at any time in the future.<br><br> ') + 'Ready? Let\'s begin!'
					}
				];

				if (type === 'study-group') {
					steps.splice(1, 0, {
						element: this.document.querySelector('.session-date-group'),
						intro: 'This is a study session. It will unlock on the date and time specified at the top. Once unlocked, you will have access to all the materials in the session.'
					});
				}
				intro.setOptions({
					steps,
					doneLabel: 'Finish Demo'
				});

				const completeTour = () => {
					this.localStorage.setItem(`${tourKey}-${type}`, curTourDate);
					this._tourIsOpen = false;
				};

				//TODO while button is disabled, right arrow will still trigger next at the end of the list (throwing an error in the console)
				intro.onbeforechange(nextElem => {
					// console.log('onbeforechange', nextElem);
					if (nextElem && nextElem === this.document.getElementById('sidebar')) {
						// console.log('about to sidebar');
						//if we're about to open the sidebar intro, then scroll to the top
						//if you don't scroll to the top, then the tooltip gets positioned off-screen (because of the styling of the sidebar)
						this.windowBehaviorService.scrollTo();
					}
				});
				intro.oncomplete(completeTour);
				intro.onexit(completeTour);
				intro.start();
			}, 1000);
		};


		if (typeof this.document.defaultView['introJs'] === 'undefined') {
			// const css = document.createElement('link');
			// css.rel = 'stylesheet';
			// css.type = 'text/css';
			// css.href = 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/introjs.css';
			// document.head.appendChild(css);

			const script = this.document.createElement('script');
			script.src = 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/intro.min.js';
			script.async = true;
			script.onload = runTour;

			this.document.head.appendChild(script);
		} else {
			runTour();
		}
	}

	clearTours() {
		this._tourHasRun = {};
	}
}

@Injectable()
export class ServerIntroJsService extends IntroJsService {
	runIntroIfNeeded() {}
	runIntro() {}
}
