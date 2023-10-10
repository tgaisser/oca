import { Pipe, PipeTransform } from '@angular/core';
import {get} from 'lodash';

@Pipe({
	name: 'instructorName'
})
export class InstructorNamePipe implements PipeTransform {
	transform(value: any, args?: any): string {
		const middle = get(value, 'middle_name', '');
		return `${value.first_name} ${middle} ${value.last_name} ${value.suffix}`;
	}
}
