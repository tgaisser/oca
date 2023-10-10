

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ThankYouComponent} from './thank-you.component';
import {CustomMocksModule, MockNextCourseComponent, MockStorage} from '../../../test.helpers';
import {LOCAL_STORAGE, SESSION_STORAGE, UserPreferences} from '../../common/models';
import {UserDataService} from '../../services/user-data.service';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpHandler} from '@angular/common/http';


describe('ThankYouComponent', () => {
	let component: ThankYouComponent;
	let fixture: ComponentFixture<ThankYouComponent>;
	let userDataSvc: UserDataService;
	let localStorage;
	let sessionStorage;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [ThankYouComponent, MockNextCourseComponent],
			imports: [CustomMocksModule],
			providers: [
				{provide: LOCAL_STORAGE, useClass: MockStorage},
				{provide: SESSION_STORAGE, useClass: MockStorage},
				UserDataService,
				HttpClient,
				HttpHandler
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ThankYouComponent);
		sessionStorage = TestBed.inject(SESSION_STORAGE);
		localStorage = TestBed.inject(LOCAL_STORAGE);
		userDataSvc = TestBed.inject(UserDataService, {
			getUserPreferences(): Observable<UserPreferences> {
				return of({} as UserPreferences);
			},
			saveUserSubjectPreferences(preferredSubject: string): Observable<UserPreferences> {
				return of({} as UserPreferences);
			}
		} as UserDataService);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be true', () => {
		expect(fixture).toBeTruthy();
	});

	it('should not get user preferences', () => {
		const userDataSvcSpy_getUserPreferences = jest.spyOn(userDataSvc, 'getUserPreferences');

		const obj = new ThankYouComponent(localStorage, sessionStorage, userDataSvc);

		expect(userDataSvcSpy_getUserPreferences).toHaveBeenCalledTimes(0);
	});

	it('should get user preferences but stop at filter', () => {
		jest.spyOn(localStorage, 'getItem').mockReturnValue(true);

		const userDataSvcSpy_getUserPreferences = jest.spyOn(userDataSvc, 'getUserPreferences').mockReturnValue(of(mockUserPreferences));
		const userDataSvcSpy_saveUserSubjectPreferences = jest.spyOn(userDataSvc, 'saveUserSubjectPreferences');
		const sessionStorageSpy = jest.spyOn(sessionStorage, 'removeItem');

		component.subjectPreference = 'dummy val';
		component.ngOnInit();

		expect(userDataSvcSpy_getUserPreferences).toHaveBeenCalled();
		expect(userDataSvcSpy_saveUserSubjectPreferences).toHaveBeenCalledTimes(0);
		expect(sessionStorageSpy).toHaveBeenCalled();
	});

	it('should save user preferences', (done) => {
		const userDataSvcSpy_getUserPreferences = jest.spyOn(userDataSvc, 'getUserPreferences').mockReturnValue(of({
			...mockUserPreferences,
			subjectPreference: null
		}));
		const userDataSvcSpy_saveUserSubjectPreferences = jest.spyOn(userDataSvc, 'saveUserSubjectPreferences').mockReturnValue(of(mockUserPreferences));
		const sessionStorageSpy = jest.spyOn(sessionStorage, 'removeItem');
		const consoleSpy = jest.spyOn(console, 'log');

		component.subjectPreference = 'dummy subject preference value';
		component.ngOnInit();

		setTimeout(() => {
			expect(consoleSpy).toHaveBeenCalled();
			expect(userDataSvcSpy_getUserPreferences).toHaveBeenCalledTimes(1);
			expect(userDataSvcSpy_saveUserSubjectPreferences).toHaveBeenCalledWith('dummy subject preference value');
			expect(sessionStorageSpy).toHaveBeenCalledTimes(2);
			done();
		}, 10);
	});
});

const mockUserPreferences: UserPreferences = {
	progressReportFrequency: 'Monthly',
	preferAudioLectures: true,
	subjectPreference: 'dummy subject',
	storeAudioOffline: false,
	dataSaver: false
};
