import {Component, Input, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal'; //TODO ngx-bootstrap
import {Store} from '@ngrx/store';
import {State} from '../state';
import {UserMatch, UserType} from '../services/user.service';
import {UserDataService} from '../services/user-data.service';
import {ToastrService} from 'ngx-toastr';
import {filter, flatMap, map, take, tap} from 'rxjs/operators';
import {interval, Observable, of} from 'rxjs';
import {LoadingService} from '../common/loading.service';
import {userMergeModalAccountMadeChanges} from '../state/user/actions';
import {faFacebookSquare} from '@fortawesome/free-brands-svg-icons';
import { faAt, faLink } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-matching-accounts',
	templateUrl: './matching-accounts.component.html',
	styleUrls: ['./matching-accounts.component.less']
})
export class MatchingAccountsComponent implements OnInit {

	readonly PROMPT_MODE = 'Prompt';
	readonly CONFIRM_PROMPT_MODE = 'ConfirmPrompt';
	readonly NONLINK_PROMPT_MODE = 'NonLinkPrompt';
	readonly CONFIRMATION_MODE = 'Confirmation';
	readonly INVALID_CONFIG = 'INVALID_CONFIG';

	faFacebook = faFacebookSquare;
	faAt = faAt;
	faLink = faLink;

	readonly TIME_BEFORE_SIGNOUT = 60;

	redirectTimer$: Observable<number>;

	mode = this.PROMPT_MODE;
	@Input()
		matchingAccounts: UserMatchSelection[] = [];

	get linkedAccounts() {
		return this.matchingAccounts.filter(a => a.selected);
	}

	get nonLinkedAccounts() {
		return this.matchingAccounts.filter(a => !a.selected && !a.current);
	}

	get hasInvalidMergeAccounts() {
		return this.matchingAccounts.filter(a => a.type === UserType.Email).length > 1;
	}

	constructor(
		public modal: BsModalRef, private store: Store<State>,
		public userDataService: UserDataService, private toastr: ToastrService,
		private loading: LoadingService
	) {	}

	ngOnInit() {
		console.log('accounts', this.matchingAccounts);
		this.mode = !this.hasInvalidMergeAccounts ? this.PROMPT_MODE : this.INVALID_CONFIG;
	}

	merge() {
		const accountsToMove = this.matchingAccounts.filter(a => a.selected);
		console.log('merging accounts', accountsToMove);
		// this.modal.content = {merged: accountsToMove};
		// this.modal.hide();
		this.mode = this.CONFIRM_PROMPT_MODE;
	}

	confirmLink() {
		const accountsToMove = this.matchingAccounts.filter(a => a.selected);
		console.log('merging accounts', accountsToMove);

		this.loading.show();

		this.userDataService.mergeAccounts(accountsToMove).pipe(
			flatMap(result => {
				if (this.nonLinkedAccounts.length) {
					return this.userDataService.markAccountsIgnored(this.nonLinkedAccounts).pipe(map(r => [r, result]));
				} else {
					return of([result, null]);
				}
			})
		).subscribe((r: boolean[]) => {
			console.log('got merged result', r);

			this.loading.hide();

			if (r.filter(i => i === false).length) {
				this.toastr.error('There was an error while merging accounts. Please try again. If this persists, please contact support.');
			} else {
				this.mode = this.CONFIRMATION_MODE;
			}

			//if any of the calls succeeded, mark manipulation
			if (r.filter(i => i).length) {
				this.setupSignoutTimer();
			}
		}, err => {
			this.toastr.error(err);
		});

	}

	backToPrompt() {
		this.mode = this.PROMPT_MODE;
	}

	doNothing() {
		// this.modal.hide();
		this.mode = this.NONLINK_PROMPT_MODE;
	}

	confirmNonLink() {
		this.loading.show();

		//post a message to mark this user as non-linked
		this.userDataService.markAccountsIgnored(this.nonLinkedAccounts).subscribe(r => {
			console.log('ignored accounts', this.nonLinkedAccounts);
			this.loading.hide();

			if (r) {
				this.mode = this.CONFIRMATION_MODE;
				this.setupSignoutTimer();
			} else {
				this.toastr.error('There was an error marking accounts. Please try again. If this persists, please contact support.');
			}
		});
	}

	done() {
		const accountsToMove = this.matchingAccounts.filter(a => a.selected);
		console.log('merged accounts', accountsToMove);

		this.modal.hide();
	}

	private setupSignoutTimer() {
		this.store.dispatch(userMergeModalAccountMadeChanges());

		this.redirectTimer$ = interval(1000).pipe(
			map(r => r + 1),
			take(this.TIME_BEFORE_SIGNOUT + 1)
		);

		this.redirectTimer$
			.pipe(
				tap(r => console.log('r', r)),
				filter(r => r === this.TIME_BEFORE_SIGNOUT),
				tap(r => console.log('finished', r)),
				take(1)
			)
			.subscribe(() => {
				this.done();
			});
	}
}

export interface UserMatchSelection extends UserMatch {
	selected: boolean;
	current: boolean;
}
