import {Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {SupplementalVideo} from '../../services/course-data.service';
import {DomSanitizer} from '@angular/platform-browser';
import {VideoComponent} from '../../common/videoComponent';
import {select, Store} from '@ngrx/store';
import {State} from '../../state';
import {get} from 'lodash';
import {selectCurrentUserMediaPreference} from '../../state/user/selectors';
import {IMultiMediaComponent, LOCAL_STORAGE, MediaType} from '../../common/models';
import {handleMediaModeSwitch} from '../../common/helpers';
import {AudioPlayerComponent} from '../../common/course/audio-player/audio-player.component';
import {faHeadphones, faVideo} from '@fortawesome/free-solid-svg-icons';
import {VIDEO_PLAYER_TYPE_PREFERENCE} from '../../common/constants';

@Component({
	selector: 'app-qa',
	templateUrl: './qa.component.html',
	styleUrls: ['./qa.component.less']
})
export class QAComponent extends VideoComponent implements IMultiMediaComponent, OnInit, OnChanges, OnDestroy {

	@Input() suppVids: SupplementalVideo[] = null;
	@Input() layout = 'main';
	@Input() courseId: string;
	@Input() showVideo = false;

	currentVideo: SupplementalVideo;
	playerControlsDisabled = false;

	playerPreference = VIDEO_PLAYER_TYPE_PREFERENCE;

	faVideo = faVideo;
	faHeadphones = faHeadphones;

	hasInitVideo = false;
	hasInitAudio = false;

	@ViewChild('audioPlayer') audioPlayer: AudioPlayerComponent;

	_mediaMode: 'video'|'audio' = 'video';
	get mediaMode() {
		return this._mediaMode;
	}
	set mediaMode(value) {
		handleMediaModeSwitch(this, value, this.store);
	}

	private curMediaPreferenceSub = this.store.pipe(select(selectCurrentUserMediaPreference)).subscribe(p => {
		this.mediaMode = p;
	});
	//TODO visibility handling

	@ViewChild('qaVideo')
	get qaVideoRef(): ElementRef { return this.playerVideoRef; }
	set qaVideoRef(value: ElementRef) {
		this.playerVideoRef = value;
		if (value && this.currentVideo?.multimedia) {
			this.loadVideo(this.currentVideo.multimedia, false);
		}
	}

	constructor(
		public domSanitizer: DomSanitizer,
		store: Store<State>,
		@Inject(LOCAL_STORAGE) locStorage: Storage
	) {
		super(store, locStorage);

		this.videoType = 'qa';
	}

	ngOnInit() {}

	ngOnChanges(changes: SimpleChanges) {
		// console.log('change', changes);
		const newVidId = get(changes, 'suppVids.currentValue[0].multimedia_id');

		// if we've previously inited, but we not just got a change to not show the video, pause it.
		const showVideoIsSame = get(changes, 'showVideo.currentValue') === get(changes, 'showVideo.previousValue');
		if (!showVideoIsSame && !this.showVideo && this.playerVideoRef.nativeElement) {
			this.playerVideoRef.nativeElement.pause().then();
			return;
		}

		if (!newVidId) return;
		if (showVideoIsSame && newVidId === get(changes, 'suppVids.previousValue[0].multimedia_id')) {
			console.log('"change" to qa, but the same video');
			return;
		}

		//we have at least one video. Init with first item
		this.selectVideo(this.suppVids[0]); //could presumably just use this.suppVids
	}

	ngOnDestroy() {
		super.ngOnDestroy();
		if (this.curMediaPreferenceSub && !this.curMediaPreferenceSub.closed) {
			this.curMediaPreferenceSub.unsubscribe();
			this.curMediaPreferenceSub = null;
		}
	}

	selectVideo(vid: SupplementalVideo) {
		this.currentVideo = vid;
		this.loadVideo(vid.multimedia, true, this.currentVideo.system_id);

		//set playback rate (otherwise doesn't persist between supp vids)
		this.playerVideoRef?.nativeElement?.onAvailable().then(_ => {
			this.playerVideoRef?.nativeElement?.setPlaybackRate(this.playbackRate);
		});
	}
}
