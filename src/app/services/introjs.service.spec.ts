import {TestBed} from '@angular/core/testing';

import {IntroJsService} from './intro-js.service';
import {MockBrowserAbstractionModule} from '../../test.helpers';
import {LOCAL_STORAGE} from '../common/models';
import {DOCUMENT} from '@angular/common';
import {WindowBehaviorService} from './window-behavior.service';

describe('IntrojsService', () => {
	let service: IntroJsService;
	let localStor: jest.MockedClass<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MockBrowserAbstractionModule]
		});
		service = TestBed.inject(IntroJsService);
		localStor = TestBed.inject(LOCAL_STORAGE);

	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should set tourIsOpen based on localStorage (true)', () => {
		const expectedDate = '2019-11-05';

		localStor.length = 1;
		localStor.key.mockImplementation(() => 'guided-tour-has-run-course');
		localStor.getItem.mockImplementation(() => expectedDate);

		service = new IntroJsService(TestBed.inject(DOCUMENT), TestBed.inject(WindowBehaviorService), localStor);

		expect(service.tourHasRun('course')).toBeTruthy();
		expect(localStor.getItem).toHaveBeenCalledWith('guided-tour-has-run-course');
	});

	const testIfNeeded = hasRun => {
		jest.spyOn(service, 'runIntro').mockImplementation(() => {});


		service['_tourHasRun'] = {course: hasRun};
		service.runIntroIfNeeded();

		if (!hasRun) {
			expect(service.runIntro).toHaveBeenCalled();
		} else {
			expect(service.runIntro).not.toHaveBeenCalled();
		}
	};

	it('runIntroIfNeeded should call runIntro if not run', () => {
		testIfNeeded(false);
	});
	it('runIntroIfNeeded should not call runIntro if run', () => {
		testIfNeeded(true);
	});

	it('should not launch introjs if open', () => {

		jest.useFakeTimers();


		service['_tourIsOpen'] = true;

		const doc = TestBed.inject(DOCUMENT);
		const mockIntro = jest.fn();

		doc.defaultView['introJs'] = mockIntro;

		service.runIntro('course');

		jest.runAllTimers();

		expect(mockIntro).not.toHaveBeenCalled();
		expect(service.tourHasRun('course')).toBeFalsy();

		jest.useRealTimers();
	});

	it('should launch introjs if not open', () => {

		jest.useFakeTimers();

		const doc = TestBed.inject(DOCUMENT);
		const mockIntro = {
			onbeforechange: jest.fn(),
			oncomplete: jest.fn(),
			onexit: jest.fn(),
			setOptions: jest.fn(),
			start: jest.fn(),
		};

		doc.defaultView['introJs'] = () => mockIntro;

		service.runIntro('course');

		jest.runAllTimers();

		expect(service.tourHasRun).toBeTruthy();
		expect(mockIntro.start).toHaveBeenCalled();
		expect(mockIntro.onbeforechange).toHaveBeenCalled();
		expect(mockIntro.oncomplete).toHaveBeenCalled();
		expect(mockIntro.onexit).toHaveBeenCalled();
		expect(mockIntro.setOptions).toHaveBeenCalled();

		jest.useRealTimers();
	});

	it('should set tourIsOpen based on localStorage (false)', () => {
		const expectedDate = '2019-11-04';

		localStor.getItem.mockImplementation(() => expectedDate);

		service = new IntroJsService(TestBed.inject(DOCUMENT), TestBed.inject(WindowBehaviorService), localStor);

		expect(service.tourIsOpen).toBeFalsy();
		expect(service.tourHasRun('course')).toBeFalsy();
	});
});
