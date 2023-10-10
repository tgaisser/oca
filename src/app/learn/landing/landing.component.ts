import {Component, Input, OnInit} from '@angular/core';
import {PageLearn} from '../../services/course-data.service';
import {Store} from '@ngrx/store';
import {State} from '../../state';
import * as userActions from '../../state/user/actions';

@Component({
	selector: 'app-landing',
	templateUrl: './landing.component.html',
	styleUrls: ['./landing.component.less']
})
export class LandingComponent implements OnInit {
	@Input() pageLearn: PageLearn;

	constructor(
		private store: Store<State>,
	) {
	}

	ngOnInit(): void {
		this.store.dispatch(userActions.userSetPostLoginUrl({url: '/learn/thank-you'}));
	}

}
