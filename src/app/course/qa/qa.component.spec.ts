import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as helpers from '../../../test.helpers';
import { QAComponent } from './qa.component';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../state';
import {CustomMocksModule, MockStorage} from '../../../test.helpers';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';
import {FormsModule} from '@angular/forms';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {LOCAL_STORAGE} from '../../common/models';
import {DurationPipe} from '../../common/course/duration.pipe';

describe('QAComponent', () => {
	let component: QAComponent;
	let fixture: ComponentFixture<QAComponent>;

	let playerPauseSpy;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [QAComponent, DurationPipe],
			imports: [CustomMocksModule, HcPipesModule, FormsModule, ButtonsModule, FontAwesomeTestingModule],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: LOCAL_STORAGE, useClass: MockStorage},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(QAComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		playerPauseSpy = jest.spyOn(component.playerVideoRef.nativeElement, 'pause');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	function runNgOnChangesTest(prevMM: string, curMM: string, expectedCall: boolean, otherChange: {[key: string]: SimpleChange} = {}) {
		const selectVideoSpy = jest.spyOn(component, 'selectVideo');
		const consoleSpy = jest.spyOn(console, 'log');

		const newSupVid = {
			system_id: 'id-' + curMM,
			multimedia_id: curMM,
			multimedia: {id: curMM}
		};
		const oldSupVid = {
			system_id: 'id-' + prevMM,
			multimedia_id: prevMM,
			multimedia: {id: prevMM}
		};
		const changes = {
			...otherChange,
			suppVids: new SimpleChange(
				[oldSupVid],
				[newSupVid],
				true
			),
		};
		component.suppVids = [newSupVid] as any;
		component.ngOnChanges(changes);
		if (expectedCall) {
			expect(selectVideoSpy).toHaveBeenCalledWith(newSupVid);
		} else {
			expect(consoleSpy).toHaveBeenCalled();
		}
	}
	it('should ngOnChanges with same current/previous video', () => {
		runNgOnChangesTest('old', 'old', false);
	});

	/*it('should ngOnChanges with different current/previous video', () => {
		runNgOnChangesTest('old', 'new');
	});*/

	it('should ngOnChanges with different current/previous video', () => {
		runNgOnChangesTest('old', 'new', true);
	});


	it('should ngOnChanges with showVideo (no change)', () => {
		component.showVideo = true;
		runNgOnChangesTest('same', 'same', false, {showVideo: new SimpleChange(true, true, true)});
		expect(playerPauseSpy).not.toHaveBeenCalled();
	});

	it('should ngOnChanges with showVideo (no change [false])', () => {
		component.showVideo = false;
		runNgOnChangesTest('same', 'same', false, {showVideo: new SimpleChange(false, false, true)});
		expect(playerPauseSpy).not.toHaveBeenCalled();
	});

	it('should ngOnChanges with showVideo (show -> hide)', () => {
		component.showVideo = false;
		runNgOnChangesTest('same', 'same', false, {showVideo: new SimpleChange(true, false, true)});
		expect(playerPauseSpy).toHaveBeenCalled();
	});

	it('should ngOnChanges with showVideo (show -> hide [no player])', () => {
		component.showVideo = false;
		runNgOnChangesTest('same', 'same', false, {showVideo: new SimpleChange(true, false, true)});
		//should run without error
		expect(1).toBe(1);
	});

	it('should ngOnChanges with showVideo (hide -> show)', () => {
		component.showVideo = true;
		runNgOnChangesTest('same', 'same', false, {showVideo: new SimpleChange(false, true, true)});
		expect(playerPauseSpy).not.toHaveBeenCalled();
	});

	it('should selectVideo', () => {
		const suppVideo = {
			...helpers.getMockCourseContent(),
			url_slug: 'mockUrlSlug',
			overview: 'mockOverview',
			duration: '5',
			video_id: 'mockVideoId',
			audio_url: 'mockAudioUrl',
			soundcloud_track_id: 'mockSoundCloudTrackId',
			soundcloud_track_secret_token: 'mockToken',
			audio_download_filename: 'mockFilename',
			multimedia: helpers.getMockMultimediaItem(),
			multimedia_id: 'mockMultimediaId'
		};
		const selectVideoSpy = jest.spyOn(component, 'selectVideo');
		const loadVideoSpy = jest.spyOn(component, 'loadVideo');
		component.selectVideo(suppVideo);
		expect(selectVideoSpy).toHaveBeenCalledWith(suppVideo);
		expect(loadVideoSpy).toHaveBeenCalledWith(suppVideo.multimedia, true, suppVideo.system_id);
	});
});
