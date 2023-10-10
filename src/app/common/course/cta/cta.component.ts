import { Component, OnInit, Input } from '@angular/core';
import { Course } from '../../../services/course-data.service';

@Component({
	selector: 'app-cta',
	templateUrl: './cta.component.html',
	styleUrls: ['./cta.component.less']
})
export class CtaComponent implements OnInit {
	@Input() course: Course = null;

	constructor() {}

	ngOnInit() {}
}
