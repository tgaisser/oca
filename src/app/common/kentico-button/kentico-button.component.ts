import {Component, Input, OnInit} from '@angular/core';
import {Button} from '../../services/course-data.service';

@Component({
	selector: 'app-kentico-button',
	templateUrl: './kentico-button.component.html',
	styleUrls: ['./kentico-button.component.less']
})
export class KenticoButtonComponent implements OnInit {
	@Input() button: Button;
	@Input() buttonClasses = 'btn btn-primary';

	constructor() {
	}

	ngOnInit(): void {
	}

}
