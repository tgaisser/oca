import {Pipe, PipeTransform} from '@angular/core';
import {convertSecondsToTimeString} from '../helpers';

@Pipe({
	name: 'duration'
})
export class DurationPipe implements PipeTransform {

	transform(value: any, ...args: any[]): any {
		if (!value || typeof value !== 'number') {
			return '';
		}
		return convertSecondsToTimeString(value);
	}

}
