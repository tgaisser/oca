import {ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
	AbstractControl,
	AsyncValidatorFn,
	FormControl,
	FormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmCodeService} from '../confirm-code/confirm-code.service';
import {EmailValidationResult, UserService} from '../../../services/user.service';
import {ToastrService} from 'ngx-toastr';
import {CustomValidators} from '../custom-validators';
import Auth from '@aws-amplify/auth';
import {catchError, concatMap, concatWith, filter, map, mergeMap, tap} from 'rxjs/operators';
import pickby from 'lodash.pickby';
import {LOCAL_STORAGE, SESSION_STORAGE} from '../../../common/models';
import {concat, from, iif, interval, Observable, of, Subscription, throwError} from 'rxjs';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import {CourseDataService} from '../../../services/course-data.service';
import {HAS_PENDING_LEARN_SUBMISSION, SUBJECT_PREF_KEY} from '../../../common/constants';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import * as userActions from '../../../state/user/actions';
import {Store} from '@ngrx/store';
import {State} from '../../../state';
import {markHeaderVisibility} from '../../../state/ui/actions';
import { SubjectPreferenceComponent } from './subject-preference.component';
import {userConfirmComplete} from '../../../state/user/actions';
import {LoadingService} from '../../../common/loading.service';

@Component({
	selector: 'app-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.less']
})
export class SignUpComponent implements OnDestroy, OnInit {
	@Input() simpleMode = false;
	@Input() submitText = 'Create Hillsdale Account';
	@Input() displayHeader = true;
	@Input() displaySignInLink = true;
	@Input() putTermsAndConditionsBeneathSubmitButton  = false;
	@Input()
	set emailInput(emailInput: string) {
		this.signupForm.patchValue({email: emailInput});
	}
	@Input()
	get includeSubjectPreference() {
		return this._includeSubjectPreference;
	}
	set includeSubjectPreference(value: boolean) {
		if (value) {
			this.signupForm.addControl('subjectPreference', new FormControl('', Validators.required));
		}
		this._includeSubjectPreference = value;
	}
	_includeSubjectPreference = false;

	hide = true;

	faEye = faEye;
	faEyeSlash = faEyeSlash;
	faFacebookSquare = faFacebookSquare;

	querySub: Subscription;
	invalidEmailSub: Subscription;

	signupForm: FormGroup = new FormGroup({
		title: new FormControl('', [Validators.required, Validators.minLength(1)]),
		firstname: new FormControl('', [Validators.required, Validators.minLength(1)]),
		lastname: new FormControl('', [Validators.required, Validators.minLength(1)]),
		email: new FormControl('', [Validators.email, Validators.required, SignUpComponent.createDeBounceEmailValidator()]),
		password: new FormControl('', CustomValidators.passwordValidators),
		// acceptTerms: new FormControl(false, Validators.requiredTrue),
		optInMarketing: new FormControl(false),
		invalidEmail: new FormControl('')
	});

	emailComplete = false;

	titleList = UserService.TITLE_LIST;
	subjectList = CourseDataService.SUBJECT_LIST;

	constructor(
		private notifySvc: ToastrService,
		private _authService: UserService,
		private _router: Router,
		public activeRoute: ActivatedRoute,
		private confirmSvc: ConfirmCodeService,
		private modalService: BsModalService,
		private userSvc: UserService,
		private store: Store<State>,
		@Inject(LOCAL_STORAGE) private localStorage: Storage,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage,
		private changeDetectorRef: ChangeDetectorRef,
		private loadingSvc: LoadingService
	) {	}

	// this ValidatorFn looks for another control named 'invalidEmail' on the
	// same form, and if it exists, and its value matches the value of
	// the control being validated, then there will be a validation error.
	static createDeBounceEmailValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (!control?.parent) {
				return null;
			} else if (control.value === control.parent?.get('invalidEmail').value) {
				return {email: true} as ValidationErrors;
			} else {
				return null;
			}
		};
	}

	ngOnInit() {
		this.querySub = this.activeRoute.queryParams.pipe(
			map(p => ({
				email: p.email,
			})),
			map(p => pickby(p)), //only keep properties that have non-falsey values
			filter(p => Object.keys(p).length > 0)
		)
			.subscribe(params => {
				this.signupForm.patchValue(params);

				let markCount = 0;
				const sub = interval(500).subscribe((val) => {
					this.store.dispatch(markHeaderVisibility({
						isVisible: false
					}));

					if (++markCount === 4) {
						sub.unsubscribe();
					}
				});
			});

		this.invalidEmailSub = this.signupForm.get('invalidEmail').valueChanges.subscribe(
			data => {
				this.signupForm.get('email').updateValueAndValidity({ onlySelf: false, emitEvent: true});
			}
		);
	}
	ngOnDestroy() {
		if (this.querySub && !this.querySub.closed) {
			this.querySub.unsubscribe();
			this.querySub = null;
		}
		if (this.invalidEmailSub && !this.invalidEmailSub.closed) {
			this.invalidEmailSub.unsubscribe();
			this.invalidEmailSub = null;
		}
	}

	// generatePassword() {
	// 	this.signupForm.patchValue({password: '&Snb7Hl.2'});
	// 	this.hide = false;
	// }

	signUp() {
		// console.log("sign up here", this.signupForm.valid);
		// console.log("sign up form", this.signupForm);
		if (!this.signupForm.valid) return;
		const formVal = this.signupForm.getRawValue();
		formVal.email = formVal.email.toLowerCase();

		this._authService.checkEmailWithDebounce(formVal.email).pipe(
			concatMap(emailCheckResult => {
				if (emailCheckResult.isValid === true) {
					// if debounce says VALID email, pass along an observable with result of _authService.createAccount()
					if (formVal.subjectPreference) {
						this.localStorage.setItem(SUBJECT_PREF_KEY, formVal.subjectPreference);
						this.sessionStorage.setItem(HAS_PENDING_LEARN_SUBMISSION, 'true');
					}
					return this._authService.createAccount(
						formVal.email,
						formVal.password,
						{
							title: formVal.title,
							firstname: formVal.firstname,
							lastname: formVal.lastname
						}
					);
				} else {
					// if debounce says invalid email, pass along the emailCheckResult
					return of(emailCheckResult);
				}})
		).subscribe({
			next: (data) => {
				if (data && ('isValid' in data) && (data.isValid === false)){
					this.signupForm.get('invalidEmail').setValue(data.input);
					this.changeDetectorRef.markForCheck();
					this.loadingSvc.hide();
				} else {
					// Email will be verified by Cognito automatically, so signin and go to the confirm page
					this.userSvc.logIn(formVal.email, formVal.password, false).subscribe(() => {
						this.notifySvc.success('Email address verified.<br>Hillsdale online courses account created.', '', { enableHtml: true });
						this.store.dispatch(userConfirmComplete({allowNavigate: true, email: formVal.email}));
						//just set the account as being confirmed. This will take them to the next screen
						this.loadingSvc.hide();
					}, error => {
						this._router.navigate(['auth/signin']);
						this.loadingSvc.hide();
					});
				}
			},
			error: (error) => {
				console.log(error);
				this.notifySvc.error('Unable to complete signup: ' + error.message);
				this.loadingSvc.hide();
			}
		});
	}

	async getSubjectPreference() {
		if (this._includeSubjectPreference) {
			return new Promise((res, rej) => {
				const ref = this.modalService.show(SubjectPreferenceComponent);
				ref.onHide.subscribe((r: string) => {
					// console.log('set subject', r);
					if (this.subjectList.map(s => s.codename).includes(r)) {
						this.localStorage.setItem(SUBJECT_PREF_KEY, r);
						this.sessionStorage.setItem(HAS_PENDING_LEARN_SUBMISSION, 'true');
						res(true);
					} else {
						res(false);
					}
				});
			});
		}
		return Promise.resolve(true);
	}

	handleSignin() {
		if (this._includeSubjectPreference) {
			this.store.dispatch(userActions.userSetPostLoginUrl({url: '/'}));
		}
	}
}
