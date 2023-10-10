import {HttpClient} from '@angular/common/http';
import {WindowBehaviorService} from './window-behavior.service';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockBrowserAbstractionModule} from '../../test.helpers';
import {SESSION_STORAGE} from '../common/models';
import {UtmService} from './utm.service';

describe('UtmService', () => {
	let service: UtmService;
	let http: HttpClient;
	let windowBehv: WindowBehaviorService;
	let localStorage: any;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, MockBrowserAbstractionModule],
			providers: [
				UtmService,
			]
		});
	}));

	beforeEach(() => {
		http = TestBed.inject(HttpClient);
		windowBehv = TestBed.inject(WindowBehaviorService);
		localStorage = TestBed.inject(SESSION_STORAGE);
		service = TestBed.inject(UtmService); //new UserDataService(httpClient, TestBed.inject(CookieService));
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get serialized codes when empty', () => {
		expect(service.getSerializedCodes()).toEqual('{}');
	});

	it('should handle serializing correctly', () => {
		service.setUtmCodes({
			utm_source: 'stuff',
			utm_term: '12312313131',
			utm_campaign: 'a',
		});
		expect(service.getSerializedCodes()).toEqual('{"utm_source":"stuff","utm_term":"12312313131","utm_campaign":"a"}');
		expect(service.getSerializedCodes(41)).toEqual('{"utm_source":"stuff","utm_campaign":"a"}');
		expect(service.getSerializedCodes(20)).toEqual('{"utm_campaign":"a"}');
		expect(service.getSerializedCodes(10)).toEqual('{}');
	});
});
