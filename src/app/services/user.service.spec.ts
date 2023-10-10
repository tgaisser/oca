import {getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {UserService, DeBounceResponse, EmailValidationResult} from './user.service';
import {MockBrowserAbstractionModule} from '../../test.helpers';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Auth} from 'aws-amplify';
import {firstValueFrom, lastValueFrom, of, throwError} from 'rxjs';
import {UtmService} from './utm.service';
import {HttpClient} from '@angular/common/http';
import {ErrorWithCode} from '../common/error/ErrorWithCode';


describe('UserService', () => {
	let service: UserService;
	let utmService: UtmService;
	let mockHttp: HttpClient;

	const mockRes = {response: 'mockRes'};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MockBrowserAbstractionModule, HttpClientTestingModule]
		});

		service = TestBed.inject(UserService);
		utmService = TestBed.inject(UtmService);
		mockHttp = TestBed.inject(HttpClient);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should create Account', waitForAsync(() => {
		const attr = {
			title: 'mockTitle',
			firstname: 'mockFirstName',
			lastname: 'mockLastName'
		};

		const mockRes = {email: 'email@email.com', password: 'password', ...attr};

		utmService.getSerializedCodes = jest.fn().mockReturnValue('mock signup analytics');
		Auth.signUp = jest.fn().mockResolvedValue( mockRes );

		const data = firstValueFrom(service.createAccount('email@email.com', 'password', attr));
		return expect(data).resolves.toHaveProperty('email', 'email@email.com');
	}));

	describe('User is available', () => {

		it('checks if username is available -- unavailable user', waitForAsync(() => {
			jest.spyOn(service, 'logIn').mockReturnValue(of({data: 'mockData'}));
			const data = firstValueFrom(service.isUsernameAvailable('mockUsername'));
			return expect(data).resolves.toEqual(false);
		}));

		it('checks if username is available -- available user', waitForAsync(() => {
			jest.spyOn(service, 'logIn').mockReturnValue(throwError(() => new ErrorWithCode('UserNotFoundException')));
			const data = firstValueFrom(service.isUsernameAvailable('mockUsername'));
			return expect(data).resolves.toEqual(true);
		}));

		it('checks if username is available -- error non-available', waitForAsync(() => {
			jest.spyOn(service, 'logIn').mockReturnValue(throwError(() => new ErrorWithCode('any other error')));
			const data = firstValueFrom(service.isUsernameAvailable('mockUsername'));
			return expect(data).resolves.toEqual(false);
		}));

	});

	describe('check email with debounce', () => {
		let mockResponse: DeBounceResponse;
		let emailValidRes: EmailValidationResult;
		const errorExpectation: EmailValidationResult = {
			isValid: true,
			input: null,
			message: null
		};

		beforeEach(() => {
			emailValidRes = {
				input: 'mockEmail',
				isValid: true,
				message: null
			};
			mockResponse = {
				debounce: {
					error: null,
					email: 'mockEmail',
					code: '',
					role: '',
					free_email: '',
					result: '',
					reason: '',
					send_transactional: '',
					did_you_mean: ''
				},
				success: 'mockSuccess',
				balance: 'mockBalance'
			};
		});

		it('should checkEmailWithDebounce -- error',  waitForAsync(() => {
			jest.spyOn(mockHttp, 'get').mockReturnValue(throwError(() => new ErrorWithCode('UserNotFoundException')));
			const data = firstValueFrom(service.checkEmailWithDebounce('mockUsername'));
			return expect(data).resolves.toEqual(errorExpectation);
		}));

		it('should checkEmailWithDebounce -- success', waitForAsync(() => {
			jest.spyOn(mockHttp, 'get').mockReturnValue(of(mockResponse));
			// @ts-ignore
			jest.spyOn(service, 'evaluateDeBounceResponse').mockReturnValue(emailValidRes);
			const data = firstValueFrom(service.checkEmailWithDebounce('mockUsername'));
			return expect(data).resolves.toEqual(emailValidRes);
		}));

		describe('evaluate debounce response', () => {
			it('evaluateDeBounceResponse -- send transactional', () => {
				mockResponse.debounce.send_transactional = '1';
				emailValidRes.message = 'The email address is confirmed.';
				// @ts-ignore
				expect(service.evaluateDeBounceResponse(mockResponse)).toEqual(emailValidRes);
			});

			it('evaluateDeBounceResponse -- error', () => {
				mockResponse.debounce.error = 'error';
				// @ts-ignore
				expect(service.evaluateDeBounceResponse(mockResponse)).toEqual(emailValidRes);
			});

			it('evaluateDeBounceResponse -- debounce code 3', () => {
				mockResponse.debounce.code = '3';
				emailValidRes.message = 'Disposable email isn\'t accepted.';
				emailValidRes.isValid = false;
				// @ts-ignore
				expect(service.evaluateDeBounceResponse(mockResponse)).toEqual(emailValidRes);
			});

			it('evaluateDeBounceResponse -- email not valid', () => {
				emailValidRes.message = 'The email address is not valid!';
				emailValidRes.isValid = false;
				// @ts-ignore
				expect(service.evaluateDeBounceResponse(mockResponse)).toEqual(emailValidRes);
			});
		});
	});

	it('should getIdentityProviders', waitForAsync(() => {
		const mockData = {
			attributes: {
				identities: {
					field: 'mockIdentity',
					mockField: 'mockField'
				}
			},
		};

		Auth.currentAuthenticatedUser = jest.fn().mockResolvedValue( mockData );
		const data = firstValueFrom(service.getIdentityProviders());
		return expect(data).resolves.toEqual(mockData.attributes.identities);
	}));

	it('logIn should call Auth.signIn', waitForAsync (() => {
		Auth.signIn = jest.fn().mockResolvedValue( mockRes );
		const data = firstValueFrom(service.logIn('mockUsername', 'mockPassword'));
		return expect(data).resolves.toEqual(mockRes);
	}));

	it('getIdTokenJwt should call Auth.currentSession',  waitForAsync (() => {
		Auth.currentSession = jest.fn().mockResolvedValue({
			getIdToken: jest.fn().mockReturnValue({
				getJwtToken: jest.fn().mockReturnValue(mockRes)
			}),
		});
		firstValueFrom(service.getIdTokenJwt()).then(() => {
			expect(Auth.currentSession).toBeCalled();
		});
	}));

	it('getIdTokenJwt call Auth.resendSignUp', waitForAsync (() => {
		Auth.resendSignUp = jest.fn().mockResolvedValue(mockRes);
		firstValueFrom(service.resendConfirmCode('mockEmail')).then(() => {
			expect(Auth.resendSignUp).toBeCalled();
		});
	}));

	it('validateConfirmCode should call Auth.confirmSignUp', waitForAsync (() => {
		Auth.confirmSignUp = jest.fn().mockResolvedValue(mockRes);
		firstValueFrom(service.validateConfirmCode('mockEmail', 'mockCode')).then(() => {
			expect(Auth.confirmSignUp).toBeCalled();
		});
	}));

	it('request password reset should call Auth.forgotPassword', waitForAsync (() => {
		Auth.forgotPassword = jest.fn().mockResolvedValue( mockRes );
		firstValueFrom(service.requestPasswordReset('mockEmail')).then(() => {
			expect(Auth.forgotPassword).toBeCalled();
		});
	}));

	it('confirmPasswordReset should call Auth.forgotPasswordSubmit', waitForAsync (() => {
		Auth.forgotPasswordSubmit = jest.fn().mockResolvedValue( mockRes );
		firstValueFrom(service.confirmPasswordReset('mockEmail', 'mockCode', 'mockPassword')).then(() => {
			expect(Auth.forgotPasswordSubmit).toBeCalled();
		});
	}));

	it('changePassword should call Auth.changePassword', waitForAsync (() => {
		Auth.currentAuthenticatedUser = jest.fn().mockResolvedValue( {username: 'dummy'} );
		Auth.changePassword = jest.fn().mockResolvedValue( mockRes );
		jest.spyOn(service, 'isPasswordUser').mockReturnValue( of(true) );

		firstValueFrom(service.changePassword('mockPasswordOld', 'mockNewPassword') ).then((data) => {
			expect(Auth.currentAuthenticatedUser).toBeCalled();
			return expect(data).toEqual(mockRes);
		});
	}));

	it('changePassword should call Auth.currentAuthenticatedUser and throw Error', waitForAsync (() => {
		Auth.currentAuthenticatedUser = jest.fn().mockResolvedValue( mockRes );
		Auth.changePassword = jest.fn().mockResolvedValue( mockRes );

		jest.spyOn(service, 'isPasswordUser').mockReturnValue( of(false) );

		const shouldBeError = firstValueFrom(service.changePassword('mockPassworldOld', 'mockNewPassword'));
		return expect(shouldBeError).resolves.toThrow(TypeError);

	}));

	it('isPasswordUser should return true', waitForAsync (() => {
		Auth.currentAuthenticatedUser = jest.fn().mockResolvedValue({username: 'dummy'});
		const o = firstValueFrom(service.isPasswordUser(null));
		return expect(o).resolves.toStrictEqual(true);
	}));

	it('isPasswordUser should return false', waitForAsync (() => {
		Auth.currentAuthenticatedUser = jest.fn().mockResolvedValue({username: 'Google_dummy'});

		const o = firstValueFrom(service.isPasswordUser(null));

		return expect(o).resolves.toStrictEqual(false);
	}));

	it('test resendConfirmCode', waitForAsync (() => {
		jest.spyOn(Auth, 'resendSignUp').mockResolvedValue('dummy val');

		const r = firstValueFrom(service.resendConfirmCode('dummy@dummy.com'));
		return expect(r).resolves.toStrictEqual('dummy val');
	}));


	it('should log error in console so that it gets tracked in TrackJS', waitForAsync (() => {
		const consoleErrorSpy = jest.spyOn(console, 'error');

		const inputEmail = 'jwithee@hillsdale.ed';
		const dummyDebounceResponse = {
			debounce: {
				email: inputEmail,
				code: '6',
				role: 'false',
				free_email: 'false',
				result: 'Invalid',
				reason: 'Bounce',
				send_transactional: '0',
				did_you_mean: 'jwithee@hillsdale.edu'
			},
			success: '1',
			balance: '99'
		};

		jest.spyOn(mockHttp, 'get').mockReturnValueOnce(of(dummyDebounceResponse));

		firstValueFrom(service.checkEmailWithDebounce(inputEmail)).then(() => {
			expect(consoleErrorSpy).toBeCalled();
		});

	}));

	it('test DeBounce response cache', waitForAsync(() => {

		if (UserService.DEBOUNCE_RESULTS_CACHE) {
			UserService.DEBOUNCE_RESULTS_CACHE = {};
		}

		expect(UserService.DEBOUNCE_RESULTS_CACHE).toEqual({});

		const inputEmail = 'jwithee@hillsdale.ed';
		const dummyDebounceResponse = {
			debounce: {
				email: inputEmail,
				code: '6',
				role: 'false',
				free_email: 'false',
				result: 'Invalid',
				reason: 'Bounce',
				send_transactional: '0',
				did_you_mean: 'jwithee@hillsdale.edu'
			},
			success: '1',
			balance: '99'
		};

		jest.spyOn(service, 'checkEmailWithDebounce');
		const spyHttp = jest.spyOn(mockHttp, 'get').mockReturnValueOnce(of(dummyDebounceResponse));

		firstValueFrom(service.checkEmailWithDebounce(inputEmail)).then(() => {
			expect(spyHttp).toHaveBeenCalledTimes(1);
		});
		firstValueFrom(service.checkEmailWithDebounce(inputEmail)).then(() => {
			expect(spyHttp).toHaveBeenCalledTimes(1);
		});

	}));

});
