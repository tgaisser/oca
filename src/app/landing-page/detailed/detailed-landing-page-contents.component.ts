import {BaseLandingPageContentsComponentDirective} from '../base-landing-page-contents-component.directive';
import {Component} from '@angular/core';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-detailed-landing-page-contents',
	templateUrl: './detailed-landing-page-contents.component.html',
	styleUrls: ['./detailed-landing-page-contents.component.less']
})
export class OnPlatformLandingPageContentsComponent extends BaseLandingPageContentsComponentDirective {
	faChalkboardTeacher = faChalkboardTeacher;

	getAvgLectureDuration(course) {
		let totalSeconds = 0;
		let avgSeconds = 0;

		if (!course.lectures) return '';

		// Add up all of the course durations
		course.lectures.forEach(lecture => {
			if (lecture.duration) {
				// console.log('Lecture duration:', lecture.duration);

				const times = lecture.duration.split(':');
				let seconds = 0;
				let minutes = 1;

				while (times.length > 0) {
					seconds += minutes * parseInt(times.pop(), 10);
					minutes *= 60;
				}

				totalSeconds += seconds;
			}
		});
		// console.log('Total Seconds:', totalSeconds);

		// Average out the seconds
		avgSeconds = Math.floor(totalSeconds / course.lectures.length);
		// console.log('Avg Seconds:', avgSeconds);

		// Parse average into "hh:mm:ss" string
		// const ss = this.padZeroes(avgSeconds % 60, 2);
		// const mm = this.padZeroes(Math.floor(avgSeconds / 60) % 60, 2);
		// const hh = this.padZeroes(Math.floor(avgSeconds / 3600) % 60, 2);
		// console.log('Avg lecture duration (hh:mm:ss):', (hh != '00' ? hh + ':' : '') + (mm != '00' ? mm + ':' : '') + ss);
		// const avgDuration = (hh != '00' ? hh + ':' : '') + (mm != '00' ? mm + ':' : '') + ss;

		// Parse average into "m minutes" string
		const m = Math.floor(avgSeconds / 60);
		// console.log('Avg lecture duration (minutes):', m + ' minutes');
		return m + ' minutes';
	}
}
