
import {Inject, Injectable} from '@angular/core';
import {from, lastValueFrom, Observable, ObservableInput, of, onErrorResumeNext, retryWhen} from 'rxjs';
import {catchError, concatMap, map, retry, tap} from 'rxjs/operators';
import Auth, {CognitoUser} from '@aws-amplify/auth';
import {LOCAL_STORAGE} from '../common/models';
import {UtmService} from './utm.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {isPlatformServer} from '@angular/common';
import {KenticoObject} from './course-data.service';

export interface User {
	id: string;
	email: string;
	username: string;
	firstname: string;
	lastname: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	title: string;
	userType: UserType;
	matchedAccounts?: UserMatch[];
	hasMergeAccounts?: boolean;
}

export enum UserType {
	Email = 'Email',
	Facebook = 'Facebook',
	Google = 'Google'
}

export interface UserMatch {
	type: UserType;
	userId: string;
	email: string;
	status: ('linked'|'ignore'|'found');
}

export interface CourseProgress {
	itemId: string;
	itemType: string;
	itemName: string;
	progressPercentage: number;
	completed: boolean;
	started: boolean;
	children?: CourseProgress[];
	videoStatuses?: VideoStatus[];
}

export interface VideoStatus {
	videoId: string;
	position: number;
	modifiedDate: Date;
}

@Injectable({
	providedIn: 'root'
})
export class UserService {

	public static DEBOUNCE_RESULTS_CACHE: {[email: string]: DeBounceResponse} = {};

	public static CONFIRM_EMAIL_KEY = 'ConfirmEmailAddress';
	public static CONFIRM_PASSWORD_KEY = 'ConfirmExtraToken';

	public static TITLE_LIST = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.'];
	public static STATE_LIST = [
		{
			groupLabel: 'United States',
			groupItems: [
				{key: 'AL', value: 'Alabama'},
				{key: 'AK', value: 'Alaska'},
				{key: 'AZ', value: 'Arizona'},
				{key: 'AR', value: 'Arkansas'},
				{key: 'CA', value: 'California'},
				{key: 'CO', value: 'Colorado'},
				{key: 'CT', value: 'Connecticut'},
				{key: 'DE', value: 'Delaware'},
				{key: 'DC', value: 'District Of Columbia'},
				{key: 'FL', value: 'Florida'},
				{key: 'GA', value: 'Georgia'},
				{key: 'HI', value: 'Hawaii'},
				{key: 'ID', value: 'Idaho'},
				{key: 'IL', value: 'Illinois'},
				{key: 'IN', value: 'Indiana'},
				{key: 'IA', value: 'Iowa'},
				{key: 'KS', value: 'Kansas'},
				{key: 'KY', value: 'Kentucky'},
				{key: 'LA', value: 'Louisiana'},
				{key: 'ME', value: 'Maine'},
				{key: 'MD', value: 'Maryland'},
				{key: 'MA', value: 'Massachusetts'},
				{key: 'MI', value: 'Michigan'},
				{key: 'MN', value: 'Minnesota'},
				{key: 'MS', value: 'Mississippi'},
				{key: 'MO', value: 'Missouri'},
				{key: 'MT', value: 'Montana'},
				{key: 'NE', value: 'Nebraska'},
				{key: 'NV', value: 'Nevada'},
				{key: 'NH', value: 'New Hampshire'},
				{key: 'NJ', value: 'New Jersey'},
				{key: 'NM', value: 'New Mexico'},
				{key: 'NY', value: 'New York'},
				{key: 'NC', value: 'North Carolina'},
				{key: 'ND', value: 'North Dakota'},
				{key: 'OH', value: 'Ohio'},
				{key: 'OK', value: 'Oklahoma'},
				{key: 'OR', value: 'Oregon'},
				{key: 'PA', value: 'Pennsylvania'},
				{key: 'RI', value: 'Rhode Island'},
				{key: 'SC', value: 'South Carolina'},
				{key: 'SD', value: 'South Dakota'},
				{key: 'TN', value: 'Tennessee'},
				{key: 'TX', value: 'Texas'},
				{key: 'UT', value: 'Utah'},
				{key: 'VT', value: 'Vermont'},
				{key: 'VA', value: 'Virginia'},
				{key: 'WA', value: 'Washington'},
				{key: 'WV', value: 'West Virginia'},
				{key: 'WI', value: 'Wisconsin'},
				{key: 'WY', value: 'Wyoming'},
			]
		},
		{
			groupLabel: 'Canada',
			groupItems: [
				{key: 'AB', value: 'Alberta'},
				{key: 'BC', value: 'British Columbia'},
				{key: 'MB', value: 'Manitoba'},
				{key: 'NB', value: 'New Brunswick'},
				{key: 'NL', value: 'Newfoundland and Labrador'},
				{key: 'NT', value: 'Northwest Territories'},
				{key: 'NS', value: 'Nova Scotia'},
				{key: 'NU', value: 'Nunavut'},
				{key: 'ON', value: 'Ontario'},
				{key: 'PE', value: 'Prince Edward Island'},
				{key: 'QC', value: 'Quebec'},
				{key: 'SK', value: 'Saskatchewan'},
				{key: 'YT', value: 'Yukon'},
			]
		}
	];

	constructor(@Inject(LOCAL_STORAGE) private localStorage: Storage, private utmService: UtmService, public httpService: HttpClient) { }

	createAccount(email: string, password: string, attributes: {[key: string]: any} = {}): Observable<any> {
		const attr: {title?: string, given_name?: string, family_name?: string, email: string} = {
			email,
		};
		if (attributes.title) {
			attr['custom:title'] = attributes.title;
		}
		if (attributes.firstname) {
			attr.given_name = attributes.firstname;
		}
		if (attributes.lastname) {
			attr.family_name = attributes.lastname;
		}
		attr['custom:signup_analytics'] = this.utmService.getSerializedCodes();

		return from(Auth.signUp({
			username: email,
			password,
			attributes: attr,
		})).pipe(
			tap(u => {
				this.localStorage.setItem(UserService.CONFIRM_EMAIL_KEY, email);
			})
		);
	}

	isPasswordUser(user?) {
		return from(
			(user ? Promise.resolve(user) : Auth.currentAuthenticatedUser())
				.then(u => u.username))
			.pipe(
				map(username => !(username.startsWith('Google_') || username.startsWith('Facebook_')))
			);
	}

	isUsernameAvailable(username: string) {
		return this.logIn(username.toLowerCase(), 'FAIL').pipe(
			map((user: CognitoUser | any) => {
				return !user; //if we got a user, then it's not available
			}),
			catchError((error: any) => {
				//if the response is that the account is not found, then the username is available
				if (error.code === 'UserNotFoundException') {
					return of(true);
				}
				//any other error, the username is not available
				return of(false);
			})
		);
	}

	checkEmailWithDebounce(email: string): Observable<DeBounceResponse | any> {
		const cachedDebounceResponse = UserService.DEBOUNCE_RESULTS_CACHE[email];
		if (cachedDebounceResponse) {
			return of(cachedDebounceResponse);
		}
		let headers = new HttpHeaders();
		headers = headers.append('Accept', 'application/json');
		return this.httpService.get<DeBounceResponse>(`https://api.debounce.io/v1/?api=${environment.deBouncePublicKey}&email=${email}`, {headers}).pipe(
			// return this.httpService.get(`https://josh123.free.beeceptor.com`, {responseType: 'text'}).pipe(map(r => this.getExampleDebounceObject('5')),
			// return of(this.getExampleDebounceObject('5')).pipe(
			map((response: DeBounceResponse): EmailValidationResult => {
				UserService.DEBOUNCE_RESULTS_CACHE[email] = response;
				if (response.debounce && response.debounce.send_transactional !== '1') {
					// log it in trackjs
					console.error('debounce', response.debounce);
				}
				return this.evaluateDeBounceResponse(response);
			}),
			catchError((err: any, caught: Observable<EmailValidationResult>): ObservableInput<any> => {
				console.error('err', err);
				// if there is a network error or debounce call limit is reached or anything else... just skip validation
				return of({ isValid: true, input: null, message: null } as EmailValidationResult);
			})
		);
	}

	private evaluateDeBounceResponse(response: DeBounceResponse): EmailValidationResult {
		const o: EmailValidationResult = { input: response.debounce.email, message: null, isValid: true };
		if (response.debounce.error){
			console.error('DeBounce: ' + response.debounce.error);
			o.isValid = true;
		} else if (response.debounce.send_transactional === '1') {
			o.message = 'The email address is confirmed.';
			o.isValid = true;
		} else {
			if (response.debounce.code === '3') {
				o.message = 'Disposable email isn\'t accepted.';
				o.isValid = false;
			} else {
				o.message = 'The email address is not valid!';
				o.isValid = false;
			}
		}
		return o;
	}

	// getExampleDebounceObject(code: string): DeBounceResponse {
	// 	if (code === 'random'){
	// 		const examples = ['0', '3', '5', 'invalid'];
	// 		code = examples[Math.floor((Math.random() * examples.length))];
	// 	}
	// 	let json = '';
	// 	if (code === '0'){ // exhausted daily # of calls for this IP address
	// 		json = '{"debounce":{"error":"Authentication Failed - The maximum number of calls per day reached."},"success":"0"}';
	// 	} else if (code === '5'){ // good email
	// 		json = '{"debounce":{"email":"jwithee@hillsdale.edu","code":"5","role":"false","free_email":"false","result":"Safe to Send","reason":"Deliverable","send_transactional":"1","did_you_mean":""},"success":"1","balance":"74"}';
	// 	} else if (code === '3'){ // disposable email (not allowed)
	// 		json = '{"debounce":{"email":"jwithee@gmai.com","code":"3","role":"false","free_email":"false","result":"Invalid","reason":"Disposable","send_transactional":"0","did_you_mean":"jwithee@gmail.com"},"success":"1","balance":"98"}';
	// 	} else { // not a valid email
	// 		json = '{"debounce":{"email":"jwithee@hillsdale.ed","code":"6","role":"false","free_email":"false","result":"Invalid","reason":"Bounce","send_transactional":"0","did_you_mean":"jwithee@hillsdale.edu"},"success":"1","balance":"99"}';
	// 	}

	// 	return JSON.parse(json);
	// }

	getIdentityProviders(user?) {
		return from(
			(user ? Promise.resolve(user) : Auth.currentAuthenticatedUser()).then(u => {
				console.log('info: ', u);
				const identities = JSON.parse((u.attributes && u.attributes.identities) || '[]');
				return (identities && identities.map(i => i.providerType)) || [];
			})
		);
	}

	logIn(username: string, password: string, allowNavigate = true): Observable<any> {
		return from(Auth.signIn(username.toLowerCase(), password)).pipe(
			tap(i => {
				//app.component uses Hub to watch for signIn events. Hence, we don't want to double those up. Don't emit here
				//this.store.dispatch(userLogInComplete({allowNavigate}));
				this.localStorage.removeItem(UserService.CONFIRM_EMAIL_KEY);
				this.localStorage.removeItem(UserService.CONFIRM_PASSWORD_KEY);
			})
		);
	}

	getIdTokenJwt() {
		return from(
			Auth.currentSession()
				.catch(e => null) //get the current session or null if not logged in
				.then(sess => {
					const authToken = sess && sess.getIdToken();
					return (authToken && authToken.getJwtToken()) || '';
				})
		);
	}

	// socialSignIn(provider: CognitoHostedUIIdentityProvider): Promise<ICredentials> {
	// 	return Auth.federatedSignIn({ provider });
	// }

	resendConfirmCode(email: string) {
		return from(Auth.resendSignUp(email));
	}

	validateConfirmCode(email: string, code: string) {
		return from(Auth.confirmSignUp(email, code));
	}

	requestPasswordReset(email: string) {
		return from(Auth.forgotPassword(email));
	}
	confirmPasswordReset(email: string, code: string, newPassword: string) {
		return from(Auth.forgotPasswordSubmit(email, code, newPassword));
	}

	changePassword(oldPass, newPass) {
		return from(
			Auth.currentAuthenticatedUser().then((u: CognitoUser | any) => {
				if (!u) throw new Error('No logged in user');
				return lastValueFrom(this.isPasswordUser(u)).then(isPass => [u, isPass]);
			}).then(([u, isPassword]) => {
				if (isPassword) {
					return Auth.changePassword(u, oldPass, newPass);
				} else {
					throw new Error('Cannot change password on user signed in via Facebook or Google');
				}
			})
		);
	}
}

export interface AuthUser {
	email: string;
	phone: string;
	password: string;
	firstName: string;
	lastName: string;
	address: string;
}

export class DeBounceResponse { debounce: Debounce; success: string; balance: string; }

interface Debounce {
	error: string; // this property exists only if there is an error
	email: string;
	code: string;
	role: string;
	free_email: string;
	result: string;
	reason: string;
	send_transactional: string;
	did_you_mean: string;
}

export class EmailValidationResult { input: string; isValid: boolean; message: string;  }
