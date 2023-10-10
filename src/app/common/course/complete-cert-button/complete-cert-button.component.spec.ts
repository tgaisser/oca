import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {CompleteCertButtonComponent} from './complete-cert-button.component';
import {provideMockStore} from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import {mockInitialState} from '../../../state';
import {HttpClientModule} from '@angular/common/http';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {MockBrowserAbstractionModule} from '../../../../test.helpers';

describe('CompleteCertButtonComponent', () => {
	let component: CompleteCertButtonComponent;
	let fixture: ComponentFixture<CompleteCertButtonComponent>;

	const actions$ = new Observable<Action>();

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [CompleteCertButtonComponent],
			imports: [HttpClientModule, MockBrowserAbstractionModule],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				provideMockActions(() => actions$)
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CompleteCertButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	test.todo('On userSessionRefreshed action, should reload jwt');

	test.todo('Should keep up with the current complete link for current course');
});
