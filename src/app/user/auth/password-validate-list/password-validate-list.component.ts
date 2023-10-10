import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import { faCheck, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-password-validate-list',
	template: `
		<div>
			<div class="password-rule" [ngClass]="{'completed': !passwordInput.errors?.required && !passwordInput.errors?.minlength}">
				<fa-icon [icon]="!passwordInput.errors?.required && !passwordInput.errors?.minlength ? faCheck : faX" [fixedWidth]="true"></fa-icon>
				At least 8 characters long
			</div>
			<div class="password-rule" [ngClass]="{'completed': !passwordInput.errors?.number}">
				<fa-icon [icon]="!passwordInput.errors?.number ? faCheck : faX" [fixedWidth]="true"></fa-icon>
				Includes at least one number
			</div>
			<div class="password-rule" [ngClass]="{'completed': !passwordInput.errors?.lower}">
				<fa-icon [icon]="!passwordInput.errors?.lower ? faCheck : faX" [fixedWidth]="true"></fa-icon>
				Includes at least one lower case letter
			</div>
			<div class="password-rule" [ngClass]="{'completed': !passwordInput.errors?.upper}">
				<fa-icon [icon]="!passwordInput.errors?.upper ? faCheck : faX" [fixedWidth]="true"></fa-icon>
				Includes at least one upper case letter
			</div>
		</div>
	`,
	styleUrls: ['./password-validate-list.component.less']
})
export class PasswordValidateListComponent implements OnInit {

	@Input()
		passwordInput: AbstractControl;

	faX = faX;
	faCheck = faCheck;

	constructor() {
	}

	ngOnInit() {
	}

}
