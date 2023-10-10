import {Component, NgZone, OnInit} from '@angular/core';
import Auth from '@aws-amplify/auth';
import {Router} from '@angular/router';
import {Hub} from '@aws-amplify/core';

@Component({
	selector: 'app-auth',
	template:
		`<main id="main-content" class="container">
			<router-outlet></router-outlet>
		</main>`,
	styles: [':host {height: 100%;}']
})
export class AuthComponent implements OnInit {

	constructor(private _router: Router, private _zone: NgZone) {
	}

	ngOnInit() {
	}

}
