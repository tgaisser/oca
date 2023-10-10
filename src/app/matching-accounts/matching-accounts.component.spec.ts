
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {MatchingAccountsComponent, UserMatchSelection} from './matching-accounts.component';
import {FormsModule} from '@angular/forms';
import {BsModalRef, ModalModule} from 'ngx-bootstrap/modal';
import {createSpyObj, CustomMocksModule, MockStorage} from '../../test.helpers';
import {ToastrModule, ToastrService} from 'ngx-toastr';
import {LoadingService} from '../common/loading.service';
import {UserDataService} from '../services/user-data.service';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {UserType} from '../services/user.service';
import {interval, of} from 'rxjs';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {LOCAL_STORAGE, SESSION_STORAGE} from '../common/models';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {map, take} from 'rxjs/operators';

describe('MatchingAccountsComponent', () => {
	let component: MatchingAccountsComponent;
	let fixture: ComponentFixture<MatchingAccountsComponent>;
	let userDataSvc: UserDataService;
	let toastrSvc: ToastrService;
	let spy_toastr_error;
	let testScheduler: RxjsTestScheduler;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [MatchingAccountsComponent],
			imports: [FormsModule, ModalModule.forRoot(), CustomMocksModule, ToastrModule.forRoot(), FontAwesomeTestingModule],
			providers: [
				{provide: BsModalRef, useValue: createSpyObj('BsModalRef', ['show', 'hide'])},
				{provide: LoadingService, useValue: createSpyObj(LoadingService, ['show', 'hide'])},
				UserDataService,
				ToastrService,
				HttpClient,
				HttpHandler,
				{provide: LOCAL_STORAGE, useClass: MockStorage},
				{provide: SESSION_STORAGE, useClass: MockStorage},
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		userDataSvc = TestBed.inject(UserDataService);
		toastrSvc = TestBed.inject(ToastrService);
		spy_toastr_error = jest.spyOn(toastrSvc, 'error');
		fixture = TestBed.createComponent(MatchingAccountsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should merge', () => {
		component.merge();
		expect(component.mode).toEqual('ConfirmPrompt');
	});

	it('should confirmLink', () => {
		component.confirmLink();
	});

	it('should backToPrompt', () => {
		component.backToPrompt();
		expect(component.mode).toEqual('Prompt');
	});

	it('should doNothing', () => {
		component.doNothing();
		expect(component.mode).toEqual('NonLinkPrompt');
	});

	it('should done', () => {
		component.done();
		expect(component.modal).toBeTruthy();
	});

	it('should call userDataService.markAccountsIgnored', () => {
		const spy_mergeAccounts = jest.spyOn(userDataSvc, 'mergeAccounts').mockReturnValue(of(true));
		const spy_markAccountsIgnored = jest.spyOn(userDataSvc, 'markAccountsIgnored').mockReturnValue(of(true));

		component.matchingAccounts = [dummyUserMatchSelection];
		component.confirmLink();

		expect(spy_markAccountsIgnored).toHaveBeenCalledTimes(1);
		expect(component.mode).toEqual('Confirmation');
	});

	it('should not call userDataService.markAccountsIgnored', () => {
		const spy_mergeAccounts = jest.spyOn(userDataSvc, 'mergeAccounts').mockReturnValue(of(true));
		const spy_markAccountsIgnored = jest.spyOn(userDataSvc, 'markAccountsIgnored').mockReturnValue(of(true));

		component.matchingAccounts = [];
		component.confirmLink();

		expect(spy_markAccountsIgnored).toHaveBeenCalledTimes(0);
	});

	it('should toastr.error', () => {
		const spy_mergeAccounts = jest.spyOn(userDataSvc, 'mergeAccounts').mockReturnValue(of(true));
		const spy_markAccountsIgnored = jest.spyOn(userDataSvc, 'markAccountsIgnored').mockReturnValue(of(false));

		component.matchingAccounts = [dummyUserMatchSelection];
		component.confirmLink();

		expect(spy_markAccountsIgnored).toHaveBeenCalledTimes(1);
		expect(spy_toastr_error).toHaveBeenCalledTimes(1);
		expect(component.mode).not.toEqual('Confirmation');
	});

	it('confirmNonLink should result in mode = Confirmation', () => {
		const spy_markAccountsIgnored = jest.spyOn(userDataSvc, 'markAccountsIgnored').mockReturnValue(of(true));
		component.confirmNonLink();

		expect(spy_toastr_error).toHaveBeenCalledTimes(0);
		expect(component.mode).toEqual('Confirmation');
	});

	it('confirmNonLink should result in mode = Confirmation', () => {
		const spy_markAccountsIgnored = jest.spyOn(userDataSvc, 'markAccountsIgnored').mockReturnValue(of(false));
		component.confirmNonLink();

		expect(spy_toastr_error).toHaveBeenCalledTimes(1);
		expect(component.mode).not.toEqual('Confirmation');
	});

	it('test setupSignoutTimer', (done) => {
		const doneSpy = jest.spyOn(component, 'done');

		testScheduler.run(({expectObservable}) => {

			// this generates 1, 1, 2, 2, 3, 3, ...
			const ev = {
				_c: 0,
				_z: true,
				get a() {
					if (this._z) {
						this._c = this._c + 1;
					}
					this._z = !this._z;
					return this._c;
				}
			};

			let expectedMarbles = '1s';
			for (let i = 0; i < 60; i++){
				expectedMarbles = expectedMarbles + ' a 999ms';
			}
			// https://stackoverflow.com/questions/60193538/peculiar-result-from-observable-testing-with-jasmine-marbles
			expectedMarbles = expectedMarbles + ' (a|)';
			const expectedVals = ev;

			component['setupSignoutTimer']();
			expectObservable(component.redirectTimer$).toBe(expectedMarbles, expectedVals);

			setTimeout(() => {
				expect(doneSpy).toHaveBeenCalledTimes(1);
				done();
			}, 1400);
		});
	});
});

const dummyUserMatchSelection: UserMatchSelection = {
	selected: false,
	current: false,
	userId: 'dummyId',
	email: 'dummy@dummy.com',
	status: 'ignore',
	type: UserType.Email
};
