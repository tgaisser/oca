import {Component, Input, OnInit} from '@angular/core';
import {Course} from '../../../services/course-data.service';

@Component({
	selector: 'app-enrolled-progress-pie-chart',
	templateUrl: './enrolled-progress-pie-chart.component.html',
	styleUrls: ['./enrolled-progress-pie-chart.component.less']
})
export class EnrolledProgressPieChartComponent implements OnInit {

	@Input()
		course: Course;

	constructor() {
	}

	ngOnInit() {
	}

	getClasses() {
		if (!this.course || !this.course.progress) return [];

		return [
			'percent-' + Math.floor(this.course.progress.progressPercentage * 100 || 0),
			this.course.progress.progressPercentage >= 0.5 ? 'progress-greater-50' : 'progress-50-or-less'
		];
	}
}
