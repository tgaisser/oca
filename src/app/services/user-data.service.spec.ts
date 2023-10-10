import { TestBed, waitForAsync } from '@angular/core/testing';

import {UserDataService} from './user-data.service';
import {HttpClient} from '@angular/common/http';
import * as helpers from '../../test.helpers';
import {CourseDataService} from './course-data.service';
import {MockBrowserAbstractionModule} from '../../test.helpers';
import {HttpClientTestingModule, TestRequest} from '@angular/common/http/testing';
import {CookieService} from 'ngx-cookie-service';
import {DOCUMENT} from '@angular/common';
import {WindowBehaviorService} from './window-behavior.service';
import {
	LOCAL_STORAGE,
	WatchInfo,
	QuizResult,
	UserPreferences
} from '../common/models';
import { firstValueFrom, lastValueFrom, of, throwError } from 'rxjs';
import { EmailValidationResult, UserMatch, UserType } from './user.service';
import { Component } from '@angular/core';
import { VideoPostInfo } from '../state/courses/actions';

describe('UserDataService', () => {
	let service: UserDataService;
	let cookie: CookieService;
	let http: HttpClient;
	let document: any;
	let windowBehv: WindowBehaviorService;
	let localStorage: any;

	let mockHttp: HttpClient;
	let mockReturn;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, MockBrowserAbstractionModule],
			providers: [
				UserDataService,
				CookieService,
				// provideMockStore({initialState: mockInitialState})
			]
		});
	}));

	beforeEach(() => {
		http = TestBed.inject(HttpClient);
		cookie = TestBed.inject(CookieService);
		document = TestBed.inject(DOCUMENT);
		windowBehv = TestBed.inject(WindowBehaviorService);
		localStorage = TestBed.inject(LOCAL_STORAGE);
		service = TestBed.inject(UserDataService); //new UserDataService(httpClient, TestBed.inject(CookieService));
		mockHttp = TestBed.inject(HttpClient);
		mockReturn = {
			mockField: 'mockReturn'
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should enrollInCourse', waitForAsync(() => {
		jest.spyOn(mockHttp, 'put').mockReturnValue(of(mockReturn));
		const data = lastValueFrom(service.enrollInCourse(mockReturn.courseId, 'mockStudyGroupId') );
		return expect(data).resolves.toHaveProperty('courseId', mockReturn.courseId);
	}));

	it('should unenrollInCourse', waitForAsync(() => {
		const mockReasonNumber = 8;
		jest.spyOn(mockHttp, 'put').mockReturnValue(of(mockReturn));
		const data = lastValueFrom( service.unenrollFromCourse(mockReturn.courseId, mockReasonNumber) );
		return expect(data).resolves.toHaveProperty('courseId', mockReturn.courseId);
	}));

	it('should getCoursesProgress', waitForAsync(() => {
		jest.spyOn(mockHttp, 'get').mockReturnValue(of(mockReturn));
		lastValueFrom(service.getCoursesProgress() ).then(() => {
			expect(mockHttp.get).toBeCalled();
		});
	}));

	it('should getEnrolledCourses', waitForAsync(() => {
		jest.spyOn(mockHttp, 'get').mockReturnValue(of(mockReturn));
		lastValueFrom(service.getEnrolledCourses()).then(() => {
			expect(mockHttp.get).toBeCalled();
		});
	}));

	it('should getCourseProgress', waitForAsync(() => {
		jest.spyOn(mockHttp, 'get').mockReturnValue(of(mockReturn));
		lastValueFrom(service.getCourseProgress('mockCourseId')).then(() => {
			expect(mockHttp.get).toBeCalled();
		});
	}));

	it('should getWithdrawalReasons', waitForAsync(() => {
		jest.spyOn(mockHttp, 'get').mockReturnValue(of(mockReturn));
		lastValueFrom(service.getWithdrawalReasons()).then(() => {
			expect(mockHttp.get).toBeCalled();
		});
	}));

	it('should markCourseOpen', waitForAsync(() => {
		jest.spyOn(mockHttp, 'put').mockReturnValue(of(mockReturn));
		lastValueFrom(service.markCourseOpen('mockCourseId') ).then(() => {
			expect(mockHttp.put).toBeCalled();
		});
	}));

	it('should markFileDownload', waitForAsync(() => {
		jest.spyOn(mockHttp, 'post').mockReturnValue(of(mockReturn));
		lastValueFrom(service.markFileDownload('mockCourseId', 'mockLectureId', 'mockFileUrl', 'mockFileUrl') ).then(() => {
			expect(mockHttp.post).toBeCalled();
		});
	}));

	it('should markLectureOpen', waitForAsync(() => {
		jest.spyOn(mockHttp, 'put').mockReturnValue(of(mockReturn));
		lastValueFrom( service.markLectureOpen('mockCourseId', 'mockLectureId') ).then(() => {
			expect(mockHttp.put).toBeCalled();
		});
	}));

	it('should mergeAccounts', waitForAsync(() => {
		const mockUserMatch: UserMatch[] = [{
			type: UserType.Email,
			userId: 'mockId',
			email: 'email@email.com',
			status: 'linked',
		},{
			type: UserType.Email,
			userId: 'mockId',
			email: 'email@email.com',
			status: 'linked',
		}];

		jest.spyOn(mockHttp, 'post').mockReturnValue(of(mockReturn));
		lastValueFrom(service.mergeAccounts(mockUserMatch) ).then(() => {
			expect(mockHttp.post).toBeCalled();
		});
	}));

	it('should markAccountsIgnored', waitForAsync(() => {
		const mockUserMatch: UserMatch[] = [{
			type: UserType.Email,
			userId: 'mockId',
			email: 'email@email.com',
			status: 'linked',
		},{
			type: UserType.Email,
			userId: 'mockId',
			email: 'email@email.com',
			status: 'linked',
		}];

		jest.spyOn(mockHttp, 'put').mockReturnValue(of(mockReturn));
		lastValueFrom(service.markAccountsIgnored(mockUserMatch) ).then(() => {
			expect(mockHttp.put).toBeCalled();
		});
	}));

	it('should submitHubspotForm', waitForAsync(() => {
		jest.spyOn(mockHttp, 'post').mockReturnValue(of(mockReturn));
		// @ts-ignore
		lastValueFrom(service.submitHubspotForm('mockFormId', {mockField: 'data'} ) ).then(() => {
			expect(mockHttp.post).toBeCalled();
		});
	}));

	describe('test hubspot submission form', () => {

		it('should markAccountVerified', waitForAsync(() => {
			const spy = jest.spyOn(UserDataService.prototype as any, 'submitHubspotForm');
			lastValueFrom(service.markAccountVerified('email') ).then(() => {
				expect(spy).toBeCalled();
			});
		}));

		it('should markCourseInquiry', waitForAsync(() => {
			const spy = jest.spyOn(UserDataService.prototype as any, 'submitHubspotForm');
			lastValueFrom(service.markCourseInquiry('email', helpers.getMockCourse()) ).then(() => {
				expect(spy).toBeCalled();
			});
		}));

		it('should markCourseStudyGroup', waitForAsync(() => {
			const spy = jest.spyOn(UserDataService.prototype as any, 'submitHubspotForm');
			lastValueFrom(service.markCourseStudyGroup('email', helpers.getMockCourse()) ).then(() => {
				expect(spy).toBeCalled();
			});
		}));

		it('should markProfileSubmit', waitForAsync(() => {
			const spy = jest.spyOn(UserDataService.prototype as any, 'submitHubspotForm');
			lastValueFrom(service.markProfileSubmit( helpers.getMockUser({})) ).then(() => {
				expect(spy).toBeCalled();
			});
		}));
	});

	describe('test markSocialSigninComplete', () => {

		it('should markSocialSigninComplete', waitForAsync(() => {
			jest.spyOn(mockHttp, 'put').mockReturnValue(of(true));
			lastValueFrom(service.markSocialSigninComplete() ).then(() => {
				expect(mockHttp.put).toBeCalled();
			});
		}));

		it('should markSocialSigninComplete -- failed', waitForAsync(() => {
			jest.spyOn(mockHttp, 'put').mockReturnValueOnce(throwError(()=> {new Error();}));
			const data = lastValueFrom(service.markSocialSigninComplete() );
			return expect(data).resolves.toBe(false);
		}));
	});

	it('should postBulkVideoProgress', waitForAsync(() => {
		const records: WatchInfo[] = [{
			start: {pos: 1, time: new Date},
			end: {pos: 2, time: new Date}
		}];
		jest.spyOn(mockHttp, 'put').mockReturnValue(of(true));
		const data = service.postBulkVideoProgress('mockCourseId', 'mockLectureId', 'mockVideoId', 'mockType', records);
		return expect(data).resolves.toBeTruthy;
	}));

	it('should postBulkVideoProgress -- failed', waitForAsync(() => {
		const records: WatchInfo[] = [{
			start: {pos: 1, time: new Date},
			end: {pos: 2, time: new Date}
		}];
		jest.spyOn(mockHttp, 'put').mockReturnValueOnce(throwError(()=> {new Error();}));
		const data = service.postBulkVideoProgress('mockCourseId', 'mockLectureId', 'mockVideoId', 'mockType', records);
		return expect(data).resolves.toBeNull;
	}));

	it('should postVideoProgress', waitForAsync(() => {
		const mockVideoPostInfo: VideoPostInfo[] = [{
			userId: 'mock',
			courseId: 'mock',
			contentId: 'mock',
			videoId: 'mock',
			progress: 1,
			eventTime: 1,
			lectureType: 'mock',
		}];
		jest.spyOn(mockHttp, 'put').mockReturnValue(of(true));
		const data = service.postVideoProgress(mockVideoPostInfo);
		return expect(data).resolves.toBeTruthy;
	}));

	it('should postVideoProgress -- failed', waitForAsync(() => {
		const mockVideoPostInfo: VideoPostInfo[] = [{
			userId: 'mock',
			courseId: 'mock',
			contentId: 'mock',
			videoId: 'mock',
			progress: 1,
			eventTime: 1,
			lectureType: 'mock',
		}];
		jest.spyOn(mockHttp, 'put').mockReturnValueOnce(throwError(()=> {new Error();}));
		const data = service.postVideoProgress(mockVideoPostInfo);
		return expect(data).resolves.toBeNull;
	}));

	describe('test note services', () => {

		it('should getNotesInfo', waitForAsync(() => {
			jest.spyOn(mockHttp, 'put').mockReturnValue(of( [{id: 'mocknotearray', createDate: '01/01/2000'}, {id: 'mockNoteArray', updateDate: '01/01/2000' }] ));
			lastValueFrom(service.getNotesInfo('mockCourseId') ).then(() => {
				expect(mockHttp.put).toBeCalled();
			});
		}));

		it('should getNote', waitForAsync(() => {
			jest.spyOn(mockHttp, 'get').mockReturnValue(of( {id: 'mocknotearray', createDate: '01/01/2000'} ));
			lastValueFrom(service.getNote('mockCourseId', 'mockLectureId')).then(() => {
				expect(mockHttp.get).toBeCalled();
			});
		}));

		it('should getNotes', waitForAsync(() => {
			jest.spyOn(mockHttp, 'get').mockReturnValue(of( [{id: 'mocknotearray', createDate: '01/01/2000'}, {id: 'mockNoteArray', updateDate: '01/01/2000' }] ));
			lastValueFrom(service.getNotes('mockCourseId') ).then(() => {
				expect(mockHttp.get).toBeCalled();
			});
		}));

		it('should saveNote', waitForAsync(() => {
			const spy = jest.spyOn(mockHttp, 'put').mockReturnValue(of( {id: 'mocknotearray', createDate: '01/01/2000'} ));
			lastValueFrom(service.saveNote('mockCourseId', 'mockLectureId', 'mockText') ).then(() => {
				expect(mockHttp.put).toBeCalled();
			});
		}));

		it('should saveNote -- error', waitForAsync(() => {
			const err = { response: 'resp', status: '4xx' };
			mockHttp.post = jest.fn(() => throwError(() => { err; }) );
			const data = lastValueFrom(service.saveNote('mockCourseId', 'mockLectureId', 'mockText') );
			return expect(data).resolves.toBe(TypeError);
		}));
	});

	describe('test quiz services', () => {

		it('should getQuizResult', waitForAsync(() => {
			jest.spyOn(mockHttp, 'get').mockReturnValue(of( helpers.getMockQuizResult() ));
			lastValueFrom(service.getQuizResult('mockCourseId', 'mockLectureId', 'mockQuizName') ).then(() => {
				expect(mockHttp.get).toBeCalled();
			});
		}));

		it('should getQuizResults', waitForAsync(() => {
			jest.spyOn(mockHttp, 'get').mockReturnValue(of( [helpers.getMockQuizResult(), helpers.getMockQuizResult() ] ));
			lastValueFrom(service.getQuizResults('mockCourseId') ).then(() => {
				expect(mockHttp.get).toBeCalled();
			});
		}));

		it('should recordQuiz', waitForAsync(() => {
			const res = {
				item: 'item1',
				object: 'object1'
			};
			jest.spyOn(mockHttp, 'put').mockReturnValue(of( helpers.getMockQuizResult() ));
			lastValueFrom(service.recordQuiz('mockCourseId', 'mockLectureId', 'mockText', res) ).then(() => {
				expect(mockHttp.put).toBeCalled();
			});
		}));
	});

	describe('test processDiscourseSSO', () => {

		it('should processDiscourseSSO', waitForAsync(() => {
			jest.spyOn(mockHttp, 'post').mockReturnValue(of( {data: 'mockData'} ));
			lastValueFrom(service.processDiscourseSSO('mockCourseId', 'mockSignature') ).then(() => {
				expect(mockHttp.post).toBeCalled();
			});
		}));

		it('should processDiscourseSSO -- error', waitForAsync(() => {
			const err = { response: 'resp', status: 500 };
			mockHttp.post = jest.fn(() => throwError(() => { err; }) );
			const data = lastValueFrom(service.processDiscourseSSO('mockCourseId', 'mockSignature'));
			return expect(data).resolves.toThrow(TypeError);
		}));
	});

	describe('test user preferences', () => {

		it('should getUserPreferences', waitForAsync(() => {
			jest.spyOn(mockHttp, 'get').mockReturnValue(of( {
				progressReportFrequency: 'Monthly' ,
				preferAudioLectures: true,
				subjectPreference: 'mockSubject',
				storeAudioOffline: true
			} ));
			lastValueFrom(service.getUserPreferences()).then(() => {
				expect(mockHttp.get).toBeCalled();
			});
		}));

		it('should getUserPreferences -- error', waitForAsync(() => {
			const err = { response: 'resp', status: '4xx' };
			mockHttp.get = jest.fn(() => throwError(() => { err; }) );
			const data = lastValueFrom(service.getUserPreferences() );
			return expect(data).resolves.toBe(TypeError);
		}));

		it('should saveUserPreferences', waitForAsync(() => {
			const userPref: UserPreferences = {
				progressReportFrequency: 'Monthly'
			};
			jest.spyOn(mockHttp, 'put').mockReturnValue(of( userPref ));
			lastValueFrom(service.saveUserPreferences(userPref) ).then(() => {
				expect(mockHttp.put).toBeCalled();
			});
		}));

		it('should saveUserPreferences -- error', waitForAsync(() => {
			const userPref: UserPreferences = {
				progressReportFrequency: 'Monthly'
			};

			const err = { response: 'resp', status: '4xx' };
			mockHttp.put = jest.fn(() => throwError(() => { err; }) );
			const data = lastValueFrom(service.saveUserPreferences(userPref) );
			return expect(data).resolves.toBe(TypeError);
		}));

		it('should saveUserMediaPreferences', waitForAsync(() => {
			const userPref: UserPreferences = {
				progressReportFrequency: 'Monthly'
			};

			jest.spyOn(mockHttp, 'put').mockReturnValue(of( userPref ));
			lastValueFrom(service.saveUserMediaPreferences(true) ).then(() => {
				expect(mockHttp.put).toBeCalled();
			});
		}));

		it('should saveUserMediaPreferences -- error', waitForAsync(() => {
			const err = { response: 'resp', status: '4xx' };
			mockHttp.put = jest.fn(() => throwError(() => { err; }) );
			const data = firstValueFrom(service.saveUserMediaPreferences(true) );
			return expect(data).resolves.toThrow(TypeError);
		}));

		it('should saveUserSubjectPreferences', waitForAsync(() => {
			const userPref: UserPreferences = {
				progressReportFrequency: 'Monthly'
			};

			jest.spyOn(mockHttp, 'put').mockReturnValue(of( userPref ));
			lastValueFrom(service.saveUserSubjectPreferences('mockPreferredSubject') ).then(() => {
				expect(mockHttp.put).toBeCalled();
			});
		}));

		it('should saveUserSubjectPreferences -- error', waitForAsync(() => {
			const err = { response: 'resp', status: '4xx' };
			mockHttp.put = jest.fn(() => throwError(() => { err; }) );
			const data = lastValueFrom(service.saveUserSubjectPreferences('mockPreferredSubject') );
			return expect(data).resolves.toThrow(TypeError);
		}));
	});
});
