import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import Auth, {CognitoUser} from '@aws-amplify/auth';
import {State} from '../../../state';
import {ToastrService} from 'ngx-toastr';
import {LoadingService} from '../../../common/loading.service';
import {UserService, UserType} from '../../../services/user.service';
import {Store} from '@ngrx/store';
import {userProfileUpdate} from '../../../state/user/actions';
import {UserDataService} from '../../../services/user-data.service';
import {from, Subscription} from 'rxjs';
import {IntroJsService} from '../../../services/intro-js.service';
import {CourseDataService} from '../../../services/course-data.service';

@Component({
	selector: 'app-edit-profile',
	templateUrl: './edit-profile.component.html',
	styleUrls: ['./edit-profile.component.less']
})
export class EditProfileComponent implements OnDestroy, OnInit {

	stateList = UserService.STATE_LIST;
	titleList = UserService.TITLE_LIST;

	loadSub: Subscription;

	profileForm: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.email]),
		phone: new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
		title: new FormControl('', [Validators.required, Validators.minLength(1)]),
		fname: new FormControl('', [Validators.required, Validators.minLength(2)]),
		lname: new FormControl('', [Validators.required, Validators.minLength(2)]),
		address_line1: new FormControl(''),
		address_line2: new FormControl(''),
		address_city: new FormControl(''),
		address_state: new FormControl(''),
		address_postal_code: new FormControl(''),
	});

	user: CognitoUser;
	savedPrefs: any = {};
	savedProfile: any = {};

	constructor(
		private _authService: UserService,
		private _userDataService: UserDataService,
		private _notification: ToastrService,
		private introJs: IntroJsService,
		public loading: LoadingService,
		private store: Store<State>
	) {
	}

	ngOnInit() {
		this.loading.show();
		this.loadSub = from(this.loadUserProfile()).subscribe(() => {
			this.loading.hide();
		});
	}
	ngOnDestroy() {
		if (this.loadSub && !this.loadSub.closed) {
			this.loadSub.unsubscribe();
			this.loadSub = null;
		}
	}

	async loadUserProfile() {
		const mProfile = await Auth.currentUserInfo();
		//this.user is required to call updateUserAttributes
		this.user = await Auth.currentAuthenticatedUser();

		console.log('got savedProfile', mProfile, this.user);
		// if (this.savedProfile.attributes.savedProfile) {
		// }

		this.savedProfile = {
			email: mProfile.attributes.email,
			title: mProfile.attributes['custom:title'],
			fname: mProfile.attributes.given_name,
			lname: mProfile.attributes.family_name,
			phone: mProfile.attributes.phone_number ? mProfile.attributes.phone_number.slice(-10) : '',
			address_line1: mProfile.attributes['custom:address_line1'],
			address_line2: mProfile.attributes['custom:address_line2'],
			address_city: mProfile.attributes['custom:address_city'],
			address_state: mProfile.attributes['custom:address_state'],
			address_postal_code: mProfile.attributes['custom:address_postal_code'],
		};

		this.profileForm.patchValue(this.savedProfile);
		console.log('value', this.profileForm.getRawValue());
	}

	async editProfile() {
		this.loading.show();

		try {
			//this will run synchronously. Since the is the bulk (and important part) of the work, we'll only wait for this.
			const newProfile = this.profileForm.getRawValue();
			//only run the update if something has actually changed since this data was loaded.
			if (JSON.stringify(newProfile) !== JSON.stringify(this.savedProfile)) {
				const attributes = {
					'custom:title': newProfile.title,
					given_name: newProfile.fname,
					family_name: newProfile.lname,
					phone_number: newProfile.phone && ('+1' + newProfile.phone) || '',
					'custom:address_line1': newProfile.address_line1 || '',
					'custom:address_line2': newProfile.address_line2 || '',
					'custom:address_city': newProfile.address_city || '',
					'custom:address_state': newProfile.address_state || '',
					'custom:address_postal_code': newProfile.address_postal_code || '',
				};
				await Auth.updateUserAttributes(this.user, attributes);

				this.savedProfile = newProfile;

				this.store.dispatch(userProfileUpdate({user: {
					id: (this.user as any).attributes.sub,
					username: (this.user as any).username,
					userType: UserType.Email,
					title: newProfile.title,
					firstname: attributes.given_name,
					lastname: attributes.family_name,
					email: newProfile.email,
					address: attributes['custom:address_line1'],
					city: attributes['custom:address_city'],
					state: attributes['custom:address_state'],
					zip: attributes['custom:address_postal_code']
				}}));
			}

			//once we're processed both sub-forms, show that everything has finished.
			this._notification.success('Your profile information has been updated.');
		} catch (error) {
			console.log(error);
			this._notification.error('Your profile could not be saved. Please try again later.');
			//TODO include useful information
		} finally {
			this.loading.hide();
		}
	}
}
