import {Component, OnInit} from '@angular/core';
import {DonationService} from '../donation.service';

@Component({
	selector: 'app-donation-bottom-bar',
	templateUrl: './bottom-bar.component.html',
	styleUrls: ['./bottom-bar.component.less']
})
export class BottomBarComponent implements OnInit {
	constructor(public donationService: DonationService) {
	}

	ngOnInit() {
	}
}
