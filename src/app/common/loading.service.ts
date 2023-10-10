import {Injectable} from '@angular/core';
import {NgxUiLoaderService} from 'ngx-ui-loader';

const DEFAULT = 'default';
@Injectable({
	providedIn: 'root'
})
export class LoadingService {

	numPending = new Map([[DEFAULT, 0]]);

	constructor(public loadingSvc: NgxUiLoaderService) { }

	get loading() {
		return this.isLoading();
	}

	isLoading(spinner = DEFAULT) {
		return (this.numPending.get(spinner) || 0) > 0;
	}

	show(spinner = DEFAULT) {
		const pending = (this.numPending.get(DEFAULT) || 0) + 1;
		this.numPending.set(spinner, pending);
		this.loadingSvc.start(spinner); //show(spinner);
		// if (pending === 1) {
		// 	console.log('loading started');
		// }
	}

	hide(spinner = DEFAULT) {
		// console.log('loading hide called');
		const pending = (this.numPending.get(DEFAULT) || 0) - 1;
		this.numPending.set(spinner, pending > 0 ? pending : 0);
		// console.log('loading hide has', pending, 'open items');
		if (pending <= 0) {
			this.loadingSvc.stop(spinner); //hide(spinner);
			// console.log('loading done');
		}
	}
}
