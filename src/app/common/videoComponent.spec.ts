import {TestBed, waitForAsync} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../state';
import {Store} from '@ngrx/store';
jest.mock('./helpers', () => ({
	__esModule: true,
	setVideo: jest.fn(),
}));
import {setVideo as setVideoSpy} from './helpers';
import {CAPTION_SELECTION_KEY, VideoComponent} from './videoComponent';
import {selectModalStatus} from '../state/ui/selectors';
import {getMockHcVideoPlayer, getMockMultimediaItem, MockHcVideoPlayer, MockStorage} from '../../test.helpers';
import {setVideoPlay, setVideoProgress, setVideoProgressForce, setVideoReachedEnd} from '../state/courses/actions';
import {LOCAL_STORAGE} from './models';

describe('VideoComponent', () => {
	let store;
	let pixelTacker;
	let storage;
	let component: VideoComponent;
	let player: MockHcVideoPlayer;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: LOCAL_STORAGE, useClass: MockStorage}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		store = TestBed.inject(Store);
		pixelTacker = {trackEvent: jest.fn()};
		storage = TestBed.inject(LOCAL_STORAGE);
		component = new VideoComponent(store, storage);
		jest.spyOn(store, 'dispatch');

		player = getMockHcVideoPlayer();
		component.playerVideoRef = {
			nativeElement: player as HTMLHcVideoPlayerElement
		};
	});

	it('should pause player on call to onPlayerInit', async () => {
		const setPositionSpy = jest.spyOn<any, any>(component, 'setPositionIfNotStartedAndNotAtEndOfVideo');

		const mockModalSelector = store.overrideSelector(selectModalStatus, false);



		//mock the modal selector with a default closed state
		component.onPlayerInit();
		// expect(setPositionSpy).toHaveBeenCalled();

		const isPaused = jest.spyOn(component.playerVideoRef.nativeElement, 'isPaused');
		const pause = jest.spyOn(component.playerVideoRef.nativeElement, 'pause');

		//validate that it doesn't calls isPaused immediately (on closed modal state)
		expect(isPaused).not.toHaveBeenCalled();

		//start the player so that the pause check can be tested
		// await component.player.play();

		//update the modal selector to indicate that the modal is open
		mockModalSelector.setResult(true);
		store.refreshState();
		await Promise.resolve();
		expect(isPaused).toHaveBeenCalled();
		await Promise.resolve();

		expect(pause).toHaveBeenCalled();
	});


	describe('set playerVideoRef eventListeners', () => {


		let dispatchSpy: jest.SpyInstance;

		let videoProgEvent: (event) => void;
		let videoStatusEvent: (event) => void;

		beforeEach(() => {
			dispatchSpy = jest.spyOn(component, 'dispatchProgress').mockImplementation(() => {});
			expect(player.addEventListener).toHaveBeenCalledTimes(5);
			expect(dispatchSpy).not.toHaveBeenCalled();

			const calls = (player.addEventListener as jest.Mock).mock.calls;
			expect(calls).toEqual([
				['videoProgress', expect.any(Function)],
				['videoStatus', expect.any(Function)],
				['videoPlaybackRate', expect.any(Function)],
				['captionLanguage', expect.any(Function)],
				['volumechange', expect.any(Function)],
			]);
			videoProgEvent = calls[0][1];
			videoStatusEvent = calls[1][1];
		});
		afterEach(() => {
			console.log('set afterEach');
			dispatchSpy.mockClear();
		});



		describe('[videoProgress]', () => {
			const progressEvent = {detail: {videoId: '1231', currentTimestamp: 1231}};
			it('no dispatch on empty course AND currentContentId', () => {
				component.courseId = null;

				component['currentContentId'] = null;
				videoProgEvent(progressEvent);
				expect(dispatchSpy).not.toHaveBeenCalled();
			});
			it('no dispatch on empty courseId', () => {
				component.courseId = null;

				component['currentContentId'] = '1';
				videoProgEvent(progressEvent);
				expect(dispatchSpy).not.toHaveBeenCalled();
			});
			it('no dispatch on empty currentContentId', () => {
				component.courseId = '123';

				component['currentContentId'] = null;
				videoProgEvent(progressEvent);
				expect(dispatchSpy).not.toHaveBeenCalled();
			});
			it('no dispatch on valid fields but invalid event', () => {
				component.courseId = '123';

				component['currentContentId'] = '1';
				videoProgEvent({videoId: null, currentTimestamp: null});
				expect(dispatchSpy).not.toHaveBeenCalled();
				videoProgEvent({videoId: '1', currentTimestamp: null});
				expect(dispatchSpy).not.toHaveBeenCalled();
				videoProgEvent({videoId: null, currentTimestamp: 1});
				expect(dispatchSpy).not.toHaveBeenCalled();
			});
			it('dispatch on valid fields and event', () => {
				component.courseId = '123';

				component['currentContentId'] = '1';
				videoProgEvent(progressEvent);
				expect(dispatchSpy).toHaveBeenCalled();
			});
		});

		describe('[videoStatus]', () => {
			const statusEvent = {detail: {status: 'played', videoId: '1231', currentTimestamp: 1231}};
			it('no dispatch on empty course AND currentContentId', () => {
				component.courseId = null;

				component['currentContentId'] = null;
				videoStatusEvent(statusEvent);
				expect(store.dispatch).not.toHaveBeenCalled();
			});
			it('no dispatch on empty courseId', () => {
				component.courseId = null;

				component['currentContentId'] = '1';
				videoStatusEvent(statusEvent);
				expect(store.dispatch).not.toHaveBeenCalled();
			});
			it('no dispatch on empty currentContentId', () => {
				component.courseId = '123';

				component['currentContentId'] = null;
				videoStatusEvent(statusEvent);
				expect(store.dispatch).not.toHaveBeenCalled();
			});
			it('no dispatch on valid fields but invalid event', () => {
				component.courseId = '123';

				component['currentContentId'] = '1';
				videoStatusEvent({status: 'played', videoId: null, currentTimestamp: null});
				expect(store.dispatch).not.toHaveBeenCalled();;
				videoStatusEvent({status: 'played', videoId: '1', currentTimestamp: null});
				expect(store.dispatch).not.toHaveBeenCalled();
				videoStatusEvent({status: 'played', videoId: null, currentTimestamp: 1});
				expect(store.dispatch).not.toHaveBeenCalled();
			});

			const getStandardSetVideoProgressObj = () => {
				return setVideoProgress({
					userId:  null,
					videoId: statusEvent.detail.videoId,
					progress: statusEvent.detail.currentTimestamp,
					courseId: component.courseId,
					contentId: '1',
					eventTime: expect.any(Number),
					lectureType: component.videoType,
				});
			};
			it('dispatch on "played" valid fields and event', async () => {
				component.courseId = '123';

				component['currentContentId'] = '1';
				(player.getTitle as jest.Mock).mockImplementation(() => Promise.resolve('res'));

				videoStatusEvent(statusEvent);
				expect(store.dispatch).toHaveBeenCalled();
				expect(component.videoStarted).toBeTruthy();
				expect(player.getTitle).toHaveBeenCalled();
				await Promise.resolve(); //make sure any promises have cleared
				expect(store.dispatch.mock.calls).toEqual([
					[
						getStandardSetVideoProgressObj(),
					],
					[
						setVideoPlay({
							videoId: statusEvent.detail.videoId,
							courseId: component.courseId,
							contentId: '1',
							title: 'res',
						})
					],
				]);
			});
			it('dispatch on "paused" valid fields and event', async () => {
				component.courseId = '123';

				component['currentContentId'] = '1';
				(player.getTitle as jest.Mock).mockImplementation(() => Promise.resolve('res'));

				videoStatusEvent({detail: {...statusEvent.detail, status: 'paused'}});
				await Promise.resolve(); //make sure any promises have cleared
				expect(store.dispatch).toHaveBeenCalled();
				expect(store.dispatch.mock.calls).toEqual([
					[
						getStandardSetVideoProgressObj(),
					],
				]);
				expect(dispatchSpy).toHaveBeenCalledWith(
					statusEvent.detail.videoId,

					component['currentContentId'],
					true,
					statusEvent.detail.currentTimestamp
				);
			});
			it('dispatch on "ended" valid fields and event', async () => {
				component.courseId = '123';

				component['currentContentId'] = '1';
				(player.getTitle as jest.Mock).mockImplementation(() => Promise.resolve('res'));

				videoStatusEvent({detail: {...statusEvent.detail, status: 'ended'}});
				await Promise.resolve(); //make sure any promises have cleared
				expect(store.dispatch).toHaveBeenCalled();
				expect(store.dispatch.mock.calls).toEqual([
					[
						setVideoReachedEnd({
							videoId: statusEvent.detail.videoId,
							courseId: component.courseId,
							contentId: '1',
						})
					],
					[
						getStandardSetVideoProgressObj(),
					],
				]);
				expect(dispatchSpy).toHaveBeenCalledWith(
					statusEvent.detail.videoId,

					component['currentContentId'],
					true,
					statusEvent.detail.currentTimestamp
				);
			});
		});


	});

	it('set playerVideoRef should wait for player onAvailable to init player', async () => {
		const player = getMockHcVideoPlayer();
		const initSpy = jest.spyOn(component, 'onPlayerInit').mockImplementation(() => {});
		const setPosSpy = jest.spyOn(component, 'setPositionIfNotStartedAndNotAtEndOfVideo')
			.mockImplementation(() => Promise.resolve(0));
		// player.onAvailable = jest.fn(() => Promise.resolve((res) => {
		// 	setTimeout(res, 1000);
		// }));

		component.playerVideoRef = {nativeElement: player} as any;
		expect(component.playerVideoRef.nativeElement.onAvailable).toHaveBeenCalled();
		expect(initSpy).not.toHaveBeenCalled();
		expect(setPosSpy).toHaveBeenCalled();

		expect(component.playerVideoRef.nativeElement.addEventListener).toHaveBeenCalledTimes(5); // videoProgress, videoStatus, videoPlaybackRate



		expect(initSpy).not.toHaveBeenCalled();

		await Promise.resolve();

		expect(initSpy).toHaveBeenCalled();
	});

	it('should call setVideo and set properties on call to loadVideo', () => {
		expect(setVideoSpy).not.toHaveBeenCalled();

		expect(component['currentContentId']).toBeFalsy();
		expect(component.requestedVideo).toBeFalsy();

		storage.getItem.mockImplementation(val => val);
		component.loadVideo(1 as any, false, '2');

		expect(setVideoSpy).toHaveBeenCalledWith(component.playerVideoRef, 1, 'selectedCaptionSetting', 'selectedVolumeSetting');

		expect(component['currentContentId']).toBe('2');
		expect(component.requestedVideo).toBe(1);
		expect(storage.getItem).toHaveBeenCalledWith(CAPTION_SELECTION_KEY);
	});

	const testModalUnsub = () => {
		const unsubSpy = jest.fn();

		component['modalWatcherSub'] = {unsubscribe: unsubSpy, closed: true } as any;
		component.ngOnDestroy();

		expect(unsubSpy).not.toHaveBeenCalled();


		component['modalWatcherSub'].closed = false;
		component.ngOnDestroy();

		expect(unsubSpy).toHaveBeenCalled();
	};

	it('should do nothing in on ngOnDestroy if no player', testModalUnsub);


	it('should playAndEnable', async () => {
		expect(component.playerVideoRef.nativeElement.play).not.toHaveBeenCalled();
		component.playAndEnable();
		expect(component.playerVideoRef.nativeElement.play).toHaveBeenCalled();
	});

	it('should clearPreviousVideoPlayer', testModalUnsub);

	it('should do nothing if dispatchProgress called when no video id', async () => {
		expect(store.dispatch).not.toHaveBeenCalled();
		component.dispatchProgress(null, '12', true, 123);

		await Promise.resolve();

		expect(store.dispatch).not.toHaveBeenCalled();
	});
	it('should do nothing if dispatchProgress called when 0 prog', async () => {
		expect(store.dispatch).not.toHaveBeenCalled();
		component.dispatchProgress('2134234', '12', true, 0);

		await Promise.resolve();

		expect(store.dispatch).not.toHaveBeenCalled();
		expect(component.videoStartPosition).toBeUndefined();
	});
	it('should do dispatch if dispatchProgress called when passed prog', async () => {
		expect(store.dispatch).not.toHaveBeenCalled();
		component.courseId = 'crs';
		component.videoType = 'testVid';
		const videoId = '123213';
		const contentId = '12';
		component.dispatchProgress(videoId, contentId, false, 10);

		await Promise.resolve();

		expect(store.dispatch).toHaveBeenCalledWith(setVideoProgress({
			userId: null,
			videoId,
			progress: 10,
			contentId,
			courseId: component.courseId,
			lectureType: component.videoType,
			eventTime: expect.any(Number),
		}));
		expect(component.videoStartPosition).toBe(10);
		expect(component.playerVideoRef.nativeElement.getTime).not.toHaveBeenCalled();
	});
	it('should do dispatch if dispatchProgress called when passed prog (force)', async () => {
		expect(store.dispatch).not.toHaveBeenCalled();
		component.courseId = 'crs';
		component.videoType = 'testVid';
		const videoId = '123213';
		const contentId = '12';
		component.dispatchProgress(videoId, contentId, true, 10);

		await Promise.resolve();

		expect(store.dispatch).toHaveBeenCalledWith(setVideoProgressForce({
			userId: null,
			videoId,
			progress: 10,
			contentId,
			courseId: component.courseId,
			lectureType: component.videoType,
			eventTime: expect.any(Number),
		}));
		expect(component.videoStartPosition).toBe(10);
		expect(component.playerVideoRef.nativeElement.getTime).not.toHaveBeenCalled();
	});
	it('should do dispatch if dispatchProgress called when player has prog', async () => {
		expect(store.dispatch).not.toHaveBeenCalled();
		component.courseId = 'crs';
		component.videoType = 'testVid';
		const videoId = '123213';
		const contentId = '12';
		component.playerVideoRef.nativeElement.getTime = jest.fn(() => Promise.resolve(10));
		component.dispatchProgress(videoId, contentId, false);

		await Promise.resolve();

		expect(store.dispatch).toHaveBeenCalledWith(setVideoProgress({
			userId: null,
			videoId,
			progress: 10,
			contentId,
			courseId: component.courseId,
			lectureType: component.videoType,
			eventTime: expect.any(Number),
		}));
		expect(component.videoStartPosition).toBe(10);
		expect(component.playerVideoRef.nativeElement.getTime).toHaveBeenCalled();
	});
	it('should do dispatch if dispatchProgress called when player has prog (force)', async () => {
		expect(store.dispatch).not.toHaveBeenCalled();
		component.courseId = 'crs';
		component.videoType = 'testVid';
		const videoId = '123213';
		const contentId = '12';
		component.playerVideoRef.nativeElement.getTime = jest.fn(() => Promise.resolve(10));

		component.dispatchProgress(videoId, contentId, true);

		await Promise.resolve();

		expect(store.dispatch).toHaveBeenCalledWith(setVideoProgressForce({
			userId: null,
			videoId,
			progress: 10,
			contentId,
			courseId: component.courseId,
			lectureType: component.videoType,
			eventTime: expect.any(Number),
		}));
		expect(component.videoStartPosition).toBe(10);
		expect(component.playerVideoRef.nativeElement.getTime).toHaveBeenCalled();
	});

	describe('setPositionIfNotStartedAndNotAtEndOfVideo', () => {
		const runResumeTest = async (resumeTime: number, playerDuration: number|null, shouldCall: boolean) => {
			component.playerVideoRef.nativeElement.getDuration = jest.fn(() => Promise.resolve(playerDuration));
			component.videoStartPosition = resumeTime;
			jest.spyOn(component.playerVideoRef.nativeElement, 'setTime').mockImplementation(r => Promise.resolve(r));
			const res = await component.setPositionIfNotStartedAndNotAtEndOfVideo();
			if (shouldCall) {
				expect(component.playerVideoRef.nativeElement.setTime).toHaveBeenCalledWith(resumeTime);
				expect(res).toBe(resumeTime);
			} else {
				expect(component.playerVideoRef.nativeElement.setTime).not.toHaveBeenCalled();
				expect(res).toBe(0);
			}
		};

		describe('should resume', () => {
			it('at 31 seconds from end (resume, player duration; no mm duration)', async () => {
				await runResumeTest(11, 42, true);
			});

			it('(resume, player duration; no mm duration)', async () => {
				await runResumeTest(5, 42, true);
			});

			it('(resume, no player duration; mm duration)', async () => {
				component.requestedVideo = getMockMultimediaItem({duration: 88});
				await runResumeTest(5, null, true);
			});

			it('(resume; player duration not called; mm duration)', async () => {
				component.requestedVideo = getMockMultimediaItem({duration: 88});
				await runResumeTest(5, null, true);
				expect(component.playerVideoRef.nativeElement.getDuration).not.toHaveBeenCalled();
			});

			it('(resume; no player duration; no mm duration)', async () => {
				await runResumeTest(485, null, true);

			});
		});
		describe('should not resume', () => {
			it('if no player', async () => {
				const res = await component.setPositionIfNotStartedAndNotAtEndOfVideo();
				expect(res).toBe(0);
			});

			it('(no resume, player duration; no mm duration)', async () => {
				await runResumeTest(0, 42, false);
			});

			it('if started (resume; no player duration; no mm duration)', async () => {
				component.videoStarted = true;
				await runResumeTest(88, 42, false);
			});

			it('if within 30 seconds of end (resume, no player duration, mm duration)', async () => {
				component.requestedVideo = getMockMultimediaItem({duration: 344});
				await runResumeTest(314, null, false);
			});
		});
	});
});
