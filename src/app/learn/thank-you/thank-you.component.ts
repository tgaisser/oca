import {Component, Inject, Input, OnInit} from '@angular/core';
import {PageLearn} from '../../services/course-data.service';
import {HAS_PENDING_LEARN_SUBMISSION, SUBJECT_PREF_KEY} from '../../common/constants';
import {LOCAL_STORAGE, SESSION_STORAGE} from '../../common/models';
import {UserDataService} from '../../services/user-data.service';
import {filter, mergeMap, tap} from 'rxjs/operators';

@Component({
	selector: 'app-thank-you',
	templateUrl: './thank-you.component.html',
	styleUrls: ['./thank-you.component.less']
})
export class ThankYouComponent implements OnInit {
	@Input() pageLearn: PageLearn;
	subjectPreference = this.localStorage.getItem(SUBJECT_PREF_KEY);

	constructor(
		@Inject(LOCAL_STORAGE) private localStorage: Storage,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage,
		private userData: UserDataService
	) { }

	ngOnInit(): void {
		if (this.subjectPreference) {
			this.userData.getUserPreferences().pipe(
				filter(p => !p.subjectPreference),
				mergeMap(_ => this.userData.saveUserSubjectPreferences(this.subjectPreference))
			).subscribe(r => {
				console.log('saved subject preference', r);
			});
		}
		this.sessionStorage.removeItem(HAS_PENDING_LEARN_SUBMISSION);
	}

}
