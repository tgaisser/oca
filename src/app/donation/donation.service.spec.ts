import { DonationService, DonationServiceOptions } from './donation.service';
import { of, EMPTY } from 'rxjs';
import {createSpyObj} from '../../test.helpers';

describe('DonationService', () => {
	let donationService: DonationService;
	let cookieServiceSpy;
	let bsModalServiceSpy;
	let timerCallback: any;
	let testOptions: DonationServiceOptions;

	beforeEach(() => {
		bsModalServiceSpy = {...createSpyObj('BsModalService', ['show']), onHide: of(EMPTY)};
		cookieServiceSpy = createSpyObj('CookieService', ['get', 'set']);
		timerCallback = jest.fn();

		donationService = new DonationService(bsModalServiceSpy, cookieServiceSpy);
		testOptions = {};

		jest.useFakeTimers();
	});

	afterEach(() => {
		//clock uninstall?
	});

	it('should be created', () => {
		expect(donationService).toBeTruthy();
	});

	it('should do nothing if the "donation closed" cookie is present', () => {
		cookieServiceSpy.get = jest.fn(() => 'true');

		jest.spyOn(donationService, 'checkPriority').mockImplementation(() => {});

		donationService.requestDonationAsk(testOptions);

		expect(donationService.checkPriority).not.toHaveBeenCalled();
	});

	it('should do nothing if the a higher priority donation ask has already run', () => {
		donationService.priority = 20;

		jest.spyOn(donationService, 'startDonationAsk').mockImplementation(() => {});

		donationService.checkPriority(testOptions);

		expect(donationService.startDonationAsk).not.toHaveBeenCalled();
	});

	it('should change visibility immediately if no openTimeout is present', () => {
		jest.spyOn(donationService, 'changeVisibility').mockImplementation(() => {});

		donationService.startDonationAsk(testOptions);

		jest.advanceTimersByTime(0);
		expect(donationService.changeVisibility).toHaveBeenCalled();
	});

	it('should change visibility immediately even if the openTimeout is "null"', () => {
		testOptions = {
			openTimeout: null
		};
		jest.spyOn(donationService, 'changeVisibility').mockImplementation(() => {});

		donationService.startDonationAsk(testOptions);

		jest.advanceTimersByTime(0);
		expect(donationService.changeVisibility).toHaveBeenCalled();
	});

	it('should change visibility after the specified openTimeout', () => {
		const timeout = 3000;
		testOptions = {
			openTimeout: timeout
		};

		jest.spyOn(donationService, 'changeVisibility').mockImplementation(() => {});

		donationService.startDonationAsk(testOptions);

		// Immediately
		expect(donationService.changeVisibility).not.toHaveBeenCalled();

		// One tick before openTimeout
		jest.advanceTimersByTime(timeout - 1);
		expect(donationService.changeVisibility).not.toHaveBeenCalled();

		// Right when openTimeout content is run
		jest.advanceTimersByTime(1);
		expect(donationService.changeVisibility).toHaveBeenCalled();
	});

	it('should not open a modal if displayType != "modal"', () => {
		testOptions = {
			displayType: 'banner'
		};

		jest.spyOn(donationService, 'openModal').mockImplementation(() => {});

		donationService.startDonationAsk(testOptions);

		jest.advanceTimersByTime(0);
		expect(donationService.openModal).not.toHaveBeenCalled();
	});

	it('should not have a queued close timeout if no closeTimeout specified and if displayType != "modal"', () => {
		testOptions = {
			displayType: 'banner'
		};

		donationService.startDonationAsk(testOptions);

		jest.advanceTimersByTime(0);
		expect(donationService.closeTimeoutWatcher).toBeFalsy();
	});

	it('should close after the specified closeTimout if displayType != "modal"', () => {
		const timeout = 3000;
		testOptions = {
			displayType: 'banner',
			closeTimeout: timeout
		};

		jest.spyOn(donationService, 'close').mockImplementation(() => {});

		donationService.startDonationAsk(testOptions);

		// Immediately
		jest.advanceTimersByTime(0);
		expect(donationService.close).not.toHaveBeenCalled();

		// One tick before closeTimeout
		jest.advanceTimersByTime(timeout - 1);
		expect(donationService.close).not.toHaveBeenCalled();

		// Right when closeTimeout content is run
		jest.advanceTimersByTime(1);
		expect(donationService.close).toHaveBeenCalled();
	});

	it('should open a modal and have no close timeout if displayType == "modal"', () => {
		testOptions = {
			displayType: 'modal'
		};

		jest.spyOn(donationService, 'openModal').mockImplementation(() => {});

		donationService.startDonationAsk(testOptions);

		jest.advanceTimersByTime(0);
		expect(donationService.openModal).toHaveBeenCalled();
	});

	it('should have no queued close timeout if displayType == "modal", even if closeTimeout has a value', () => {
		testOptions = {
			displayType: 'modal',
			closeTimeout: 3000
		};

		donationService.startDonationAsk(testOptions);

		jest.advanceTimersByTime(0);
		expect(donationService.closeTimeoutWatcher).toBeFalsy();
	});

	it('should have a modalRef if a modal was opened', () => {
		bsModalServiceSpy.show = jest.fn(() => 42);

		testOptions = {
			displayType: 'modal',
			closeTimeout: 3000
		};

		donationService.openModal(testOptions);

		jest.advanceTimersByTime(0);
		expect(donationService.modalRef).toBeTruthy();
	});
});
