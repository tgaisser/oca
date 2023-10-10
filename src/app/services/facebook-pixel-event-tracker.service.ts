import { Injectable } from '@angular/core';

declare const fbq;

@Injectable({
	providedIn: 'root'
})
export class FacebookPixelEventTrackerService {

	constructor() { }

	public trackEvent(event: string, properties: object, custom: boolean = false) {
		if (typeof fbq === 'undefined') {
			return;
		}
		// console.log('Submitting facebook event:', event, properties);
		fbq(custom ? 'trackCustom' : 'track', event, properties);
	}
}
