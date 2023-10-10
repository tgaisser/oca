import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, filter, flatMap, map, tap} from 'rxjs/operators';
import {UserDataService} from '../../../services/user-data.service';
import {Observable, of, concat} from 'rxjs';
import {WindowBehaviorService} from '../../../services/window-behavior.service';

@Component({
	selector: 'app-discourse-sso',
	templateUrl: './discourse-sso.component.html',
	styleUrls: ['./discourse-sso.component.less']
})
export class DiscourseSsoComponent implements OnInit {

	loading = true;
	errorMessage = null;
	successMessage = null;

	validationStatus = new Observable<{clsName: string, message: string}>();

	constructor(private route: ActivatedRoute, private userDataSvc: UserDataService, private windowBehaviorService: WindowBehaviorService) {
	}

	ngOnInit() {
		this.validationStatus = concat(
			of({clsName: 'text-info', message: 'Validating token'}),
			this.route.queryParams.pipe(
				map(params => ({sso: params.sso, sig: params.sig})),
				// filter(params => params.sso && params.sig)
				tap(i => this.loading = true),
				flatMap(params => this.userDataSvc.processDiscourseSSO(params.sso, params.sig)),
				map(redirectUrl => {
					this.loading = false;
					console.log('about to redirect to ', redirectUrl); // {order: "popular"}

					this.successMessage = 'Login validated. Redirecting.';
					setTimeout(() => {
						this.windowBehaviorService.loadNewUrl(redirectUrl);
					}, 2000);

					return {clsName: 'text-success', message: 'Login validated. We are now taking you to the discussion board.'};
				}),
				catchError(err => {
					console.log('got error validating SSO', err);
					return of({clsName: 'text-danger', message: err.message});
				})
			)
		);
	}

}
