import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {Course} from '../../services/course-data.service';
@Component({
	selector: 'app-course-donate-links,[app-course-donate-links]',
	template:
		`
			<ng-container class="btn-group btn-group-stacked" *ngIf="bookUrl || dvdUrl || studyGuideUrl">
				<a [href]="bookUrl" target="_blank" class="btn btn-primary" *ngIf="bookUrl">Get&nbsp;the <br *ngIf="splitText">Course&nbsp;Book{{plural}}</a>
				<a [href]="dvdUrl" target="_blank" class="btn btn-primary" *ngIf="dvdUrl">Get&nbsp;the <br *ngIf="splitText">Course&nbsp;DVD</a>
				<a [href]="studyGuideUrl" target="_blank" class="btn btn-primary" *ngIf="studyGuideUrl">Get&nbsp;the Course <br *ngIf="splitText">Study&nbsp;Guide Booklet</a>
			</ng-container>`,
	styles: ['']
})
export class CourseDonateLinksComponent implements OnInit {
	private _classes = ['btn-group'];

	@Input('class')
	@HostBinding('class')
	get elemClasses() {
		return this._classes.join(' ');
	}
	set elemClasses(val) {
		this._classes = this._classes.concat(...val.split(' '))
			.filter((i, idx, arr) => arr.indexOf(i) === idx);
	}

	@Input()
		splitText = false;

	@Input()
		course: Course = null;

	get bookUrl() {
		return this.course && this.course.course_companion_donation_url;
	}
	get dvdUrl() {
		return this.course && this.course.course_dvd_donation_url;
	}
	get studyGuideUrl() {
		return this.course && this.course.course_study_guide_donation_url;
	}
	get plural() {
		if (!this.course) return '';
		return this.course.pluralize_course_companion_button ? 's' : '';
	}

	constructor() {

	}

	ngOnInit() {
	}

}
