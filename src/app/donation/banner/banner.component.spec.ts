import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {BannerComponent} from './banner.component';
import {BsModalService} from 'ngx-bootstrap/modal';
import {createSpyObj} from '../../../test.helpers';
import {CookieService} from 'ngx-cookie-service';

describe('BannerComponent', () => {
	let component: BannerComponent;
	let fixture: ComponentFixture<BannerComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [BannerComponent],
			providers: [
				{provide: BsModalService, useValue: createSpyObj('BsModalService', ['get', 'set', 'open'])},
				{provide: CookieService, useValue: createSpyObj('CookieService', ['get', 'set'])},
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BannerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
