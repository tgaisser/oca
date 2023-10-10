import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {getMockMultimediaItem} from '../../../../test.helpers';

const mockWaveSurferObj = {
	on: jest.fn(),
	load: jest.fn(),
	getDuration: jest.fn(() => 1),
	setPlaybackRate: jest.fn(),
	seekTo: jest.fn(),
};
class MockWavesurfer {
	static create = jest.fn(() => mockWaveSurferObj);
}
class MockWavesurferCursor {
	static create = jest.fn(() => {});
}
jest.mock('wavesurfer.js', () => ({
	__esModule: true,
	default:  MockWavesurfer,
	WaveSurfer: MockWavesurfer
}));
jest.mock('wavesurfer.js/dist/plugin/wavesurfer.cursor.js', () => ({
	__esModule: true,
	default:  MockWavesurferCursor,
	WaveSurfer: MockWavesurferCursor
}));


import {AudioPlayerComponent} from './audio-player.component';
import {DomSanitizer} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {mockInitialState, State} from '../../../state';
import {provideMockStore} from '@ngrx/store/testing';
import {setVideoProgress} from '../../../state/courses/actions';
import {environment} from '../../../../environments/environment';
import {FormsModule} from '@angular/forms';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {userSetPlaybackRate} from '../../../state/user/actions';
import {convertSecondsToTimeString} from '../../helpers';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {CommonModule} from '@angular/common';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';


//matcher to determine if an emitted timestamp is current
const isCurrentTimestamp = (currentTime: number, variance?: number) => ({
	asymmetricMatch: compareTo => Math.abs(currentTime - compareTo) < (variance || 1000),
	jasmineToString: () => `<isCurrentTimestamp: ${currentTime}>`
});



describe('AudioPlayerComponent', () => {
	let component: AudioPlayerComponent;
	let fixture: ComponentFixture<AudioPlayerComponent>;

	let sanitizer: DomSanitizer;
	let store: Store<State>;
	// let changeRef: ChangeDetectorRef;
	let http: HttpTestingController;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [AudioPlayerComponent],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			],
			imports: [
				CommonModule,
				FormsModule,
				ButtonsModule,
				HttpClientTestingModule,
				FontAwesomeTestingModule
			]
		})
			.compileComponents();

		sanitizer = TestBed.inject(DomSanitizer);
		store = TestBed.inject(Store);
		// changeRef = TestBed.inject(ChangeDetectorRef);
		http = TestBed.inject(HttpTestingController);
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AudioPlayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		//set up component properties
		component.contentItem = {system_id: 'sid'} as any;
		component.multimedia = {id: 'mmid', soundcloud_track_id: 'sti', soundcloud_track_secret_token: 'sst'} as any;
		component.courseId = 'cid';

		mockWaveSurferObj.on.mockReset();
		mockWaveSurferObj.load.mockReset();
		mockWaveSurferObj.setPlaybackRate.mockReset();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	const getSimpleChange = (current, prev) => ({
		currentValue: current,
		previousValue: prev,
		firstChange: false,
		isFirstChange: () => false,
	});

	it('should handle call initializeAudio when track changes', () => {
		jest.spyOn(component, 'initializeAudio');
		component.courseId = 'te';
		component.multimedia.audio_download_filename = 'asdf';
		component.multimedia.title = 'asdf';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				title: 88,
			},
			{
				title: 99,
			})
		});
		expect(component.initializeAudio).toHaveBeenCalled();
	});

	it('should seekTo position when audioStartPosition (duration form multimedia)', async () => {
		jest.spyOn(component, 'initializeAudio').mockImplementation();
		jest.spyOn(component, 'waitForElementAndInitAudio').mockImplementation(() => {});
		const wavesurfer = {seekTo: jest.fn(), getDuration: jest.fn(() => 1)};
		component.waveFormPromise = Promise.resolve(wavesurfer);

		component.audioStartPosition = 12;
		component.multimedia = {duration: 24, audio_download_filename: '123', title: '123', id: '12'};
		component.ngOnChanges({
			multimedia: getSimpleChange(
				component.multimedia,
				{
					title: '123',
					id: 'vid',
				},
			),
			trackProgress: getSimpleChange(true, true),
			audioStartPosition: getSimpleChange(12, null),
		});
		await Promise.resolve();
		expect(component.initializeAudio).not.toHaveBeenCalled();
		expect(component.waitForElementAndInitAudio).not.toHaveBeenCalled();
		expect(wavesurfer.seekTo).toHaveBeenCalledWith(0.5);
	});

	it('should seekTo position when audioStartPosition (position > duration)', async () => {
		jest.spyOn(component, 'initializeAudio').mockImplementation();
		jest.spyOn(component, 'waitForElementAndInitAudio').mockImplementation(() => {});
		const wavesurfer = {seekTo: jest.fn(), getDuration: jest.fn(() => 1)};
		component.waveFormPromise = Promise.resolve(wavesurfer);

		component.audioStartPosition = 12;
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			{
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			),
			trackProgress: getSimpleChange(true, true),
			audioStartPosition: getSimpleChange(12, null),
		});
		await Promise.resolve();
		expect(component.initializeAudio).not.toHaveBeenCalled();
		expect(component.waitForElementAndInitAudio).not.toHaveBeenCalled();
		expect(wavesurfer.seekTo).toHaveBeenCalledWith(0);
	});

	it('should seekTo position when audioStartPosition (using player duration)', async () => {
		jest.spyOn(component, 'initializeAudio').mockImplementation();
		jest.spyOn(component, 'waitForElementAndInitAudio').mockImplementation(() => {});
		const wavesurfer = {seekTo: jest.fn(), getDuration: jest.fn(() => 15)};
		component.waveFormPromise = Promise.resolve(wavesurfer);

		component.audioStartPosition = 12;
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			{
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			),
			trackProgress: getSimpleChange(true, true),
			audioStartPosition: getSimpleChange(12, null),
		});
		await Promise.resolve();
		expect(component.initializeAudio).not.toHaveBeenCalled();
		expect(component.waitForElementAndInitAudio).not.toHaveBeenCalled();
		expect(wavesurfer.seekTo).toHaveBeenCalledWith(0.8);
	});


	//TODO why???
	it('should take no action when tracking stops', () => {
		jest.spyOn(component, 'initializeAudio').mockImplementation();
		jest.spyOn(component, 'waitForElementAndInitAudio').mockImplementation(() => {});
		//@ts-ignore allow me to access private method!
		const destroySpy = jest.spyOn(component, 'destroyAudioPlayer');

		component.courseId = 'fa';
		component.multimedia.audio_download_filename = 'sdf';
		component.multimedia.title = 'sdf';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			{
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			),
			trackProgress: getSimpleChange(false, true),
			trackProgressVideoId: getSimpleChange('vid', 'vid'),
		});
		expect(component.initializeAudio).not.toHaveBeenCalled();
		expect(component.waitForElementAndInitAudio).not.toHaveBeenCalled();
		expect(destroySpy).not.toHaveBeenCalled();
	});

	it('should reinit when course and download filename change', () => {
		const reinitCalled = jest.spyOn(component, 'initializeAudio').mockResolvedValue();

		component.courseId = 'cid';
		component.multimedia.audio_download_filename = 'new';
		component.multimedia.title = 'new';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 'new',
				title: 'new',
			},
			{
				audio_download_filename: 'old',
				title: 'old',
			},
			),
			courseId: getSimpleChange('cid', ''),
		});
		expect(reinitCalled).toHaveBeenCalled();
	});
	it('should not reinit when no course and download filename change', () => {
		const reinitCalled = jest.spyOn(component, 'initializeAudio').mockResolvedValue();

		component.courseId = 'cid';
		component.multimedia.audio_download_filename = 'new';
		component.multimedia.title = 'new';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 'same',
				title: 'same',
			},
			{
				audio_download_filename: 'same',
				title: 'same',
			},
			),
			courseId: getSimpleChange('same', 'same'),
		});
		expect(reinitCalled).not.toHaveBeenCalled();
	});
	it('should not reinit when course changes but component download filename is falsey', () => {
		const reinitCalled = jest.spyOn(component, 'initializeAudio').mockResolvedValue();

		component.courseId = 'cid';
		component.multimedia.audio_download_filename = null;
		component.multimedia.title = null;
		component.ngOnChanges({
			courseId: getSimpleChange('cid', ''),
		});
		expect(reinitCalled).not.toHaveBeenCalled();
	});
	it('should reinit when course changes and component download filename is truthy', () => {
		const reinitCalled = jest.spyOn(component, 'initializeAudio').mockResolvedValue();

		component.courseId = 'cid';
		component.multimedia.audio_download_filename = 'new';
		component.multimedia.title = 'new';
		component.ngOnChanges({
			courseId: getSimpleChange('cid', ''),
		});
		expect(reinitCalled).toHaveBeenCalled();
	});
	it('should not reinit when course is falsey but download filename is truthy', () => {
		const reinitCalled = jest.spyOn(component, 'initializeAudio').mockResolvedValue();

		component.courseId = null;
		component.multimedia.audio_download_filename = 'sdf2';
		component.multimedia.title = 'sdf2';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 'new',
				title: 'new',
			},
			{
				audio_download_filename: 'old',
				title: 'old',
			},
			),
			courseId: getSimpleChange('', 'e'),
		});
		expect(reinitCalled).not.toHaveBeenCalled();
	});
	it('should not reinit when course is falsey but download filename is truthy (2)', () => {
		const reinitCalled = jest.spyOn(component, 'initializeAudio').mockResolvedValue();

		component.courseId = null;
		component.multimedia.audio_download_filename = 'sdf2';
		component.multimedia.title = 'sdf2';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 'new',
				title: 'new',
			},
			{
				audio_download_filename: 'old',
				title: 'old',
			},
			),
		});
		expect(reinitCalled).not.toHaveBeenCalled();
	});
	it('should reinit when course component is truthy but download filename is truthy', () => {
		const reinitCalled = jest.spyOn(component, 'initializeAudio').mockResolvedValue();

		component.courseId = 'cid';
		component.multimedia.audio_download_filename = 'sdf2';
		component.multimedia.title = 'sdf2';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 'new',
				title: 'new',
			},
			{
				audio_download_filename: 'old',
				title: 'old',
			},
			),
		});
		expect(reinitCalled).toHaveBeenCalled();
	});

	it('should do nothing when no relevant change', () => {
		jest.spyOn(component, 'initializeAudio').mockImplementation();
		jest.spyOn(component, 'waitForElementAndInitAudio').mockImplementation(() => {});
		const wavesurfer = {seekTo: jest.fn()};

		component.waveFormPromise = Promise.resolve(wavesurfer);

		component.courseId = 'cid';
		component.multimedia.audio_download_filename = 'a';
		component.multimedia.title = 'a';
		component.ngOnChanges({
			multimedia: getSimpleChange({
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			{
				audio_download_filename: 88,
				title: 88,
				id: 'vid',
			},
			),
			trackProgress: getSimpleChange(true, true),
		});
		expect(component.initializeAudio).not.toHaveBeenCalled();
		expect(component.waitForElementAndInitAudio).not.toHaveBeenCalled();
		expect(wavesurfer.seekTo).not.toHaveBeenCalled();
	});

	const setupStreamUrlSpies = (downloadSetupResult: string, seconds = 42) => {
		component.multimedia = getMockMultimediaItem({id: '123', audio_download_filename: downloadSetupResult ?? 'test', title: downloadSetupResult ?? 'test', duration: seconds});
		component.courseId = 'course';

		const bypassSpy = jest.spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').mockImplementation(() => 12);
		const initSpy = jest.spyOn(component, 'waitForElementAndInitAudio').mockImplementation(() => {});
		const destroySpy = jest.spyOn(component, 'destroyAudioPlayer').mockResolvedValue();

		return {bypassSpy, initSpy, destroySpy};
	};


	it('initializeAudio should do nothing if no multimedia', async () => {
		const {bypassSpy, initSpy, destroySpy} = setupStreamUrlSpies('12');
		component.multimedia = null;
		await component.initializeAudio();

		expect(component.downloadSrcUrlRaw).toBeUndefined();
		// expect(setupUrlSpy).toHaveBeenCalled();
		expect(bypassSpy).not.toHaveBeenCalled();
		expect(component.trackLength).toBe('0:00');
		expect(initSpy).not.toHaveBeenCalled();
		expect(destroySpy).not.toHaveBeenCalled();
	});
	it('initializeAudio should init everything if valid multimedia', async () => {
		const {bypassSpy, initSpy, destroySpy} = setupStreamUrlSpies('12');
		await component.initializeAudio();

		const rawUrl = `${environment.staticFileRootUrl}a/${component.courseId}/12.mp3`;

		expect(component.downloadSrcUrlRaw).toBe(rawUrl);
		// expect(setupUrlSpy).toHaveBeenCalled();
		expect(bypassSpy).toHaveBeenCalledWith(
			rawUrl
		);
		expect(component.trackLength).toBe('00:42');
		expect(initSpy).toHaveBeenCalled();
		expect(component.downloadName).toBe('');
		expect(destroySpy).toHaveBeenCalled();
	});
	it('initializeAudio should init everything (except duration) if valid multimedia (no duration)', async () => {
		const {bypassSpy, initSpy, destroySpy} = setupStreamUrlSpies('12');
		component.multimedia.duration = null;
		await component.initializeAudio();

		const rawUrl = `${environment.staticFileRootUrl}a/${component.courseId}/12.mp3`;

		expect(component.downloadSrcUrlRaw).toBe(rawUrl);
		// expect(setupUrlSpy).toHaveBeenCalled();
		expect(bypassSpy).toHaveBeenCalledWith(
			rawUrl
		);
		expect(component.trackLength).toBe('0:00');
		expect(initSpy).toHaveBeenCalled();
		expect(component.downloadName).toBe('');
		expect(destroySpy).toHaveBeenCalled();
	});
	it('initializeAudio should init everything (with name) if valid multimedia and content item', async () => {
		const {bypassSpy, initSpy, destroySpy} = setupStreamUrlSpies('12');
		component.contentItem = {title: 'Stuff'} as any;
		await component.initializeAudio();

		const rawUrl = `${environment.staticFileRootUrl}a/${component.courseId}/12.mp3`;

		expect(component.downloadSrcUrlRaw).toBe(rawUrl);
		// expect(setupUrlSpy).toHaveBeenCalled();
		expect(bypassSpy).toHaveBeenCalledWith(
			rawUrl
		);
		expect(component.trackLength).toBe('00:42');
		expect(initSpy).toHaveBeenCalled();
		expect(component.downloadName).toBe('Stuff.mp3');
		expect(destroySpy).toHaveBeenCalled();
	});

	it('should emit download URL on download', () => {
		const downloadURL = 'https://qwer.ty';
		component.downloadSrcUrlRaw = downloadURL;
		const spy = jest.spyOn(component.audioDownloaded, 'emit').mockImplementation(() => {});

		component.onAudioDownload();

		// expect(component.audioDownloaded).toHaveBeenCalledWith(downloadURL);
		expect(spy).toHaveBeenCalledWith(downloadURL);
	});


	it('waitForElementAndInitAudio should bail if already running', () => {

		const setSpy = jest.fn(); //createSpy('set playerIsLoading');
		Object.defineProperty(component, 'soundCloudIsLoading', {
			get: () => true,
			set: setSpy
		});

		component.waitForElementAndInitAudio();

		expect(setSpy).not.toHaveBeenCalled();
	});


	const setupInitializeAudioMocks = () => {
		// @ts-ignore won't allow access to private method
		return jest.spyOn(component, 'initializeAudioPlayer').mockImplementation(() => {
		});
	};

	it('waitForElementAndInitAudio should wait for element to create to initialize SoundCloudWidget', fakeAsync(() => {
		const initFunc = setupInitializeAudioMocks();

		expect(component.playerIsLoading).toBe(false);
		component.waitForElementAndInitAudio();
		expect(component.playerIsLoading).toBe(true);

		tick(600);
		expect(initFunc).not.toHaveBeenCalled();

		component.waveformRef = {nativeElement: 42} as any;

		tick(500);
		expect(initFunc).toHaveBeenCalled();
	}));

	it('waitForElementAndInitAudio should timeout if native element never materializes', fakeAsync(() => {
		const initFunc = setupInitializeAudioMocks();

		expect(component.playerIsLoading).toBe(false);
		component.waitForElementAndInitAudio();
		expect(component.playerIsLoading).toBe(true);

		tick(6000);
		// expect(widgetConst).not.toHaveBeenCalled();
		expect(initFunc).not.toHaveBeenCalled();
	}));

	it.todo('verify startPosition is not used if time is manually set');

	it('initializeAudioPlayer should construct WaveSurfer an subscribe to events', async () => {


		const markForCheckSpy = jest.spyOn(component['ref'], 'markForCheck');
		jest.spyOn(component, 'getWaveFormData').mockResolvedValue([1]);

		component.downloadSrcUrlRaw = 'test.mp3';
		component.multimedia.id = 'face';

		component['initializeAudioPlayer']();
		expect(MockWavesurfer.create).toHaveBeenCalledWith({
			container: '#waveform-face',
			progressColor: '#0070b9',
			waveColor: '#7d7d7d',
			backend: 'MediaElement',
			height: 50,
			barHeight: 3,
			barWidth: 2,
			responsive: true,
			plugins: expect.any(Array),
		});

		expect(mockWaveSurferObj.on).toHaveBeenCalledTimes(2);

		const readyCall = mockWaveSurferObj.on.mock.calls[0];
		const progressCall = mockWaveSurferObj.on.mock.calls[1];

		expect(readyCall).toEqual([
			'ready',
			expect.any(Function)
		]);
		expect(progressCall).toEqual([
			'audioprocess',
			expect.any(Function)
		]);

		expect(component.getWaveFormData).toHaveBeenCalled();
		expect(mockWaveSurferObj.load).not.toHaveBeenCalled();

		await Promise.resolve();
		expect(mockWaveSurferObj.load).toHaveBeenCalledWith('test.mp3?ngsw-bypass=1', [1], 'metadata');

		//validate that triggering the on functions works
		mockWaveSurferObj.getDuration.mockImplementationOnce(() => 142);
		component.multimedia.duration = 142;
		component.playbackRate = 3;
		component.audioStartPosition = 88;

		readyCall[1]();
		await component.waveFormPromise;
		expect(mockWaveSurferObj.getDuration).toHaveBeenCalled();
		expect(component.trackLength).toBe('02:22');
		expect(mockWaveSurferObj.setPlaybackRate).toHaveBeenCalledWith(3);
		expect(mockWaveSurferObj.seekTo).toHaveBeenCalledWith(88 / 142);
		expect(component.currentTime).toBe('01:28');
		expect(markForCheckSpy).toHaveBeenCalled();



		//progress tracking
		const progressHandler = progressCall[1];
		// @ts-ignore won't allow access to private method
		const dispatch = jest.spyOn(component, 'dispatchProgress');
		markForCheckSpy.mockReset();

		function runProgTest(progVal: number, shouldPass: boolean) {
			progressHandler(progVal);
			if (shouldPass) {
				expect(dispatch).toHaveBeenCalledWith(progVal);
				expect(markForCheckSpy).toHaveBeenCalled();
				expect(component.currentTime).toBe(convertSecondsToTimeString(progVal));
			} else {
				expect(dispatch).not.toHaveBeenCalled();
				expect(markForCheckSpy).not.toHaveBeenCalled();
			}
			dispatch.mockReset();
			markForCheckSpy.mockReset();
		}

		runProgTest(.12, false);
		runProgTest(.99, false);
		runProgTest(13, true);
		runProgTest(13.2, false);
		runProgTest(15.13, true);
		runProgTest(1513, true);
		runProgTest(1513.9, false);
		runProgTest(1514, true);
	});

	it('initializeAudioPlayer should load with no data if getWaveFormData returns empty', async () => {
		mockWaveSurferObj.on.mockReset();
		mockWaveSurferObj.load.mockReset();

		jest.spyOn(component, 'getWaveFormData').mockResolvedValue([]);

		component.downloadSrcUrlRaw = 'test.mp3';
		component.multimedia.id = 'face';

		component['initializeAudioPlayer']();
		expect(MockWavesurfer.create).toHaveBeenCalled();

		expect(component.getWaveFormData).toHaveBeenCalled();
		expect(mockWaveSurferObj.load).not.toHaveBeenCalled();

		await Promise.resolve();
		expect(mockWaveSurferObj.load).toHaveBeenCalledWith('test.mp3?ngsw-bypass=1');
	});

	it('getWaveFormData should get valid waveform info', async () => {

		component.downloadSrcUrlRaw = 'http://test.com/face.mp3';

		let testProm = component.getWaveFormData();
		let testRes = http.expectOne('http://test.com/face.json');
		testRes.flush({data: [1]});
		expect(await testProm).toEqual([1]);

		testProm = component.getWaveFormData();
		testRes = http.expectOne('http://test.com/face.json');
		testRes.error(new ErrorEvent('network_error'));
		expect(await testProm).toEqual([]);
	});

	it('setPlaybackRate should dispatch value to store', async () => {
		jest.spyOn(store, 'dispatch');
		const waveform = {setPlaybackRate: jest.fn()};
		component.waveFormPromise = Promise.resolve(waveform);

		await component.setPlaybackRate(77);
		expect(waveform.setPlaybackRate).toHaveBeenCalledWith(.77);
		expect(store.dispatch).toHaveBeenCalledWith(userSetPlaybackRate({rate: .77}));
		expect(component.playbackRate).toBe(.77);

		await component.setPlaybackRate(.77);
		expect(waveform.setPlaybackRate).toHaveBeenCalledWith(.77);
		expect(store.dispatch).toHaveBeenCalledWith(userSetPlaybackRate({rate: .77}));
		expect(component.playbackRate).toBe(.77);

		await component.setPlaybackRate(150);
		expect(waveform.setPlaybackRate).toHaveBeenCalledWith(1.5);
		expect(store.dispatch).toHaveBeenCalledWith(userSetPlaybackRate({rate: 1.5}));
		expect(component.playbackRate).toBe(1.5);

		await component.setPlaybackRate(1.5);
		expect(waveform.setPlaybackRate).toHaveBeenCalledWith(1.5);
		expect(store.dispatch).toHaveBeenCalledWith(userSetPlaybackRate({rate: 1.5}));
		expect(component.playbackRate).toBe(1.5);

		await component.setPlaybackRate(200);
		expect(waveform.setPlaybackRate).toHaveBeenCalledWith(2);
		expect(store.dispatch).toHaveBeenCalledWith(userSetPlaybackRate({rate: 2}));
		expect(component.playbackRate).toBe(2);

		await component.setPlaybackRate(2);
		expect(waveform.setPlaybackRate).toHaveBeenCalledWith(2);
		expect(store.dispatch).toHaveBeenCalledWith(userSetPlaybackRate({rate: 2}));
		expect(component.playbackRate).toBe(2);

		await component.setPlaybackRate(201);
		expect(waveform.setPlaybackRate).toHaveBeenCalledWith(1);
		expect(store.dispatch).toHaveBeenCalledWith(userSetPlaybackRate({rate: 1}));
		expect(component.playbackRate).toBe(1);
	});
	it('setPlaybackRate should handle no player cleanly', async () => {
		component.waveFormPromise = Promise.resolve();
		await component.setPlaybackRate(77);
		expect(1).toBeTruthy();
	});

	it('skipBackward10 should move forward', async () => {
		jest.spyOn(component, 'closePopovers');
		const waveform = {skip: jest.fn()};
		component.waveFormPromise = Promise.resolve(waveform);
		await component.skipBackward10();
		expect(waveform.skip).toHaveBeenCalledWith(-10);
		expect(component.closePopovers).toHaveBeenCalled();
	});
	it('skipBackward10 should handle no player cleanly', async () => {
		jest.spyOn(component, 'closePopovers');
		component.waveFormPromise = Promise.resolve();
		await component.skipBackward10();
		expect(component.closePopovers).toHaveBeenCalled();
	});

	it('skipForward10 should move forward', async () => {
		jest.spyOn(component, 'closePopovers');
		const waveform = {skip: jest.fn()};
		component.waveFormPromise = Promise.resolve(waveform);
		await component.skipForward10();
		expect(waveform.skip).toHaveBeenCalledWith(10);
		expect(component.closePopovers).toHaveBeenCalled();
	});
	it('skipForward10 should handle no player cleanly', async () => {
		jest.spyOn(component, 'closePopovers');
		component.waveFormPromise = Promise.resolve();
		await component.skipForward10();
		expect(component.closePopovers).toHaveBeenCalled();
	});

	it('playToggle should toggle play status', async () => {
		const wavesurfer = {play: jest.fn(), pause: jest.fn()};
		component.waveFormPromise = Promise.resolve(wavesurfer);
		jest.spyOn(component, 'closePopovers').mockImplementation(() => {});
		component.playing = false;

		async function runAndTest(isPlaying, playCalls, pauseCalls, closeCalls) {
			await component.playToggle();
			expect(component.playing).toBe(isPlaying);
			expect(wavesurfer.play).toHaveBeenCalledTimes(playCalls);
			expect(wavesurfer.pause).toHaveBeenCalledTimes(pauseCalls);
			expect(component.closePopovers).toHaveBeenCalledTimes(closeCalls);
		}

		await runAndTest(true, 1, 0, 1);
		await runAndTest(false, 1, 1, 2);
		await runAndTest(true, 2, 1, 3);
		await runAndTest(false, 2, 2, 4);
	});
	it('pause should set player to paused', async () => {
		const wavesurfer = {play: jest.fn(), pause: jest.fn()};
		component.waveFormPromise = Promise.resolve(wavesurfer);
		jest.spyOn(component, 'closePopovers').mockImplementation(() => {});
		component.playing = true;

		async function runAndTest(pauseCalls, closeCalls) {
			await component.pause();
			expect(component.playing).toBe(false);
			expect(wavesurfer.play).toHaveBeenCalledTimes(0);
			expect(wavesurfer.pause).toHaveBeenCalledTimes(pauseCalls);
			expect(component.closePopovers).toHaveBeenCalledTimes(closeCalls);
		}

		await runAndTest(1, 1);
		await runAndTest(1, 2);
		await runAndTest(1, 3);
	});
	it('play should set player to played', async () => {
		const wavesurfer = {play: jest.fn(), pause: jest.fn()};
		component.waveFormPromise = Promise.resolve(wavesurfer);
		jest.spyOn(component, 'closePopovers').mockImplementation(() => {});
		component.playing = false;

		async function runAndTest(playCalls, closeCalls) {
			await component.play();
			expect(component.playing).toBe(true);
			expect(wavesurfer.play).toHaveBeenCalledTimes(playCalls);
			expect(wavesurfer.pause).toHaveBeenCalledTimes(0);
			expect(component.closePopovers).toHaveBeenCalledTimes(closeCalls);
		}

		await runAndTest(1, 1);
		await runAndTest(1, 2);
		await runAndTest(1, 3);
	});
	it('playToggle should handle no player cleanly', async () => {
		component.waveFormPromise = Promise.resolve();
		jest.spyOn(component, 'closePopovers').mockImplementation(() => {});
		component.playing = false;
		await component.playToggle();
		expect(component.playing).toBe(false);
		expect(component.closePopovers).not.toHaveBeenCalled();
	});

	it('movePlaybackSpeed should increment the speed each time it is clicked (resetting at 2)', () => {
		jest.spyOn(component, 'setPlaybackRate').mockImplementation(() => Promise.resolve());

		component.playbackRate = 1;
		component.movePlaybackSpeed();
		expect(component.setPlaybackRate).toHaveBeenCalledWith(1.5);

		component.playbackRate = 1.2;
		component.movePlaybackSpeed();
		expect(component.setPlaybackRate).toHaveBeenCalledWith(1.5);

		component.playbackRate = 1.5;
		component.movePlaybackSpeed();
		expect(component.setPlaybackRate).toHaveBeenCalledWith(2);

		component.playbackRate = 1.7;
		component.movePlaybackSpeed();
		expect(component.setPlaybackRate).toHaveBeenCalledWith(2);

		component.playbackRate = 2;
		component.movePlaybackSpeed();
		expect(component.setPlaybackRate).toHaveBeenCalledWith(0.5);

		component.playbackRate = 0.5;
		component.movePlaybackSpeed();
		expect(component.setPlaybackRate).toHaveBeenCalledWith(1);

		component.playbackRate = 0.7;
		component.movePlaybackSpeed();
		expect(component.setPlaybackRate).toHaveBeenCalledWith(1);
	});

	it('getBackgroundStyles should use poster_url if available', () => {
		component.multimedia = {id: '1', poster_url: 'face'} as any;
		expect(component.getBackgroundStyles()).toEqual({
			'background-image': 'url(face)',
		});
	});
	it('getBackgroundStyles should fallback to Hillsdale logo if no poster_url is available', () => {
		component.multimedia = {id: '1', poster_url: null} as any;
		expect(component.getBackgroundStyles()).toEqual({
			'background-image': 'url(https://online.hillsdale.edu/assets/hillsdale-college-logo-white.svg)',
			'background-size': 'contain',
			'background-repeat': 'no-repeat',
		});
	});


	it('destroyAudioPlayer should get promise and close everything', async () => {
		const wavesurfer = {unAll: jest.fn(), destroy: jest.fn() };
		const initProm = Promise.resolve(wavesurfer);
		component.waveFormPromise = initProm;

		component.destroyAudioPlayer();
		await Promise.resolve();

		expect(wavesurfer.unAll).toHaveBeenCalled();
		expect(wavesurfer.destroy).toHaveBeenCalled();
		expect(component.waveFormPromise).not.toBe(initProm);
		expect(component.playing).toBe(false);
		expect(component.currentTime).toBe('0:00');
		expect(component.trackLength).toBe('0:00');
	});
	it('destroyAudioPlayer should get promise and do nothing if no wavesurfer', async () => {
		const initProm = Promise.resolve();
		component.waveFormPromise = initProm;

		component.destroyAudioPlayer();
		await Promise.resolve();

		expect(component.waveFormPromise).toBe(initProm);
	});

	it('changeVolume should toggle play status', async () => {
		const waveform = {setVolume: jest.fn()};
		component.waveFormPromise = Promise.resolve(waveform);

		await component.changeVolume({target: {value: 42}} as any);
		expect(waveform.setVolume).toHaveBeenCalledWith(0.42);

		await component.changeVolume({target: {value: 100}} as any);
		expect(waveform.setVolume).toHaveBeenCalledWith(1);
	});
	it('changeVolume should handle garbage events cleanly', async () => {
		const waveform = {setVolume: jest.fn()};
		component.waveFormPromise = Promise.resolve(waveform);

		await component.changeVolume({target: {value: '42'}} as any);
		expect(waveform.setVolume).toHaveBeenCalledWith(0.42);

		waveform.setVolume.mockReset();
		await component.changeVolume({target: {value: 1001}} as any);
		expect(waveform.setVolume).not.toHaveBeenCalled();

		waveform.setVolume.mockReset();
		await component.changeVolume({target: {value: -1}} as any);
		expect(waveform.setVolume).not.toHaveBeenCalled();

		waveform.setVolume.mockReset();
		await component.changeVolume({target: {value: 'as'}} as any);
		expect(waveform.setVolume).not.toHaveBeenCalled();

		waveform.setVolume.mockReset();
		await component.changeVolume({target: {value: null}} as any);
		expect(waveform.setVolume).not.toHaveBeenCalled();

		waveform.setVolume.mockReset();
		await component.changeVolume({target: {}} as any);
		expect(waveform.setVolume).not.toHaveBeenCalled();

		waveform.setVolume.mockReset();
		await component.changeVolume({} as any);
		expect(waveform.setVolume).not.toHaveBeenCalled();

		waveform.setVolume.mockReset();
		await component.changeVolume(null);
		expect(waveform.setVolume).not.toHaveBeenCalled();
	});
	it('changeVolume should handle no player cleanly', async () => {
		component.waveFormPromise = Promise.resolve();

		await component.changeVolume({target: {value: 42}} as any);
		expect(1).toBeTruthy();
	});

	it('toggleVolume should open/close the volume meter', () => {
		const expectVal = expected => {
			component.toggleVolume();
			expect(component.showVolumeSlider).toBe(expected);
			expect(component.showSettings).toBe(false);
		};
		component.showVolumeSlider = false;
		component.showSettings = true;
		expectVal(true);

		expectVal(false);
		expectVal(true);
	});
	it('toggleSettings should open/close the settings pane', () => {
		const expectVal = expected => {
			component.toggleSettings();
			expect(component.showVolumeSlider).toBe(false);
			expect(component.showSettings).toBe(expected);
		};
		component.showVolumeSlider = true;
		component.showSettings = false;
		expectVal(true);

		expectVal(false);
		expectVal(true);
	});

	it('closePopovers should close any popovers', () => {
		const expectClosed = () => {
			component.closePopovers();
			expect(component.showSettings).toBe(false);
			expect(component.showVolumeSlider).toBe(false);
		};

		component.showSettings = true;
		component.showVolumeSlider = false;
		expectClosed();

		component.showSettings = false;
		component.showVolumeSlider = true;
		expectClosed();

		component.showSettings = true;
		component.showVolumeSlider = true;
		expectClosed();

		component.showSettings = true;
		component.showVolumeSlider = true;
		expectClosed();
	});

	const validateProgressDispatch = (progressAmt: number) => {
		jest.spyOn(store, 'dispatch');

		component.trackProgress = true;


		component['dispatchProgress'](progressAmt);

		expect(store.dispatch).toHaveBeenCalledWith({
			videoId: component.multimedia.id,
			progress: progressAmt,
			contentId: component.contentItem.system_id,
			courseId: component.courseId,
			eventTime: isCurrentTimestamp(Date.now()),
			type: setVideoProgress.type,
			lectureType: undefined,
			userId: null
		});
	};

	const validateNonProgressDispatch = progressAmt => {
		jest.spyOn(store, 'dispatch');

		component.trackProgress = false;


		component['dispatchProgress'](progressAmt);
		expect(store.dispatch).not.toHaveBeenCalled();
	};


	it('should dispatch setVideoProgress event on dispatchProgress (1%)', () => {
		validateProgressDispatch(1);
	});
	it('should dispatch setVideoProgress event on dispatchProgress (12%)', () => {
		validateProgressDispatch(12);
	});
	it('should dispatch setVideoProgress event on dispatchProgress (100%)', () => {
		validateProgressDispatch(100);
	});

	it('should not dispatch setVideoProgress event on dispatchProgress less than 1 (0%)', () => {
		validateNonProgressDispatch(0);
	});
	it('should not dispatch setVideoProgress event on dispatchProgress less than 1 (0.99%)', () => {
		validateNonProgressDispatch(0.99);
	});
	it('should not dispatch setVideoProgress event on dispatchProgress less than 1 (-100%)', () => {
		validateNonProgressDispatch(-100);
	});

	it('onAudioDownload should be called on download click', () => {
		const downloadSource = 'test';
		component.downloadSrcUrlRaw = downloadSource;
		component.downloadSrcUrl = sanitizer.bypassSecurityTrustResourceUrl(downloadSource);
		component.multimedia = {
			title: downloadSource,
			audio_download_filename: downloadSource,
			id: '1'
		} as any;

		jest.spyOn(component, 'onAudioDownload').mockImplementation(() => false);
		fixture.detectChanges();

		fixture.nativeElement?.querySelector('.audio-player .download-audio')?.click();


		expect(component.onAudioDownload).toHaveBeenCalled();
	});


	it('should render nothing if no downloadAudioSrc', () => {
		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});
	it('should render normally if sources provided', () => {
		component.multimedia.audio_download_filename = 'sf';
		component.multimedia.title = 'sf';

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});
	it('should render error message if failed', () => {
		component.multimedia.audio_download_filename = 'sf';
		component.multimedia.title = 'sf';
		component.loadFailed = true;

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});
});
