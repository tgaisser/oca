import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {UserPreferencesComponent} from './user-preferences.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {CustomMocksModule, MockBrowserAbstractionModule} from '../../../../test.helpers';
import {NgxMaskModule} from 'ngx-mask';
import {RouterTestingModule} from '@angular/router/testing';
import {ToastrModule} from 'ngx-toastr';

import {EMPTY, lastValueFrom, of, throwError} from 'rxjs';
import { UserDataService } from '../../../services/user-data.service';
import { UserPreferences } from '../../../common/models';
import { LoadingService } from '../../../common/loading.service';

describe('auth/UserPreferencesComponent', () => {
	const userPref: UserPreferences = {
		progressReportFrequency: 'Monthly',
		preferAudioLectures: false,
		dataSaver: false,
		storeAudioOffline: false
	};
	let mockDataService: UserDataService;
	let loadingService: LoadingService;
	let component: UserPreferencesComponent;
	let fixture: ComponentFixture<UserPreferencesComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [UserPreferencesComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				CustomMocksModule,
				NgxMaskModule.forRoot(),
				RouterTestingModule.withRoutes([]),
				ToastrModule.forRoot(),
				MockBrowserAbstractionModule
			],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		mockDataService = TestBed.inject(UserDataService);
		loadingService = TestBed.inject(LoadingService);
		fixture = TestBed.createComponent(UserPreferencesComponent);
		component = fixture.componentInstance;

		jest.spyOn(component, 'loadUserPreferences').mockImplementation(() => of({} as any));

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	xit('should loadUserPreferences', waitForAsync(() => {
		jest.spyOn(mockDataService, 'getUserPreferences').mockReturnValueOnce(of(userPref));
		lastValueFrom(component.loadUserPreferences()).then(() => {
			expect(component.savedPrefs).toEqual(userPref);
		});

	}));

	describe('editProfile', (() => {
		const newData = {
			emailFrequency: 'Weekly',
			preferAudioLectures: false,
			storeAudioOffline: false,
			dataSaver: false,
		};
		it('should save preferences', waitForAsync(() => {
			jest.spyOn(mockDataService, 'saveUserPreferences');
			const spy = jest.spyOn(loadingService, 'hide');
			component.preferencesForm.patchValue(newData);

			const promise = component.editProfile().then(() => {
				expect(spy).toBeCalled();
				expect(component.savedPrefs).toEqual(newData);
			});
		}));

		it('should catch errors', waitForAsync(() => {
			jest.spyOn(mockDataService, 'saveUserPreferences').mockReturnValueOnce(throwError(()=> {new Error();}));
			const spy = jest.spyOn(loadingService, 'hide');
			component.preferencesForm.patchValue(newData);

			const promise = component.editProfile().then(() => {
				expect(spy).toBeCalled();
				expect(component.savedPrefs).not.toEqual(newData);
			});
		}));
	}));


});
