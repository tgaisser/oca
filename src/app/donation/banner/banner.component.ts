import {Component, OnInit} from '@angular/core';
import {DonationService} from '../donation.service';

@Component({
	selector: 'app-donation-banner',
	templateUrl: './banner.component.html',
	styleUrls: ['./banner.component.less']
})
export class BannerComponent implements OnInit {
	constructor(public donationService: DonationService) {
	}

	ngOnInit() {
	}
}
