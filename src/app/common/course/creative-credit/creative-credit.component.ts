import {Component, Input, OnInit, Pipe, PipeTransform} from '@angular/core';
import {CreativeCredit} from '../../../services/course-data.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({

	selector: '[app-creative-credit]',
	template: `
		<span *ngIf="safeMediaTitleUrl; else elseBlock">
			{{creativeCredit.video_position}} - <a [href]="safeMediaTitleUrl" [innerHTML]="creativeCredit.media_title|hcSimpleMd" target="_blank" rel="noopener noreferrer">{{creativeCredit.media_title}}</a> by {{creativeCredit.creator}} is licensed under {{creativeCredit.license}}
		</span>
		<ng-template #elseBlock>
			<span>
				{{creativeCredit.video_position}} - <span [innerHTML]="creativeCredit.media_title|hcSimpleMd"></span> by {{creativeCredit.creator}} from {{creativeCredit.source}} ({{creativeCredit.license}})
			</span>
		</ng-template>
	`,
})
export class CreativeCreditComponent implements OnInit {

	@Input() creativeCredit: CreativeCredit;
	get safeMediaTitleUrl(): SafeUrl {
		if (Boolean(this.creativeCredit?.media_url) === false){
			return null;
		}else{
			return this.sanitizer.bypassSecurityTrustUrl(this.creativeCredit.media_url);
		}
	}

	constructor(private sanitizer: DomSanitizer) { }

	ngOnInit(): void {}

}
