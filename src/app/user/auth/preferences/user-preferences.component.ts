import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CognitoUser} from '@aws-amplify/auth';
import {State} from '../../../state';
import {ToastrService} from 'ngx-toastr';
import {LoadingService} from '../../../common/loading.service';
import {Store} from '@ngrx/store';
import {UserDataService} from '../../../services/user-data.service';
import {catchError, tap} from 'rxjs/operators';
import {EMPTY, Subscription} from 'rxjs';
import {IntroJsService} from '../../../services/intro-js.service';
import {userSetPreferences} from '../../../state/user/actions';

@Component({
	selector: 'app-edit-profile',
	templateUrl: './user-preferences.component.html',
	styleUrls: ['./user-preferences.component.less']
})
export class UserPreferencesComponent implements OnDestroy, OnInit {

	loadSub: Subscription;

	emailFrequencyList = [
		'Weekly',
		'Monthly',
		'Never'
	];
	preferencesForm: FormGroup = new FormGroup({
		emailFrequency: new FormControl('Weekly', Validators.required),
		preferAudioLectures: new FormControl(false),
		storeAudioOffline: new FormControl(false),
		dataSaver: new FormControl(false),
	});

	user: CognitoUser;
	savedPrefs: any = {};

	constructor(
		private _userDataService: UserDataService,
		private _notification: ToastrService,
		private introJs: IntroJsService,
		public loading: LoadingService,
		private store: Store<State>
	) {
	}

	ngOnInit() {
		this.loading.show();
		this.loadSub = this.loadUserPreferences().subscribe(() => {
			this.loading.hide();
		});
	}
	ngOnDestroy() {
		if (this.loadSub && !this.loadSub.closed) {
			this.loadSub.unsubscribe();
			this.loadSub = null;
		}
	}

	loadUserPreferences() {
		return this._userDataService.getUserPreferences().pipe(tap(d => {
			const val = {
				emailFrequency: d.progressReportFrequency,
				preferAudioLectures: d.preferAudioLectures,
				dataSaver: d.dataSaver,
				storeAudioOffline: d.storeAudioOffline,
			};
			this.savedPrefs = val;
			this.preferencesForm.patchValue(val);
		}));
	}

	async editProfile() {
		//this chunk will run async
		const settingsVal = this.preferencesForm.getRawValue();
		//only run the update if something has actually changed since this data was loaded.
		if (JSON.stringify(this.savedPrefs) !== JSON.stringify(settingsVal)) {
			this.loading.show();

			this._userDataService.saveUserPreferences({
				progressReportFrequency: settingsVal.emailFrequency,
				preferAudioLectures: settingsVal.preferAudioLectures,
				dataSaver: settingsVal.dataSaver,
				storeAudioOffline: settingsVal.storeAudioOffline
			})
				.pipe(catchError(err => {
					console.error('error saving preferences', err);
					this._notification.warning('Email preferences may not have saved. Please try again later.');
					this.loading.hide();
					return EMPTY;
				}))
				.subscribe(r => {
				//yay! it worked. We probably don't actually need a message for this. The user likely doesn't realize they are different
					this.savedPrefs = settingsVal;
					this.store.dispatch(userSetPreferences({preferences: r}));
					this.loading.hide();
				});
		}
	}

	resetWalkthroughCookies() {
		this.introJs.clearTours();
		this._notification.success('Course Page Orientation has been reset.');
	}
}
