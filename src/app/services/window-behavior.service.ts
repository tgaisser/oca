import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class WindowBehaviorService {

	constructor() {
	}

	isDesktop() {
		return window.innerWidth >= 992;
	}

	setNewUrlHash(hash: string) {
		window.location.hash = hash;
	}

	loadNewUrl(url: string) {
		window.location.href = url;
	}

	getCurrentUrl() {
		return window && window && window.location.href;
	}

	getPageYOffset() {
		return window.pageYOffset;
	}

	scrollTo(options?) {
		if (options) {
			window.scroll(options);
		} else {
			window.scrollTo(0, 0);
		}
	}

}

@Injectable()
export class ServerWindowBehaviorService extends WindowBehaviorService {
	isDesktop() { return true; }
	setNewUrlHash(hash: string) { }
	loadNewUrl(url: string) { }
	getCurrentUrl() {
		//TODO
		return '';
	}
	getPageYOffset() { return 0; }
	scrollTo(options?) { }
}
