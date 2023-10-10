import {Component, OnInit, Input} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal'; //TODO ngx-bootstrap
import {DonationServiceOptions} from '../donation.service';

@Component({
	selector: 'app-donation-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.less']
})
export class ModalComponent implements OnInit {
	@Input() options: DonationServiceOptions;

	constructor(public modal: BsModalRef) {
	}

	ngOnInit() {
	}
}
