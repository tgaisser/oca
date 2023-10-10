import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TvAdExtendedComponent} from './tv-ad-extended.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ServerTransferStateModule} from '@angular/platform-server';
import {LOCAL_STORAGE, SESSION_STORAGE} from '../common/models';
import {MockStorage} from '../../test.helpers';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../state';

describe('TvAdExtendedComponent', () => {
	let component: TvAdExtendedComponent;
	let fixture: ComponentFixture<TvAdExtendedComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RouterTestingModule, HttpClientTestingModule, ServerTransferStateModule],
			declarations: [TvAdExtendedComponent],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: LOCAL_STORAGE, useClass: MockStorage},
				{provide: SESSION_STORAGE, useClass: MockStorage}]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TvAdExtendedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
