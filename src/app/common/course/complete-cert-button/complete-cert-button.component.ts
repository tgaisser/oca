import {Component, Input, OnInit} from '@angular/core';
import {EMPTY, Observable, of, concat} from 'rxjs';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {UserService} from '../../../services/user.service';
import {Actions, ofType} from '@ngrx/effects';
import {userSessionRefreshed} from '../../../state/user/actions';

@Component({
	selector: 'app-complete-cert-button',
	template: `<a *ngIf="completionCertLink$ | async as link" class="btn btn-sm" [ngClass]="{'btn-primary': showAsButton, 'btn-link': !showAsButton}" target="_blank" [href]="link">
		Completion Certificate
	</a>`,
	styles: ['']
})
export class CompleteCertButtonComponent implements OnInit {
	@Input() showAsButton = true;

	_courseId = '';

	@Input()
	set courseId(value: string) {
		this._courseId = value;
		//create a cert link immediately. If there is a refresh event that fires, then create another cert link
		this.completionCertLink$ = concat(
			of(true),
			this.actionStream$.pipe(ofType(userSessionRefreshed), map(i => true))
		).pipe(
			mergeMap(() => this.userService.getIdTokenJwt()),
			filter(jwt => jwt),
			map(t => `${environment.certificateGenerationUrl}?courseId=${value}&t=${t}`),
		);
	}

	completionCertLink$: Observable<string> = EMPTY;

	constructor(private userService: UserService, private actionStream$: Actions) {
	}

	ngOnInit() {
	}

}
