import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {BottomBarComponent} from './bottom-bar.component';
import {DonationService} from '../donation.service';
import {createSpyObj} from '../../../test.helpers';

describe('BottomBarComponent', () => {
	let component: BottomBarComponent;
	let fixture: ComponentFixture<BottomBarComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [BottomBarComponent],
			providers: [
				{provide: DonationService, useValue: createSpyObj('DonationService', ['get', 'set'])}
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BottomBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
