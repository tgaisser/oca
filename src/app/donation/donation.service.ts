import {Injectable, OnDestroy} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'; //TODO ngx-bootstrap
import { CookieService } from 'ngx-cookie-service';
import {BehaviorSubject, Subscription} from 'rxjs';
import { ModalComponent } from './modal/modal.component';

export interface DonationButton {
	buttonText: string;
	buttonLink: string;
	buttonTarget: string;
}

export interface DonationServiceOptions {
	displayType?: string;
	donationBody?: string;
	donationButtons?: DonationButton[];

	closeTimeout?: number;
	openTimeout?: number;

	priority?: number;

	closeOnRouteChange?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class DonationService implements OnDestroy {
	DONATIONS_CLOSED_COOKIE = 'has-closed-hc-oc-donation-asks';

	modalCloseSub: Subscription;

	defaultOptions: DonationServiceOptions = {
		displayType: 'bottom-bar',
		donationBody: '',
		donationButtons: [],

		closeTimeout: 0,
		openTimeout: 0,

		priority: 0,

		closeOnRouteChange: false
	};

	currentOptions: DonationServiceOptions;

	priority = -1;
	openTimeoutWatcher: any;
	closeTimeoutWatcher: any;

	donationVisible$ = new BehaviorSubject<{ visible: boolean }>({
		visible: false
	});

	modalRef: BsModalRef;

	private gotUserInteraction = false;

	constructor(private modalService: BsModalService, private cookieService: CookieService) { }

	ngOnDestroy() {
		if (this.modalCloseSub && !this.modalCloseSub.closed) {
			this.modalCloseSub.unsubscribe();
			this.modalCloseSub = null;
		}
	}

	requestDonationAsk(options: DonationServiceOptions) {
		if (this.cookieService.get(this.DONATIONS_CLOSED_COOKIE) === 'true') {
			console.log('Donation service -- User has already closed donation asks');
			return;
		}

		console.log('Donation service -- Creation', Date.now());
		options = Object.assign({}, this.defaultOptions, options);

		this.checkPriority(options);
	}

	checkPriority(options: DonationServiceOptions) {
		if (options.priority > this.priority) {
			this.startDonationAsk(options);
		} else {
			console.log('Donation service -- A higher priority donation ask was already created', Date.now());
		}
	}

	startDonationAsk(options: DonationServiceOptions) {
		this.priority = options.priority;
		this.currentOptions = options;

		console.log('Donation service -- Starting ask:', options, Date.now());

		clearTimeout(this.openTimeoutWatcher);
		this.openTimeoutWatcher = setTimeout(() => {
			this.changeVisibility(true);
			console.log('Donation service -- Open', Date.now());

			if (options.displayType === 'modal') {
				this.openModal(options);
			} else if (options.closeTimeout) {
				console.log('Donation service -- Scheduling close', Date.now());
				this.closeTimeoutWatcher = setTimeout(() => {
					this.close();
				}, options.closeTimeout);
			}
		}, options.openTimeout);
	}

	changeVisibility(isVisible: boolean) {
		this.donationVisible$.next({ visible: isVisible });
	}

	openModal(options: DonationServiceOptions) {
		this.modalRef = this.modalService.show(ModalComponent, {
			initialState: { options },
			class: 'modal-md modal-dialog-centered modal-dialog-scrollable'
		});
		this.modalCloseSub = this.modalService.onHide.subscribe(() => {
			this.close();
		});
	}

	softClose() {
		if (this.currentOptions && this.currentOptions.displayType && this.currentOptions.displayType === 'banner') return;
		if (!this.gotUserInteraction) {
			this.priority = -1;
		}
		console.log('Donation service -- Soft Close', Date.now());
		this.changeVisibility(false);
		clearTimeout(this.openTimeoutWatcher);
		clearTimeout(this.closeTimeoutWatcher);
	}

	close() {
		this.gotUserInteraction = true;
		this.cookieService.set(this.DONATIONS_CLOSED_COOKIE, 'true', 7);
		console.log('Donation service -- Close', Date.now());
		this.changeVisibility(false);
		clearTimeout(this.openTimeoutWatcher);
		clearTimeout(this.closeTimeoutWatcher);
	}
}
