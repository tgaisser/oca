import { TestBed, waitForAsync } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {Component} from '@angular/core';
import {NgxUiLoaderModule} from 'ngx-ui-loader';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from './state';
import {ModalModule} from 'ngx-bootstrap/modal';
import {UserDataService} from './services/user-data.service';
import {DonationService} from './donation/donation.service';
import {mockJquery, createSpyObj} from '../test.helpers';
import {ServiceWorkerModule, SwUpdate} from '@angular/service-worker';
import {SESSION_STORAGE} from './common/models';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';

@Component({
	selector: 'app-donation-banner',
	template: 'DONATION-BANNER'
})
class MockDonationBannerComponent {}

@Component({
	selector: 'app-donation-bottom-bar',
	template: 'DONATION-BANNER'
})
class MockDonationBottomBarComponent {}

describe('AppComponent', () => {
	const jQuery = mockJquery();

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				NgxUiLoaderModule,
				ModalModule.forRoot(),
				ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
				FontAwesomeTestingModule
			],
			declarations: [
				AppComponent,
				MockDonationBannerComponent,
				MockDonationBottomBarComponent
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				SwUpdate,
				//TODO
				{provide: UserDataService, useValue: createSpyObj('UserDataService', ['setUtmCodes'])},
				{provide: DonationService, useValue: createSpyObj('DonationService', ['requestDonationAsk', 'startDonationAsk', 'softClose', 'close'])},
				{provide: SESSION_STORAGE, useValue: {
					key: num => '',
					getItem: key => null,
					setItem: (key, val) => {},
					clear: () => {},
					removeItem: key => null,
					length: 0,
				}
				},
			]
		}).compileComponents();
	}));

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	});

	// it('should include donation banner', () => {
	// 	const fixture = TestBed.createComponent(AppComponent);
	// 	fixture.detectChanges();
	// 	const compiled = fixture.debugElement.nativeElement;
	// 	expect(compiled.querySelector('app-donation-banner')).toBeTruthy();
	// });
});
