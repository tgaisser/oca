import {InstructorNamePipe} from './instructor-name.pipe';
import * as helpers from '../../../test.helpers';

describe('InstructorNamePipe', () => {
	const pipe = new InstructorNamePipe();
	const instructor = {
		...helpers.getMockKenticoObject(),
		prefix: 'Mr',
		first_name: 'Test',
		middle_name: 'R.',
		last_name: 'Instructor',
		suffix: 'Jr',

	};
	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return from default instructor config', () => {
		expect(pipe.transform(instructor)).toBe('Test R. Instructor Jr');
	});

	it ('should return first name John', () => {
		instructor.first_name = 'John';
		expect(pipe.transform(instructor)).toBe('John R. Instructor Jr');
	});

	it('should have no middle name when empty', () => {
		instructor.first_name = 'John';
		instructor.middle_name = '';
		expect(pipe.transform(instructor)).toBe('John  Instructor Jr');
	});
});
