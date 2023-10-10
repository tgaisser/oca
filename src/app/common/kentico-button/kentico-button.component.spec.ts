import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {KenticoButtonComponent} from './kentico-button.component';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../state';
import {RouterTestingModule} from '@angular/router/testing';
import {CustomMocksModule} from '../../../test.helpers';
import * as helpers from '../../../test.helpers';

describe('KenticoButtonComponent', () => {
	let component: KenticoButtonComponent;
	let fixture: ComponentFixture<KenticoButtonComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [KenticoButtonComponent],
			imports: [RouterTestingModule.withRoutes([]), CustomMocksModule],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(KenticoButtonComponent);
		component = fixture.componentInstance;
		component.button = helpers.getMockKenticoButton();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
