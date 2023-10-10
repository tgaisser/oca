import {Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {CourseLecture} from '../../services/course-data.service';
import {select, Store} from '@ngrx/store';
import {State} from '../../state';
import * as courseSelectors from '../../state/courses/selectors';
import * as uiActions from '../../state/ui/actions';
import {filter, take, tap} from 'rxjs/operators';
import {get} from 'lodash';
import {Subscription} from 'rxjs';
import {VideoComponent} from '../../common/videoComponent';
import {selectCurrentDataSaverPreference, selectCurrentUserMediaPreference} from '../../state/user/selectors';
import {IMultiMediaComponent, LOCAL_STORAGE, MediaType} from '../../common/models';
import { handleMediaModeSwitch} from '../../common/helpers';
import {AudioPlayerComponent} from '../../common/course/audio-player/audio-player.component';
import {SUPPORT_EMAIL, VIDEO_PLAYER_TYPE_PREFERENCE} from '../../common/constants';
import {userSetVideoPreferences} from '../../state/user/actions';
import { faHeadphones, faVideo } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-lecture',
	templateUrl: './lecture.component.html',
	styleUrls: ['./lecture.component.less']
})
export class LectureComponent extends VideoComponent implements IMultiMediaComponent, OnInit, OnChanges, OnDestroy {

	@Input() courseId: string;
	@Input() lecture: CourseLecture = null;
	@Input() layout = 'main';
	@Input() showVideo = true;

	playerPreference = VIDEO_PLAYER_TYPE_PREFERENCE;
	dataSaver = false;

	faVideo = faVideo;
	faHeadphones = faHeadphones;

	hasInitVideo = false;
	hasInitAudio = false;

	_mediaMode: MediaType = 'video';
	get mediaMode() {
		return this._mediaMode;
	}
	set mediaMode(value) {
		handleMediaModeSwitch(this, value, this.store);
	}

	playerControlsDisabled = false;

	currentSelection = 'lecture';

	supportEmail = SUPPORT_EMAIL;

	private curLocationLookupSub: Subscription;

	private curMediaPreferenceSub = this.store.pipe(select(selectCurrentUserMediaPreference)).subscribe(p => {
		this.mediaMode = p;
	});
	private dataSaverSub = this.store.pipe(select(selectCurrentDataSaverPreference)).subscribe(ds => {
		this.dataSaver = ds;
	});

	visibilityListener: any;

	@ViewChild('audioPlayer') audioPlayer: AudioPlayerComponent;

	@ViewChild('lectureVideo')
	get lectureVideoRef(): ElementRef { return this.playerVideoRef; }
	set lectureVideoRef(value: ElementRef) { this.playerVideoRef = value; }

	constructor(store: Store<State>, @Inject(LOCAL_STORAGE) locStorage: Storage) {
		super(store, locStorage);
	}

	ngOnInit() {
		this.curLocationLookupSub = this.store.pipe(
			select(courseSelectors.getVideoLoc(this.lecture.multimedia_id)),
			filter(i => !!i?.position),
			take(1)
		).subscribe(async position => {
			this.videoStartPosition = position.position;
			await this.setPositionIfNotStartedAndNotAtEndOfVideo();
		});

		if (typeof document.hidden !== 'undefined') {
			let switchedFromVideo = false;
			this.visibilityListener = () => {
				// console.log('visibility change', document.hidden, this.mediaMode, switchedFromVideo);
				this.playerVideoRef?.nativeElement?.isPaused().then(isPaused => {
					if (!isPaused && this.mediaMode === 'video' && document.hidden) {
						this.mediaMode = 'audio';
						switchedFromVideo = true;
					} else if (isPaused && this.mediaMode === 'audio' && !document.hidden && switchedFromVideo) {
						this.mediaMode = 'video';
						switchedFromVideo = false;
					}
				});
			};
			document.addEventListener('visibilitychange', this.visibilityListener);
		}
	}

	ngOnDestroy() {
		super.ngOnDestroy();

		document.removeEventListener('visibilitychange', this.visibilityListener);

		//send a final status of the video
		if (this.lecture && this.lecture.system_id) this.dispatchProgress(this.lecture.multimedia_id, this.lecture.system_id, true);

		if (this.curLocationLookupSub && !this.curLocationLookupSub.closed) {
			this.curLocationLookupSub.unsubscribe();
			this.curLocationLookupSub = null;
		}
		if (this.curMediaPreferenceSub && !this.curMediaPreferenceSub.closed) {
			this.curMediaPreferenceSub.unsubscribe();
			this.curMediaPreferenceSub = null;
		}
		if (this.dataSaverSub && !this.dataSaverSub.closed) {
			this.dataSaverSub.unsubscribe();
			this.dataSaverSub = null;
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		// console.log('change', changes, this.lecture, this.showVideo);
		if (changes.lecture || changes.showVideo) {
			const videoIdIsSame =
				get(changes, 'lecture.currentValue.multimedia.id') === get(changes, 'lecture.previousValue.multimedia.id');
			const showVideoIsSame = get(changes, 'showVideo.currentValue') === get(changes, 'showVideo.previousValue');
			if (videoIdIsSame && showVideoIsSame) {
				// "change" to lecture, but the same video
				return;
			}

			if (this.lecture && this.showVideo) {
				// console.log('got lecture', changes.lecture.currentValue, this.showVideo);
				this.clearPreviousVideoPlayer();
				this.loadVideo(this.lecture.multimedia, true, this.lecture.system_id);

			} else if (!this.showVideo && !showVideoIsSame) {
				//switched to not showing video
				if (this.lecture && this.lecture.system_id) this.dispatchProgress(this.lecture.multimedia_id, this.lecture.system_id, true);

				if (this.playerVideoRef?.nativeElement) {
					this.playerVideoRef.nativeElement.pause().then();
					this.clearPreviousVideoPlayer();
				}

			}
		}
	}

	onVideoLoadFailed() {
		this.mediaMode = 'audio';
	}

	onPlayerInit() {
		super.onPlayerInit();
		this.setPositionIfNotStartedAndNotAtEndOfVideo().then();
	}


	onAudioDownload(url) {
		this.store.dispatch(uiActions.audioDownloaded({
			url,
			courseId: this.courseId,
			lectureId: this.lecture && this.lecture.system_id
		}));
	}

	saveMediaMode() {
		this.store?.dispatch(userSetVideoPreferences({preferAudioLectures: this._mediaMode === 'audio'}));
	}
}
