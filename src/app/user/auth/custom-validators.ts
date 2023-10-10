import {Validators} from '@angular/forms';

const specialChars = /[\W_]/;
const lowerCharsPatt = /[a-z]/;
const upperCharsPatt = /[A-Z]/;
const numCharPatt = /[0-9]/;

export class CustomValidators {
	static passwordValidators = [
		Validators.required, //(ctrl => this.passwordResults)]),//this.schema.validate(ctrl.value))]),
		Validators.minLength(8),
		ctrl => {
			const value = ctrl && ctrl.value;
			return [
				!lowerCharsPatt.test(value) ? 'lower' : null,
				!upperCharsPatt.test(value) ? 'upper' : null,
				!numCharPatt.test(value) ? 'number' : null,
				// !specialChars.test(value) ? 'special' : null,
			]
				.filter(i => i)
				.reduce((agg, cur) => {
					agg[cur] = true;
					return agg;
				}, ({}));
		},
	];
}
