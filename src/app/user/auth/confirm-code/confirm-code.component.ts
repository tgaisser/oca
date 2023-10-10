import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {ConfirmCodeService} from './confirm-code.service';
import {UserService} from '../../../services/user.service';
import {LoadingService} from '../../../common/loading.service';
import {Store} from '@ngrx/store';
import {State} from '../../../state';
import {userConfirmComplete} from '../../../state/user/actions';
import {LOCAL_STORAGE} from '../../../common/models';
import {take} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {WindowTrackingService} from '../../../services/window-tracking.service';

@Component({
	selector: 'app-confirm-code',
	templateUrl: './confirm-code.component.html',
	styleUrls: ['./confirm-code.component.less']
})
export class ConfirmCodeComponent implements OnDestroy, OnInit {

	paramsSub: Subscription;

	confirmForm: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		code: new FormControl('', [Validators.required, Validators.min(3)])
	});
	confirmFormSubmitted = false;

	accountConfirmed = false;
	gotEmail = false;
	gotCode = false;

	constructor(
		private store: Store<State>,
		private _router: Router,
		private userSvc: UserService,
		private _notification: ToastrService,
		private confirmSvc: ConfirmCodeService,
		private loading: LoadingService,
		private activeRoute: ActivatedRoute,
		private windowTracking: WindowTrackingService,
		@Inject(LOCAL_STORAGE) private localStorage: Storage
	) { }

	ngOnInit() {
		const savedEmail = this.localStorage.getItem(UserService.CONFIRM_EMAIL_KEY);
		if (savedEmail) {
			this.confirmForm.patchValue({email: savedEmail});
			this.gotEmail = true;
		}

		this.paramsSub = this.activeRoute.queryParams.pipe(
			take(1)
		).subscribe(params => {
			if (params.email) {
				this.gotEmail = true;
				this.confirmForm.patchValue({email: params.email});
			}
			if (params.confirmcode) {
				this.confirmForm.patchValue({code: params.confirmcode});
				this.gotCode = true;
			} else {
				this.gotCode = false;
			}
		});
	}

	ngOnDestroy() {
		if (this.paramsSub && !this.paramsSub.closed) {
			this.paramsSub.unsubscribe();
			this.paramsSub = null;
		}
	}

	sendAgain() {
		const form = this.confirmForm.getRawValue();

		const email = form.email || prompt('It looks like you haven\'t provided the email you\'re trying to confirm. Please provide it here.');
		this.windowTracking.trackEvent({event: 'resendConfirmCodeRequested'});
		this.userSvc.resendConfirmCode(email).subscribe(
			() => this._notification.success('A code has been emailed to you'),
			(e) => {
				console.error('unable to resend confirm', e);
				this._notification.error('An error occurred');
			}
		);
	}

	confirmCode() {
		this.confirmFormSubmitted = true;
		this.loading.show();
		const form = this.confirmForm.getRawValue();
		this.userSvc.validateConfirmCode(form.email?.trim(), form.code?.trim()).subscribe(data => {
			this.loading.hide();
			console.log('validateConfirmCode result', data);
			this.accountConfirmed = data === 'SUCCESS';

			if (!this.accountConfirmed) {
				this._notification.error('Incorrect confirm code. Please try again.');
				return;
			}

			if (form.email && this.confirmSvc.password) {
				this.userSvc.logIn(form.email, this.confirmSvc.password, false).subscribe(() => {
					this._notification.success('Email address verified.<br>Hillsdale online courses account created.', '', { enableHtml: true });
					this.store.dispatch(userConfirmComplete({allowNavigate: true, email: form.email}));
					//just set the account as being confirmed. This will take them to the next screen
				}, error => {
					this._router.navigate(['auth/signin']);
				});
			} else {
				//TODO emit confirmComplete status
				this._notification.success('Hillsdale online courses account confirmed. You may now log in.');
				//if we don't have a username/password stashed, send them to signin
				this._router.navigate(['auth/signin']);
			}
		},
		error => {
			this.loading.hide();
			console.log(error);
			this._notification.error(error.message);
		},
		() => this.loading.hide());
	}

}


