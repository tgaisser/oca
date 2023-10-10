import {Injectable} from '@angular/core';
import {WindowBehaviorService} from './window-behavior.service';

declare global {
	interface Window {
		_hsq: any;
		__insp: any;
		TrackJS: any;
		dataLayer: any;
	}
}

@Injectable({
	providedIn: 'root'
})
export class WindowTrackingService {

	constructor() { }

	private initHsq() {
		if (window._hsq) return;

		window._hsq = window._hsq || [];
	}
	private initInsp() {
		if (window.__insp) return;

		window.__insp = window.__insp || [];
	}
	private initDataLayer() {
		if (!window.dataLayer) {
			window.dataLayer = [];
		}
	}

	trackUrlChange(url: string) {
		this.initHsq();

		const _hsq = window._hsq = window._hsq || [];
		_hsq.push(['setPath', url]);
		_hsq.push(['trackPageView']);
	}

	trackUserIdentity(email: string) {
		this.initInsp();
		const _insp = window.__insp = window.__insp || [];
		_insp.push(['identify', email]);

		if (window.TrackJS) {
			// console.log('TrackJS user:', user);
			window.TrackJS.configure({ userId: email });
		}
	}

	trackEvent(props) {
		this.initDataLayer();

		window.dataLayer.push(props);
	}
}

@Injectable()
export class ServerWindowTrackingService extends WindowBehaviorService {
	trackUrlChange(url: string) { }
	trackUserIdentity(email: string) { }
	trackEvent(props) { }
}
