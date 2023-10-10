import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'quizBlank'
})
export class QuizBlankPipe implements PipeTransform {

	transform(value: any, ...args: any[]): any {
		if (!value || typeof value !== 'string') {
			return '';
		}
		const numSpacesToCheck = args.length ? args[0] : 3;
		const extraSpaces = numSpacesToCheck - 2;
		const replaceStr = args.length && args[1] === 'plaintext' ?
			'$1(blank)$3' :
			'$1<span class="quiz-blank"><span class="sr-only"><strong>(blank)</strong></span></span>$3';
		const replacePatt = new RegExp(`(^|\\W)_(_{${extraSpaces},})_($|\\W)`, 'g');
		// console.log('patt')
		return value.replace(replacePatt, replaceStr);
	}

}
