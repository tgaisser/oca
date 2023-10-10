import {convertSecondsToTimeString, mergeQueryParamsFromSourceUrlIntoDestinationUrl, removeURLParameter, setVideo} from './helpers';
import {MultimediaItem} from 'hc-video-player';

describe('Helpers', () => {
	it('setVideo handles null mm gracefully', () => {
		const ref = {nativeElement: {multimedia: null}} as any;
		const mm = null;
		setVideo(ref, mm);
		expect(ref.nativeElement.multimedia).toBeNull();
	});
	it('setVideo handles null mm and ref gracefully', () => {
		const ref = null;
		const mm = null;
		setVideo(ref, mm);
		expect(ref?.nativeElement?.multimedia).toBeFalsy();
	});
	it('setVideo ignores mm when id same as current', () => {
		const ref = {nativeElement: {multimedia: {id: 'a'}}} as any;
		const mm = {id: 'a', duration: 0} as MultimediaItem;
		setVideo(ref, mm);
		expect(ref.nativeElement.multimedia).toEqual({id: 'a'});
	});
	it('setVideo assigns mm when valid', () => {
		const ref = {nativeElement: {multimedia: null}} as any;
		const mm = {id: '44', duration: 0} as MultimediaItem;
		setVideo(ref, mm);
		expect(ref.nativeElement.multimedia).toEqual({id: '44', duration: 0});
	});


	it('setVideo setsCaptionLanguage if passed', (done) => {
		const ref = {nativeElement: {multimedia: null, setCaptionLanguage: jest.fn(l => Promise.resolve(l))}} as any;
		const mm = {id: '44', duration: 0} as MultimediaItem;
		setVideo(ref, mm);
		expect(ref.nativeElement.multimedia).toEqual({id: '44', duration: 0});
		expect(ref.nativeElement.setCaptionLanguage).not.toHaveBeenCalled();

		setVideo(ref, mm, '22');
		expect(ref.nativeElement.multimedia).toEqual({id: '44', duration: 0});
		setTimeout(() => {
			expect(ref.nativeElement.setCaptionLanguage).toHaveBeenCalledWith('22');
			done();
		});
	});

	it('convertSecondsToTimeString converts correctly', () => {
		expect(convertSecondsToTimeString(2054)).toBe('34:14');
	});

	it('test removeURLParameter', () => {
		const url1 = 'https://online.hillsdale.edu';
		const url2 = 'https://online.hillsdale.edu?';
		const url3 = 'https://online.hillsdale.edu?earlyAccessToken=hf38h29ehr2e8hr02h';
		const url4 = 'https://online.hillsdale.edu?earlyAccessToken=hf38h29ehr2e8hr02h&utm=fh29382829dh08h';
		const url5 = 'https://online.hillsdale.edu?utm=fh29382829dh08h&earlyAccessToken=hf38h29ehr2e8hr02h';
		const url6 = 'https://online.hillsdale.edu?utm=fh29382829dh08h&earlyAccessToken=hf38h29ehr2e8hr02h&';
		// const url7 = 'https://online.hillsdale.edu?utm=fh29382829dh08h&earlyAccessToken=hf38h29ehr2e8hr02h#lalalala';

		const expected1 = 'https://online.hillsdale.edu';
		const expected2 = 'https://online.hillsdale.edu';
		const expected3 = 'https://online.hillsdale.edu';
		const expected4 = 'https://online.hillsdale.edu?utm=fh29382829dh08h';
		const expected5 = 'https://online.hillsdale.edu?utm=fh29382829dh08h';
		const expected6 = 'https://online.hillsdale.edu?utm=fh29382829dh08h';
		// const expected7 = 'https://online.hillsdale.edu?utm=fh29382829dh08h#lalalala';

		expect(removeURLParameter(url1, 'earlyAccessToken')).toStrictEqual(expected1);
		expect(removeURLParameter(url2, 'earlyAccessToken')).toStrictEqual(expected2);
		expect(removeURLParameter(url3, 'earlyAccessToken')).toStrictEqual(expected3);
		expect(removeURLParameter(url4, 'earlyAccessToken')).toStrictEqual(expected4);
		expect(removeURLParameter(url5, 'earlyAccessToken')).toStrictEqual(expected5);
		expect(removeURLParameter(url6, 'earlyAccessToken')).toStrictEqual(expected6);
		// expect(removeURLParameter(url7, 'earlyAccessToken')).toStrictEqual(expected7);
	});

	it('test merge query params into URL', () => {
		const destination1 = 'https://secured.hillsdale.edu/hillsdale/principles-of-chemistry-prereg?sc=00647A0001L28DODDES';
		const source1 = 'https://online.hillsdale.edu/landing/chemistry/prereg?sc=00647N026DL24DODSES&utm_source=facebook&utm_medium=paid&utm_campaign=chemistry';
		const expected1 = 'https://secured.hillsdale.edu/hillsdale/principles-of-chemistry-prereg?sc=00647N026DL24DODSES&utm_source=facebook&utm_medium=paid&utm_campaign=chemistry';

		expect(mergeQueryParamsFromSourceUrlIntoDestinationUrl(source1, destination1)).toStrictEqual(expected1);

		const destination2 = 'https://secured.hillsdale.edu/hillsdale/principles-of-chemistry-prereg?utm_source=myspace&sc=ABCDEFG';
		const source2 = 'https://online.hillsdale.edu/landing/chemistry/prereg?sc=00647N026DL24DODSES&utm_source=facebook&utm_medium=paid&utm_campaign=chemistry';
		const expected2 = 'https://secured.hillsdale.edu/hillsdale/principles-of-chemistry-prereg?utm_source=facebook&sc=00647N026DL24DODSES&utm_medium=paid&utm_campaign=chemistry';

		expect(mergeQueryParamsFromSourceUrlIntoDestinationUrl(source2, destination2)).toStrictEqual(expected2);
	});

});
