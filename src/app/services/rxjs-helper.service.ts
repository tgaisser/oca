import {Injectable} from '@angular/core';
import {interval, Observable, of} from 'rxjs';
import {debounceTime, sampleTime, throttleTime, withLatestFrom} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class RxjsHelperService {
	// when pre-rendering is being done, it makes the app skip over the rxjs operators
	constructor() { }

	get debounce() {
		return debounceTime;
	}
	get throttle() {
		return throttleTime;
	}
	get sample() {
		return sampleTime;
	}
	get interval() {
		return interval;
	}
}

@Injectable()
export class ServerRxjsHelperService extends RxjsHelperService {
	// TODO
	// this service is never used.
	private static returnPipe() {
		return <T>(source: Observable<T>) => {
			return source;
		};
	}

	get debounce() { return ServerRxjsHelperService.returnPipe; }
	get throttle() { return ServerRxjsHelperService.returnPipe; }
	get sample() { return ServerRxjsHelperService.returnPipe; }
	get interval() { return of; }
}
