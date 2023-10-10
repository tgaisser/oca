import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from '../custom-validators';
import {UserService} from '../../../services/user.service';
import {ToastrService} from 'ngx-toastr';
import {Subscription} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.less']
})
export class ChangePasswordComponent implements OnDestroy, OnInit {
	hidePasswords = true;
	submitted = false;

	faEye = faEye;
	faEyeSlash = faEyeSlash;

	identitySub: Subscription;

	changeCompleted = false;
	disablePasswordChange = false;
	disabledMessage = '';

	changePassForm: FormGroup = new FormGroup({
		oldPassword: new FormControl('', Validators.required),
		newPassword: new FormControl('', CustomValidators.passwordValidators),
	});

	constructor(private notifySvc: ToastrService, private _authService: UserService, private ref: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.changeCompleted = false;

		this.identitySub = this._authService
			.getIdentityProviders()
			.pipe(mergeMap(identities => this._authService.isPasswordUser().pipe(map(isPasswordUser => [isPasswordUser, identities]))))
			.subscribe(stuff => {
				const [isPasswordUser, identities] = stuff;
				// console.log('is password user', identities);
				if (identities.length && !isPasswordUser) {
					this.notifySvc.info(
						`You have signed in with ${identities[0]}.<br>If you need to change your password, please change your password in ${identities[0]}.`,
						'',
						{enableHtml: true, timeOut: 10000}
					);
					this.disablePasswordChange = true;

					this.disabledMessage = `You have signed in with ${identities[0]}.<br>If you need to change your password, please change your password in ${identities[0]}.`;
					this.changePassForm.disable();
				}
			});
	}

	ngOnDestroy() {
		if (this.identitySub && !this.identitySub.closed) {
			this.identitySub.unsubscribe();
			this.identitySub = null;
		}
	}

	changePassword() {
		this.submitted = true;

		if (!this.changePassForm.valid) return;

		const formVal = this.changePassForm.getRawValue();

		if (formVal.newPassword === formVal.oldPassword) {
			this.notifySvc.info('New password must not be the same as current password');
			return;
		}

		this._authService.changePassword(formVal.oldPassword, formVal.newPassword).subscribe((data) => {
			this.notifySvc.success('Password changed');
			this.changeCompleted = true;
			this.ref.markForCheck();
		}, (error) => {
			console.log(error);
			this.notifySvc.error('Unable to change password. ' + error.message);
		});
	}
}
