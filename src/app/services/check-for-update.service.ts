import {ApplicationRef, Injectable, OnInit} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import {concat, interval, Subscription} from 'rxjs';
import {first} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import * as appUpdateActions from '../state/app-update/actions';

@Injectable({
	providedIn: 'root'
})
export class CheckForUpdateService implements OnInit {
	private timerSub: Subscription;
	private updateAvailableSub: Subscription;

	constructor(
		private appRef: ApplicationRef,
		private swUpdate: SwUpdate,
		private store: Store<any>
	) { }

	ngOnInit(){
		this.updateAvailableSub = this.swUpdate.available.subscribe(event => {
			this.store.dispatch(appUpdateActions.updateIsAvailable());
		});

		// Allow the app to stabilize first, before starting polling for updates with `interval()`.
		const appIsStable$ = this.appRef.isStable.pipe(
			first(isStable => isStable === true)
		);

		const ONE_HOUR = 60 * 60 * 1000;
		const everyInterval$ = interval(ONE_HOUR);
		const everyIntervalOnceAppIsStable$ = concat(appIsStable$, everyInterval$);

		// only check for update if browser allows service workers
		this.timerSub = everyIntervalOnceAppIsStable$.subscribe(() => this.swUpdate.isEnabled && this.swUpdate.checkForUpdate());
	}
}
