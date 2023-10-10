import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Course} from '../../services/course-data.service';

import {faFacebookF, faTwitter} from '@fortawesome/free-brands-svg-icons';
import {faEnvelope} from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-social-share',
	templateUrl: './social-share.component.html',
	styleUrls: ['./social-share.component.less']
})
export class SocialShareComponent implements OnInit, OnChanges {
	@Input() shareURL = '';
	@Input() shareText = '';
	@Input() facebook = false;
	@Input() twitter = false;
	@Input() email = false;

	faFacebookF = faFacebookF;
	faTwitter = faTwitter;
	faEnvelope = faEnvelope;

	constructor() { }

	ngOnInit() { }

	ngOnChanges(changes: SimpleChanges): void {
		// console.log('Share URL change:', changes.shareURL);
		this.shareURL = encodeURIComponent(changes.shareURL.currentValue);
		// console.log('Share URL encode:', this.shareURL);
	}
}
