import {
	setVideoPlay,
	setVideoProgress,
	setVideoProgressForce,
	setVideoReachedEnd,
	VideoPostInfo
} from '../state/courses/actions';
import {select, Store} from '@ngrx/store';
import {State} from '../state';
import {Directive, ElementRef, OnDestroy} from '@angular/core';
import {MultimediaItem} from 'hc-video-player';
import {setVideo} from './helpers';
import * as uiSelectors from '../state/ui/selectors';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {selectCurrentUserPlaybackRate} from '../state/user/selectors';
import {userSetPlaybackRate} from '../state/user/actions';
import {IVideoComponent} from './models';

interface StencilEvent extends Event {
	detail: any;
}

export const CAPTION_SELECTION_KEY = 'selectedCaptionSetting';
export const VOLUME_SELECTION_KEY = 'selectedVolumeSetting';

@Directive()

export class VideoComponent implements IVideoComponent, OnDestroy {
	courseId: string;
	private currentContentId: string;
	requestedVideo: MultimediaItem;
	videoCreating = false;
	videoHandleExists = false;
	videoLoadFailed = false;
	videoStarted = false;
	videoStartPosition: number;
	videoType = 'lecture';

	playerControlsDisabled = true;

	private modalWatcherSub: Subscription;

	playbackRate = 1;
	userPlaybackRateSub = this.store.pipe(select(selectCurrentUserPlaybackRate)).subscribe(r => {
		// console.log('got rate', r);
		this.playbackRate = r;
		this.playerVideoRef?.nativeElement?.setPlaybackRate(r);
	});

	private _videoPlayer: ElementRef<HTMLHcVideoPlayerElement>;
	get playerVideoRef(): ElementRef<HTMLHcVideoPlayerElement> {
		return this._videoPlayer;
	}
	set playerVideoRef(val) {
		this._videoPlayer = val;
		this.videoLoadFailed = false;
		if (val?.nativeElement) {
			this._videoPlayer.nativeElement.addEventListener('videoProgress', ev => {
				const details = (ev as StencilEvent).detail;
				if (!this.courseId || !this.currentContentId) return;
				if (!details?.videoId || !details.currentTimestamp) return;

				this.dispatchProgress(details.videoId, this.currentContentId, false, details.currentTimestamp);
			});
			this._videoPlayer.nativeElement.addEventListener('videoStatus', ev => {
				const details = (ev as StencilEvent).detail;
				if (!this.courseId || !this.currentContentId) return;
				if (!details?.videoId || (!details.currentTimestamp && 0 !== details?.currentTimestamp)) return;
				// console.log('video status', details.status);

				switch (details.status) {
				case 'played':
					this.videoStarted = true;

					this.playerVideoRef?.nativeElement.getTitle().then(title => {
						this.store.dispatch(setVideoPlay({
							courseId: this.courseId, contentId: this.currentContentId, videoId: details.videoId, title
						}));
					});
					break;
				case 'paused':
					this.dispatchProgress(details.videoId, this.currentContentId, true, details.currentTimestamp);
					break;
				case 'ended':
					this.dispatchProgress(details.videoId, this.currentContentId, true, details.currentTimestamp);
					this.store.dispatch(setVideoReachedEnd({
						courseId: this.courseId, contentId: this.currentContentId, videoId: details.videoId
					}));
					break;
				case 'failed':
					console.error('video failed: currentContentId: ' + this.currentContentId, details);
					this.videoLoadFailed = true;
					this.onVideoLoadFailed();
					break;
				}

				this.store.dispatch(setVideoProgress({
					userId: null,
					videoId: details.videoId,
					progress: details.currentTimestamp,
					courseId: this.courseId,
					contentId: this.currentContentId,
					eventTime: Date.now(),
					lectureType: this.videoType,
				}));
			});
			this._videoPlayer.nativeElement.addEventListener('videoPlaybackRate', ev => {
				// console.log('got new rate', ev);
				this.store.dispatch(userSetPlaybackRate({rate: (ev as StencilEvent).detail}));
			});

			this._videoPlayer.nativeElement.addEventListener('captionLanguage', ev => {
				this.localStorage.setItem(CAPTION_SELECTION_KEY, (ev as StencilEvent).detail);
			});
			this._videoPlayer.nativeElement.addEventListener('volumechange', ev => {
				this.localStorage.setItem(VOLUME_SELECTION_KEY, (ev as StencilEvent).detail);
			});
			this._videoPlayer.nativeElement.onAvailable().then(_ => this.onPlayerInit());
			//TODO

			if (!this.videoHandleExists && this.requestedVideo) {
				//console.log('re-creating');
				setVideo(this.playerVideoRef, this.requestedVideo);
				this.videoHandleExists = true;
			}

			this.setPositionIfNotStartedAndNotAtEndOfVideo().then();
		}
	}

	/*
		const existingMM = (this.playerVideoRef?.nativeElement?.multimedia as MultimediaItem);
		const newMM = stat.selectedLecture?.multimedia;
		if (this.playerVideoRef?.nativeElement && newMM && newMM?.id !== existingMM?.id) {
			this.playerVideoRef.nativeElement.multimedia = (newMM as MultimediaItem);

		}
	 */

	constructor(protected store: Store<State>, protected localStorage: Storage) { }

	ngOnDestroy() {
		// if (this.player) {
		// this.player.destroy().then();
		// }

		//stop watching for modal changes
		if (this.modalWatcherSub != null && !this.modalWatcherSub.closed) {
			this.modalWatcherSub.unsubscribe();
		}
		if (this.userPlaybackRateSub != null && !this.userPlaybackRateSub.closed) {
			this.userPlaybackRateSub.unsubscribe();
		}
	}

	loadVideo(video: MultimediaItem, pushStats: boolean, lectureId: string = null) {
		this.currentContentId = lectureId;
		//TODO set content type
		this.videoHandleExists = !!this.playerVideoRef?.nativeElement;
		setVideo(this.playerVideoRef, video, this.localStorage.getItem(CAPTION_SELECTION_KEY), this.localStorage.getItem(VOLUME_SELECTION_KEY));
		this.requestedVideo = video;
	}

	setPositionIfNotStartedAndNotAtEndOfVideo() {
		if (!this.playerVideoRef?.nativeElement || this.videoStarted || !this.videoStartPosition) return Promise.resolve(0);

		return ((this.requestedVideo && this.requestedVideo.duration) ?
			Promise.resolve(this.requestedVideo.duration) :
			this.playerVideoRef.nativeElement.getDuration()
		).then(duration => {
			// console.log('last position', this.videoStartPosition, '; video duration', duration);

			if (!duration || duration - 30 > this.videoStartPosition) {
				return this.playerVideoRef.nativeElement.setTime(this.videoStartPosition);
			} else {
				// console.log('video is completed. Not setting position');
				return 0;
			}
		});
	}

	onVideoLoadFailed() {}

	onPlayerInit() {
		this.playerVideoRef?.nativeElement?.setPlaybackRate(this.playbackRate).then(r => console.log('new rate set on video player', r));

		//No default implementation. Here to allow subclass to inject code
		this.modalWatcherSub = this.store.pipe(
			select(uiSelectors.selectModalStatus),
			filter(isOpen => isOpen) //limit checks to when there _is_ a modal open
		).subscribe(modalOpen => {
			if (!this.playerVideoRef.nativeElement) return;

			//if the player is playing and a modal just opened, pause the video
			this.playerVideoRef.nativeElement.isPaused().then(isPaused => {
				if (!isPaused) {
					this.playerVideoRef.nativeElement.pause().then();
				}
			});
		});
	}

	playAndEnable() {
		this.playerVideoRef?.nativeElement?.play().then();
	}

	clearPreviousVideoPlayer() {
		//stop watching for modal changes
		if (this.modalWatcherSub != null && !this.modalWatcherSub.closed) {
			this.modalWatcherSub.unsubscribe();
		}
	}

	dispatchProgress(videoId: string, contentId: string, force: boolean, progressTime?: number) {
		//saving this because the promise below provides an opportunity for the reference to change
		const courseId = this.courseId;
		if (!videoId) {
			return;
		}

		(progressTime ? Promise.resolve(progressTime) : (this.playerVideoRef?.nativeElement?.getTime() ?? Promise.resolve(0))).then(time => {
			// 'time' is video position in seconds, with three decimal places.
			const props: VideoPostInfo = {
				userId: null, // this will be set in the effect
				videoId,
				progress: time,
				contentId,
				courseId,
				eventTime: Date.now(),
				lectureType: this.videoType
			};

			if (props.progress < 1) {
				return;
			}

			// patch to make sure this player remembers its position if closed and then re-opened
			this.videoStartPosition = time;

			const event = force ? setVideoProgressForce(props) : setVideoProgress(props);
			this.store.dispatch(event);
		});
	}

}
