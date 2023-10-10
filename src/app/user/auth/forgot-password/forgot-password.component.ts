import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {UserService} from '../../../services/user.service';
import {LoadingService} from '../../../common/loading.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CustomValidators} from '../custom-validators';
import {Subscription} from 'rxjs';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.less']
})
export class ForgotPasswordComponent implements OnDestroy, OnInit {
	showResetPanel = false;
	hide = true;
	querySub: Subscription;

	requestResetForm: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
	});
	submittedRequest = false;

	resetForm: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		confirmCode: new FormControl('', [Validators.required, Validators.minLength(3)]),
		newPassword: new FormControl('', CustomValidators.passwordValidators)
	});
	submittedReset = false;

	faEye = faEye;
	faEyeSlash = faEyeSlash;

	constructor(
		private userSvc: UserService,
		private router: Router,
		private activeRoute: ActivatedRoute,
		private loadingService: LoadingService,
		private toaster: ToastrService) {
	}

	ngOnInit() {
		this.querySub = this.activeRoute.queryParams.subscribe(params => {
			if (params.email) {
				this.resetForm.patchValue({email: params.email});
				this.showResetPanel = true;
			}
			if (params.confirmcode) {
				this.resetForm.patchValue({confirmCode: params.confirmcode});
				this.showResetPanel = true;
			}
		});
	}
	ngOnDestroy() {
		if (this.querySub && !this.querySub.closed) {
			this.querySub.unsubscribe();
			this.querySub = null;
		}
	}

	requestReset() {
		this.submittedRequest = true;
		this.loadingService.show();
		const formVal: {email: string, confirmCode: string, newPassword: string} = this.requestResetForm.getRawValue();
		this.userSvc.requestPasswordReset(formVal.email?.toLowerCase()).subscribe(r => {
			this.loadingService.hide();

			console.log('Got reset response', r);

			//set the email in the other form
			this.resetForm.patchValue(formVal);

			//show messages to user
			this.toaster.success('Reset request submitted. Please check your email.');
			this.showResetPanel = true;
		}, err => {
			console.log('reset error', err);
			this.loadingService.hide();

			if (err.code === 'UserNotFoundException') {
				this.toaster.error('User does not exist.  Please create an account.');
			} else {
				this.toaster.error('Error requesting password reset. Please try again later.');
			}
		});
	}


	resetPassword() {
		this.submittedReset = true;
		this.loadingService.show();
		const vals = this.resetForm.getRawValue();
		this.userSvc.confirmPasswordReset(vals.email?.trim(), vals.confirmCode?.trim(), vals.newPassword).subscribe(r => {
			this.loadingService.hide();
			console.log('Got reset response', r);
			this.toaster.success('Password reset successfully.');
			this.router.navigateByUrl('/auth/signin');
		}, err => {
			console.log('reset error', err);
			this.loadingService.hide();
			this.toaster.error('Error resetting password. Please try again later.');
		});
	}

	showConfirmForm() {
		this.showResetPanel = true;
	}

	showRequestForm() {
		this.showResetPanel = false;
		this.resetForm.patchValue({confirmCode: '', password: ''});
	}
}
