
import { TestBed} from '@angular/core/testing';

import { MockBrowserAbstractionModule} from '../../test.helpers';
import { ApplicationRef, Injectable } from '@angular/core';
import {ServiceWorkerModule, SwUpdate, UpdateAvailableEvent} from '@angular/service-worker';
import { of } from 'rxjs';
import {Store, StoreModule} from '@ngrx/store';
import * as appUpdateActions from '../state/app-update/actions';

import { CheckForUpdateService } from './check-for-update.service';
import {metaReducers, reducers} from '../state';

describe('CheckForUpdateService', () => {
	let service: CheckForUpdateService;
	let appRef: ApplicationRef;
	let swUpdate: SwUpdate;
	let store: Store;
	let transferState;
	// let localStor: jest.MockedClass<any>;
	let store_spy;

	beforeEach(async () => {
		return TestBed.configureTestingModule({
			imports: [MockBrowserAbstractionModule,
				ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
				StoreModule.forRoot(reducers, {
					metaReducers,
					runtimeChecks: {
						strictStateImmutability: true,
						strictActionImmutability: true,
					}
				})
			],
			providers: [
				CheckForUpdateService,
				ApplicationRef,
				{provide: SwUpdate, useValue: {available: of({type: 'UPDATE_AVAILABLE'} as UpdateAvailableEvent)}},
				Store]
		}).compileComponents();
	});

	beforeEach(() => {
		transferState = {
			hasKey: jest.fn(() => false),
			get: jest.fn(() => null),
			remove: jest.fn()
		};
		appRef = TestBed.inject(ApplicationRef) as ApplicationRef;
		swUpdate = TestBed.inject(SwUpdate) as SwUpdate;
		store = TestBed.inject(Store) as Store;
		service = TestBed.inject(CheckForUpdateService);

		store_spy = jest.spyOn(store, 'dispatch');
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should dispatch updateIsAvailable', (done) => {
		service.ngOnInit();

		setTimeout(() => {
			expect(store_spy).toHaveBeenCalledWith(appUpdateActions.updateIsAvailable());
			done();
		},10);
	});
});
