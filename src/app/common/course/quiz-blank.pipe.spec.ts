import {QuizBlankPipe} from './quiz-blank.pipe';

describe('QuizBlankPipe', () => {
	const pipe = new QuizBlankPipe();
	const correctSpan = '<span class="quiz-blank"><span class="sr-only"><strong>(blank)</strong></span></span>';
	const correctPlainTxt = '(blank)';

	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('ignores non-strings', () => {
		expect(pipe.transform(null)).toBe('');
		expect(pipe.transform(42)).toBe('');
		expect(pipe.transform({test: 'a'})).toBe('');
	});

	it('replaces ___ with correct span', () => {
		expect(pipe.transform('this ___ is awesome')).toBe(`this ${correctSpan} is awesome`);
		expect(pipe.transform('this ___ is ___ awesome')).toBe(`this ${correctSpan} is ${correctSpan} awesome`);
	});

	it('replaces ___ with correct span (count flag)', () => {
		expect(pipe.transform('this __ is awesome', 2)).toBe(`this ${correctSpan} is awesome`);
		expect(pipe.transform('this ___ is ___ awesome', 4)).toBe('this ___ is ___ awesome'); //flag for fewer than supplied
	});

	it('replaces ___ with correct span (plaintext)', () => {
		expect(pipe.transform('this ___ is awesome', 3, 'plaintext')).toBe(`this ${correctPlainTxt} is awesome`);
		expect(pipe.transform('this ___ is ___ awesome', 3, 'plaintext')).toBe(`this ${correctPlainTxt} is ${correctPlainTxt} awesome`);
	});

	it('replaces ___ with correct span (plaintext and count flag)', () => {
		expect(pipe.transform('this __ is awesome', 2, 'plaintext')).toBe(`this ${correctPlainTxt} is awesome`);
		expect(pipe.transform('this ___ is ___ awesome', 4, 'plaintext')).toBe('this ___ is ___ awesome'); //flag for fewer than supplied
	});
});
