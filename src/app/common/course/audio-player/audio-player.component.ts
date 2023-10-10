import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {CourseLecture, SupplementalVideo} from '../../../services/course-data.service';
import {MultimediaItem} from 'hc-video-player';
import {DomSanitizer} from '@angular/platform-browser';
import {select, Store} from '@ngrx/store';
import {State} from '../../../state';
import {setVideoProgress, VideoPostInfo} from '../../../state/courses/actions';

import {get} from 'lodash';
import {interval, of} from 'rxjs';
import {catchError, delay, filter, map, take, tap, timeout} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';

import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js';
import {convertSecondsToTimeString} from '../../helpers';
import {userSetPlaybackRate} from '../../../state/user/actions';
import {selectCurrentUserPlaybackRate} from '../../../state/user/selectors';
import {HttpClient} from '@angular/common/http';
import { SUPPORT_EMAIL } from '../../constants';
import { faCog, faDownload, faPause, faPlay, faSpinner, faVolumeUp } from '@fortawesome/free-solid-svg-icons';


@Component({
	selector: 'app-audio-player',
	templateUrl: './audio-player.component.html',
	styleUrls: ['./audio-player.component.less']
})
export class AudioPlayerComponent implements OnChanges, OnDestroy {

	constructor(
		public domSanitizer: DomSanitizer, private store: Store<State>,
		private ref: ChangeDetectorRef, private http: HttpClient) { }

	@Output()
		audioDownloaded = new EventEmitter();

	@Input()
		title: string = null;

	@Input()
		audioStartPosition: number; //requires watch

	@Input()
		courseId: string;
	@Input()
		multimedia: MultimediaItem; //requires watch
	@Input()
		contentItem: CourseLecture|SupplementalVideo; //requires watch

	@Input()
		trackProgress = false; //requires watch

	faCog = faCog;
	faDownload = faDownload;
	faPause = faPause;
	faPlay = faPlay;
	faSpinner = faSpinner;
	faVolumeUp = faVolumeUp;

	public downloadSrcUrl;
	public downloadSrcUrlRaw;
	public downloadName = '';

	@ViewChild('waveform')
		waveformRef: ElementRef;

	playerIsLoading = false;

	playing = false;
	currentTime = '0:00';
	trackLength = '0:00';
	playbackRate = 1;

	timeIsManuallySet = false;

	loadFailed = false;

	waveFormPromise: Promise<WaveSurfer|undefined> = Promise.resolve();

	userPlaybackRateSub = this.store.pipe(select(selectCurrentUserPlaybackRate)).subscribe(r => {
		// console.log('got rate', r);
		this.playbackRate = r;
		this.setPlaybackRate(r);
	});

	showVolumeSlider = false;
	showSettings = false;

	availableRates = [2, 1.5, 1, 0.5];

	supportEmail = SUPPORT_EMAIL;

	ngOnChanges(changes: SimpleChanges) {
		const curTrackId = get(changes, 'multimedia.currentValue.title');
		const prevTrackId = get(changes, 'multimedia.previousValue.title');
		const newCourseId = get(changes, 'courseId.currentValue');
		const oldCourseId = get(changes, 'courseId.previousValue');

		const changeToTrackId = curTrackId !== prevTrackId;
		const changeToCourseId = newCourseId !== oldCourseId;

		//if we have adequate data to initialize (and this is a change for one of the parts)
		if (this.courseId && this.multimedia.title && (changeToTrackId || changeToCourseId)) {
			this.initializeAudio().then();
		} else {
			const changeToAudioPosition = !!get(changes, 'audioStartPosition.currentValue') && !get(changes, 'audioStartPosition.previousValue');

			if (changeToAudioPosition && !this.timeIsManuallySet) {
				this.waveFormPromise.then((r: WaveSurfer) => {
					if (r) {
						const duration = this.multimedia?.duration ? this.multimedia.duration : r.getDuration();
						r.seekTo(this.audioStartPosition < duration ? this.audioStartPosition / duration : 0);
					}
				});
			}
		}
	}

	ngOnDestroy() {
		this.destroyAudioPlayer();
		if (this.userPlaybackRateSub && !this.userPlaybackRateSub.closed) {
			this.userPlaybackRateSub.unsubscribe();
			this.userPlaybackRateSub = null;
		}
	}

	async initializeAudio() {
		if (!this.multimedia) return;

		//clear out any previous version that might exist
		await this.destroyAudioPlayer();

		if (this.multimedia.duration) {
			this.trackLength = convertSecondsToTimeString(this.multimedia.duration);
		}

		this.setUpDownloadUrl();

		if (this.downloadSrcUrlRaw) {
			this.waitForElementAndInitAudio();
		}
	}

	private setUpDownloadUrl() {
		//if we don't have enough properties to generate a valid download URL, just set it to null
		if (!!this.multimedia?.title && !!this.courseId) {
			const audio_file_name = this.multimedia.title.substring(this.multimedia.title.lastIndexOf('_', this.multimedia.title.lastIndexOf('_') - 1) + 1);
			this.downloadSrcUrlRaw = `${environment.staticFileRootUrl}a/${this.courseId}/${audio_file_name}.mp3`;
			this.downloadSrcUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.downloadSrcUrlRaw);

			if (this.contentItem && this.contentItem.title) {
				this.downloadName = `${this.contentItem.title}.mp3`;
			}
		} else {
			this.downloadSrcUrlRaw = null;
		}
	}

	onAudioDownload() {
		this.audioDownloaded.emit(this.downloadSrcUrlRaw);
	}

	waitForElementAndInitAudio() {
		console.log('waitForElementAndInitAudio');
		if (this.playerIsLoading) return;

		this.playerIsLoading = true;


		const watcher$ = interval(500);
		watcher$.pipe(
			filter(() => this.waveformRef && this.waveformRef.nativeElement),
			take(1),
			timeout(6000)
		).subscribe(r => {
			this.initializeAudioPlayer();
		}, e => {
			console.log('error', e, new Date().toISOString());
		});
	}

	private initializeAudioPlayer() {
		console.log('initing');
		this.playerIsLoading = false;

		const cursorOptions = {
			showTime: true,
			showHours: true,
			showMilliseconds: false,
			color: 'white',
			opacity: '0.85',
			customShowTimeStyle: {
				color: 'white',
			},
			formatTimeCallback: time => {
				const parts = [];

				const hours = Math.floor(time / 3600);
				const minutes = Math.floor((time % 3600) / 60);

				if (hours) {
					parts.push(hours);
					parts.push(('00' + minutes).slice(-2));
				} else {
					parts.push(minutes);
				}
				parts.push(('00' + Math.floor(time % 60)).slice(-2)); // seconds

				return parts.join(':');
			}
		};
		const wavesurfer = WaveSurfer.create({
			container: '#waveform-' + this.multimedia.id,
			progressColor: '#0070b9',
			waveColor: '#7d7d7d',
			backend: 'MediaElement',
			height: 50,
			barHeight: 3,
			barWidth: 2,
			responsive: true,
			plugins: [CursorPlugin.create(cursorOptions)]
			// mediaControls: true
		});

		this.waveFormPromise = new Promise((res, rej) => {
			wavesurfer.on('ready',  () => {
				const duration = wavesurfer.getDuration() ?? this.multimedia.duration;
				// console.log('WaveForm ready', wavesurfer);
				res(wavesurfer);

				wavesurfer.setPlaybackRate(this.playbackRate);

				if (duration) {
					this.trackLength = convertSecondsToTimeString(duration);
					if (this.audioStartPosition) {
						// console.log('seeking');
						wavesurfer.seekTo(this.audioStartPosition / duration);
						this.currentTime = convertSecondsToTimeString(this.audioStartPosition);
					}
					this.ref.markForCheck();
				}
			});

			let previousPosition = 0;
			wavesurfer.on('audioprocess', r => {
				if (Math.abs(previousPosition - r) >= 1) {
					previousPosition = Math.floor(r);
					this.currentTime = convertSecondsToTimeString(r);
					this.ref.markForCheck();
					this.dispatchProgress(r);
				}
			});
		});
		this.getWaveFormData().then(data => {
			const streamBypassUrl = `${this.downloadSrcUrlRaw}?ngsw-bypass=1`;
			if (data.length) {
				wavesurfer.load(streamBypassUrl, data, 'metadata');
			} else {
				wavesurfer.load(streamBypassUrl);
			}
			const ourAudio = document.querySelector(`#waveform-${this.multimedia.id} audio`);
			ourAudio?.addEventListener('error', e => {
				console.log('got audio error', e);
				this.playerIsLoading = false;
				this.loadFailed = true;
				this.ref.markForCheck();
				this.destroyAudioPlayer();
			});
		});
	}

	getWaveFormData() {
		if (this.downloadSrcUrlRaw?.endsWith('.mp3')) {
			return this.http.get<{data: number[]}>(this.downloadSrcUrlRaw.replace(/\.mp3$/, '.json')).pipe(
				map(d => d.data),
				catchError(e => {
					console.log('peak data parse failed', e);
					return of([]);
				})
			)
				.toPromise();
		} else {
			return Promise.resolve([]);
		}
	}

	setPlaybackRate(rate: number) {
		let percentage = 1;

		if (rate > 0 && rate <= 2) {
			percentage = rate;
		} else if (rate > 2 && rate <= 200) {
			percentage = rate / 100;
		}

		return this.waveFormPromise.then(player => {
			if (!player) return;
			player.setPlaybackRate(percentage);
			this.playbackRate = percentage;
			//set this in store/localstorage
			this.store.dispatch(userSetPlaybackRate({rate: percentage}));
		});
	}

	getTime() {
		return this.waveFormPromise.then(r => {
			if (r) {
				return r.getCurrentTime();
			} else {
				return 0;
			}
		});
	}

	setTime(number) {
		return this.waveFormPromise.then(r => {
			if (r) {
				this.timeIsManuallySet = true;
				r.seekTo(number / r.getDuration());
				this.currentTime = convertSecondsToTimeString(number);
			}
		});
	}

	skipBackward10() {
		this.closePopovers();
		return this.waveFormPromise.then(player => {
			if (!player) return;
			player.skip(-10);
		});
	}
	skipForward10() {
		this.closePopovers();
		return this.waveFormPromise.then(player => {
			if (!player) return;
			player.skip(10);
		});
	}

	destroyAudioPlayer(): Promise<void> {
		return this.waveFormPromise.then((player: WaveSurfer) => {
			if (!player) return;
			try {
				player.unAll?.();
				player.destroy?.();
			} catch (e) {
				console.log('error unbinding from wavesurfer', e);
			}
			this.waveFormPromise = Promise.resolve();
			this.playing = false;
			this.currentTime = '0:00';
			this.trackLength = '0:00';
		});
	}

	private dispatchProgress(audioPosition: number) {
		if (!this.contentItem || !this.trackProgress) return;

		const vidPostInfo: VideoPostInfo = {
			userId: null, // this will be set in the effect
			videoId: this.multimedia.id,
			progress: audioPosition,
			contentId: this.contentItem.system_id,
			courseId: this.courseId,
			eventTime: Date.now(),
			lectureType: this.contentItem.system_type
		};

		if (vidPostInfo.progress < 1) return;

		this.store.dispatch(setVideoProgress(vidPostInfo));
	}

	playToggle() {
		return this.waveFormPromise.then((r: WaveSurfer) => {
			if (r) {
				// console.log('waveform promise', r);
				if (this.playing) {
					r.pause();
				} else {
					r.play();
				}
				this.playing = !this.playing;
				this.closePopovers();
			}
		});
	}

	pause() {
		return this.waveFormPromise.then((r: WaveSurfer) => {
			if (r) {
				// console.log('waveform promise', r);
				if (this.playing) {
					r.pause();
				}
				this.playing = false;
				this.closePopovers();
			}
		});
	}

	play() {
		return this.waveFormPromise.then((r: WaveSurfer) => {
			if (r) {
				// console.log('waveform promise', r);
				if (!this.playing) {
					r.play();
				}
				this.playing = true;
				this.closePopovers();
			}
		});
	}

	movePlaybackSpeed() {
		if (this.playbackRate >= 1 && this.playbackRate < 1.5) {
			this.setPlaybackRate(1.5);
		} else if (this.playbackRate >= 1.5 && this.playbackRate < 2) {
			this.setPlaybackRate(2);
		} else if (this.playbackRate >= 2) {
			this.setPlaybackRate(0.5);
		} else if (this.playbackRate >= 0.5 && this.playbackRate < 1) {
			this.setPlaybackRate(1);
		}
	}

	getBackgroundStyles() {
		const url = (this.multimedia.poster_url || 'https://online.hillsdale.edu/assets/hillsdale-college-logo-white.svg');
		const rules: any = {
			'background-image': 'url(' + url + ')',
		};
		if (!this.multimedia.poster_url) {
			rules['background-size'] = 'contain';
			rules['background-repeat'] = 'no-repeat';
		}
		return rules;
	}
	changeVolume($event: Event) {
		if ($event?.target && ($event.target as any).value) {
			const val = +($event.target as any).value;
			if (!isNaN(val) && val > 0 && val < 100.1) {
				return this.waveFormPromise.then(r => {
					if (!r) return;
					r.setVolume(val / 100);
				});
			}
		}
		return Promise.resolve();
	}

	toggleVolume() {
		this.showVolumeSlider = !this.showVolumeSlider;
		this.showSettings = false;
	}
	toggleSettings() {
		this.showSettings = !this.showSettings;
		this.showVolumeSlider = false;
	}

	closePopovers() {
		this.showSettings = false;
		this.showVolumeSlider = false;
	}

	resetWaveformSize() {
		this.waveformRef?.nativeElement?.dispatchEvent(new CustomEvent('resize'));
	}
}
