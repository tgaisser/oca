import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'introTextUniformStyle'})
export class IntroTextUniformStylePipe implements PipeTransform {
	transform(introText: string) {
		introText = introText.replace('+++', ' ');
		return introText;
	}
}


@Pipe({name: 'introTextWithBreak'})
export class IntroTextWithBreakPipe implements PipeTransform {
	transform(introText: string) {
		if (introText.indexOf('+++') !== -1) {
			const titleWithBreak = introText.split('+++');
			return `${titleWithBreak[0]}<br> <span>${titleWithBreak[1]}</span>`;
		} else {
			return introText;
		}
	}
}
