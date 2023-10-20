import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import Auth, {CognitoUser} from '@aws-amplify/auth';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {LoadingService} from '../../../common/loading.service';
import {ConfirmCodeService} from '../confirm-code/confirm-code.service';
import {UserService} from '../../../services/user.service';
import {filter, map, tap} from 'rxjs/operators';
import pickby from 'lodash.pickby';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {State} from '../../../state';
import {userSetPostLoginUrl} from '../../../state/user/actions';
import {SESSION_STORAGE} from '../../../common/models';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';

@Component({
	selector: 'app-sign-in',
	templateUrl: './sign-in.component.html',
	styleUrls: ['./sign-in.component.less']
})
export class SignInComponent implements OnDestroy, OnInit {
	faEye = faEye;
	faEyeSlash = faEyeSlash;
	faFacebookSquare = faFacebookSquare;

	querySub: Subscription;

	signinForm: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.email, Validators.required]),
		password: new FormControl('', [Validators.required])
	});

	hide = true;

	get emailInput() {
		return this.signinForm.get('email');
	}

	get passwordInput() {
		return this.signinForm.get('password');
	}

	constructor(
		public auth: UserService,
		private _notification: ToastrService,
		private _router: Router,
		private activeRoute: ActivatedRoute,
		private _loader: LoadingService,
		private confirmSvc: ConfirmCodeService,
		private store: Store<State>,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage
	) {
	}

	ngOnInit() {
		this.querySub = this.activeRoute.queryParams.pipe(
			tap(p => {
				if (p.redirectUrl) {
					this.store.dispatch(userSetPostLoginUrl({url: p.redirectUrl}));
				}
			}),
			map(p => ({
				email: p.email,
			})),
			map(p => pickby(p)), //only keep properties that have non-falsey values
			filter(p => Object.keys(p).length > 0)
		)
			.subscribe(params => {
				this.signinForm.patchValue(params);
			});
	}
	ngOnDestroy() {
		if (this.querySub && !this.querySub.closed) {
			this.querySub.unsubscribe();
			this.querySub = null;
		}
	}

	getEmailInputError() {
		if (this.emailInput.hasError('email')) {
			return 'Please enter a valid email address.';
		}
		if (this.emailInput.hasError('required')) {
			return 'Email is required.';
		}
	}

	getPasswordInputError() {
		if (this.passwordInput.hasError('required')) {
			return 'Password is required.';
		}
	}

	signIn() {
		this._loader.show();
		this.auth.logIn(this.emailInput.value, this.passwordInput.value)
			.subscribe((user: CognitoUser | any) => {
				this._loader.hide();

				//set 2 second timeout to verify that _someone_ redirected us off this page
				setTimeout(() => {
					if (this._router.url !== '/auth/signin') return;
					//if we're still on the signin page after 5 seconds, move us home
					this._router.navigate(['']);
				}, 5000);
			}, (error: any) => {
				this._loader.hide();
				switch (error.code) {
				case 'UserNotFoundException':
					this._notification.error('User does not exist.<br>Please create an account.', '', {enableHtml: true});
					break;
				case 'UserNotConfirmedException':
					this.confirmSvc.email = this.emailInput.value;
					this.confirmSvc.password = this.passwordInput.value;
					this._router.navigate(['auth/confirm']);
					break;
				case 'UsernameExistsException':
					// this._router.navigate(['auth/signin']);
					// eslint-disable-next-line no-fallthrough
				default:
					this._notification.error(error.message);
				}
			});
	}
}
