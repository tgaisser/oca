import {Inject, Injectable} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {LOCAL_STORAGE} from '../../../common/models';

@Injectable({
	providedIn: 'root'
})
export class ConfirmCodeService {
	email: string;
	password: string;

	constructor(@Inject(LOCAL_STORAGE) private localStorage: Storage) {
		const pass = this.localStorage.getItem(UserService.CONFIRM_PASSWORD_KEY);
		if (pass) {
			this.password = pass;
		}
	}
}
