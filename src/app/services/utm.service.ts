import {Injectable, Inject} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {
	SESSION_STORAGE,
	UserUtmCodes,
} from '../common/models';
import {WindowBehaviorService} from './window-behavior.service';


const userUtmCodesKeys = ['utm_term', 'utm_source', 'utm_medium', 'utm_content', 'utm_campaign', 'appeal_code', 'sc', 'source_partner', 'source_tv_ad', 'gclid'];

@Injectable({
	providedIn: 'root'
})
export class UtmService  {

	constructor(
		private windowBehaviorService: WindowBehaviorService,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage
	) {
		// console.log('UTM Codes -- Assigning sessionStorage codes, if any');
		const sessionStorageUtmCodes = {} as UserUtmCodes;

		userUtmCodesKeys.forEach(k => {
			const val = this.sessionStorage.getItem(k);
			if (val) {
				sessionStorageUtmCodes[k] = val;
			}
		});

		this.setUtmCodes(sessionStorageUtmCodes);
	}

	private currentUtmCodes: UserUtmCodes = {};

	getSerializedCodes(maxResultLength = 1024) {
		let serialized = JSON.stringify(this.currentUtmCodes);

		//if the serialized result is too long, walk through removing the longest properties first
		if (serialized.length > maxResultLength) {
			const mutableParams = {...this.currentUtmCodes};
			do {
				let orderedKeys;
				if (Object.entries) {
					orderedKeys = Object.entries(mutableParams)
						.sort((a, b) => (b[1]?.length ?? 0) - (a[1]?.length ?? 0))
						.map(i => i[0]);

				} else {
					orderedKeys = Object.keys(mutableParams);
				}
				delete mutableParams[orderedKeys[0]];

				serialized = JSON.stringify(mutableParams);
			} while (serialized.length > maxResultLength);
		}
		return serialized;
	}

	getUtmCodes() {
		return {...this.currentUtmCodes};
	}

	getUtmParams() {
		return Object.keys(this.currentUtmCodes || {})
			.filter(k => this.currentUtmCodes[k])
			.reduce((agg, curKey) => agg.append(curKey, this.currentUtmCodes[curKey]), new HttpParams());
	}

	getHubspotUtm() {
		const hsObj = {...this.currentUtmCodes};
		delete hsObj.appeal_code;
		delete hsObj.sc;
		return hsObj;
	}


	setUtmCodes(codes: UserUtmCodes) {
		// Don't bother updating if the passed `codes` object is empty
		if (Object.keys(codes).length === 0) return;

		// console.log('UTM Codes -- Attempting to set:', codes);

		// Trim the given object down to just the properties found in the UserUtmCodes interface
		const trimmedCodes = {} as UserUtmCodes;
		Object.keys(codes).forEach(key => {
			if (userUtmCodesKeys.indexOf(key) >= 0 && codes[key]) {
				trimmedCodes[key] = codes[key];
				this.sessionStorage.setItem(key, codes[key]);
			}
		});

		// Merge the new codes onto any existing ones
		this.currentUtmCodes = {
			...this.currentUtmCodes,
			...trimmedCodes
		};

		// console.log('UTM Codes -- New UTM codes:', this.currentUtmCodes);
	}
}

