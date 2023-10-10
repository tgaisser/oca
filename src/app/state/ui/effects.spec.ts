import { provideMockActions } from '@ngrx/effects/testing';
import {from, Observable, of} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {TestBed} from '@angular/core/testing';
import {SidebarEffects} from './effects';
import {TestScheduler as RxjsTestScheduler} from 'rxjs/testing';
import {closeSidebar, loadSidebarStatus, openSidebar, setIsDesktop} from './actions';
import {CustomMocksModule, MockBrowserAbstractionModule} from '../../../test.helpers';
import {MockStore} from '@ngrx/store/testing';
import {State} from '../index';
import {LOCAL_STORAGE} from '../../common/models';

describe('UI effects', () => {
	let effects;

	let actions$ = new Observable<Action>();
	let testScheduler;
	let store;

	let setItemSpy;
	let getItemSpy;

	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [
				SidebarEffects,
				provideMockActions(() => actions$),
			],
			imports: [
				CustomMocksModule,
				MockBrowserAbstractionModule
			]
		});

		effects = TestBed.inject(SidebarEffects);
		store = TestBed.inject(Store) as MockStore<State>;

		testScheduler = new RxjsTestScheduler((actual, expected) => {
			return expect(actual).toEqual(expected);
		});

		const storage = TestBed.inject(LOCAL_STORAGE) as jest.MockedClass<any>;
		getItemSpy = storage.getItem.mockImplementation(() => 'true');
		setItemSpy = storage.setItem;
	});


	it('should load result from localStorage on loadSidebarStatus (saved status = false)', () => {
		getItemSpy.mockImplementation(() => 'false');

		testScheduler.run(({ hot, expectObservable }) => {
			actions$ = hot('---a|', {a: loadSidebarStatus()});

			//since getItem returns false, this should return a close
			expectObservable(effects.sidebarLoader$).toBe('---x|', {
				x: {type: closeSidebar.type}
			});
		});
	});

	it('should load result from localStorage on loadSidebarStatus (saved status = true)', () => {
		getItemSpy.mockImplementation(() => 'true');

		testScheduler.run(({ hot, expectObservable }) => {
			actions$ = hot('---a|', {a: loadSidebarStatus()});

			//since getItem returns true, this should return nothing
			expectObservable(effects.sidebarLoader$).toBe('----|');
		});
	});

	it ('should save the status change to sidebar (if desktop)', async () => {
		// console.log('state', store);
		store.setState({
			...store.lastState,
			ui: {
				...store.lastState.ui,
				isDesktop: true,
			}
		});

		actions$ = from([closeSidebar(), openSidebar(), openSidebar(), closeSidebar()]);

		const key = 'side-bar-selection-status';
		await effects.statusChangeSaver$.toPromise();

		expect(setItemSpy).toHaveBeenCalledTimes(4);
		expect(setItemSpy.mock.calls).toEqual([[key, 'false'], [key, 'true'], [key, 'true'], [key, 'false']]);
	});

	it ('should not save the status change to sidebar (if mobile)', async () => {
		actions$ = from([closeSidebar(), openSidebar()]);

		await effects.statusChangeSaver$.toPromise();

		expect(setItemSpy).toHaveBeenCalledTimes(0);
	});


	const runSidebarTests = openEventType => {
		const event = {type: setIsDesktop.type};

		testScheduler.run(({ hot, expectObservable }) => {
			// const actions =
			actions$ = hot('---a--b- 45ms c 1s de|', {
				a: {...event, isDesktop: false},
				b: {...event, isDesktop: true},
				c: {...event, isDesktop: true},
				d: {...event, isDesktop: false},
				e: {type: 'wd'}});

			//expect 36ms delay (first 2 events + 30 ms debounce), 1019 ms delay (1045 of ticks + 3 events - 30 ticks from first debounce)
			expectObservable(effects.mobileToggler$).toBe('36ms x 1019ms (y|)', {
				x: {type: openEventType},
				y: {type: closeSidebar.type}
			});
		});
	};

	it('should toggle sidebar on switch to mobile (save status open)', () => {
		getItemSpy.mockImplementation((param) => {
			return 'true';
		});

		runSidebarTests(openSidebar.type);
	});

	it('should toggle sidebar on switch to mobile (save status closed)', () => {
		getItemSpy.mockImplementation((param) => {
			return 'false';
		});
		runSidebarTests(closeSidebar.type);
	});

});
