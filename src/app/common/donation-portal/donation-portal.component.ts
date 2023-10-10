import {Component, Input, OnInit} from '@angular/core';

@Component({
	selector: 'app-donation-portal',
	templateUrl: './donation-portal.component.html',
	styleUrls: []
})
export class DonationPortalComponent implements OnInit {
	@Input() url: string;

	constructor() {
	}

	ngOnInit() {
	}

}
