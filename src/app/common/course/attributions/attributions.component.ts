import {Component, Input, OnInit} from '@angular/core';
import {CreativeCredit} from '../../../services/course-data.service';

@Component({
	selector: 'app-attributions',
	templateUrl: './attributions.component.html',
	styleUrls: ['./attributions.component.less']
})
export class AttributionsComponent implements OnInit {

	_attributions: CreativeCredit[];
	get attributions(){
		return this._attributions;
	}
	@Input() set attributions(value) {
		if (Array.isArray(value)){
			this._attributions = [...value].sort(this.compareByVideoPosition);
		}else{
			this._attributions = [];
		}
	}

	@Input() lectureId: string;

	constructor() { }

	ngOnInit(): void {}

	// CreativeCredit.video_position has format h:mm:ss
	compareByVideoPosition(cc1: CreativeCredit, cc2: CreativeCredit): number {
		return (Number(cc1.video_position.replace(/:/g, '')) - Number(cc2.video_position.replace(/:/g, '')));
	}
}
