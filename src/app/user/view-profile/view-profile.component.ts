import {Component, OnInit} from '@angular/core';
import {User} from '../../services/user.service';
import {Store} from '@ngrx/store';
import {State} from '../../state';
import {Observable} from 'rxjs';

@Component({
	selector: 'app-profile',
	templateUrl: './view-profile.component.html',
	styleUrls: ['./view-profile.component.less']
})
export class ViewProfileComponent implements OnInit {

	user$: Observable<User> = this.store.select(state => state.user.currentUser);

	constructor(private store: Store<State>) {
	}

	ngOnInit() {
	}

}
