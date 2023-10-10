import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';

import {createSpyObj, CustomMocksModule, MockStorage} from '../../../test.helpers';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State} from '../../state';
import {Store} from '@ngrx/store';

const getVideoLocSpy = jest.fn();
jest.mock('../../state/courses/selectors', () => ({
	getVideoLoc() {
		return getVideoLocSpy;	//() => undefined;
	}
}));

import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {audioDownloaded} from '../../state/ui/actions';
import {LectureComponent} from './lecture.component';
import * as helpers from '../../../test.helpers';
import {selectModalStatus} from '../../state/ui/selectors';
import {AttributionsComponent} from '../../common/course/attributions/attributions.component';
import {CreativeCreditComponent} from '../../common/course/creative-credit/creative-credit.component';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {FormsModule} from '@angular/forms';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {LOCAL_STORAGE} from '../../common/models';
import {DurationPipe} from '../../common/course/duration.pipe';

describe('LectureComponent', () => {
	let component: LectureComponent;
	let fixture: ComponentFixture<LectureComponent>;
	let store: MockStore<State>;
	let clearVideoSpy;
	let dispatchProgressSpy;
	//let playerSpy;
	let loadVideoSpy;
	let consoleSpy;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [LectureComponent, AttributionsComponent, CreativeCreditComponent, DurationPipe],
			imports: [
				CustomMocksModule,
				HcPipesModule,
				ButtonsModule,
				FormsModule,
				FontAwesomeTestingModule,
			],
			providers: [
				provideMockStore({initialState: mockInitialState}),
				{provide: LOCAL_STORAGE, useClass: MockStorage},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LectureComponent);
		component = fixture.componentInstance;
		component.lecture = {} as any;
		fixture.detectChanges();
		store = TestBed.inject(Store) as MockStore<State>;
		jest.spyOn(store, 'dispatch');
		clearVideoSpy = jest.spyOn(component, 'clearPreviousVideoPlayer');
		dispatchProgressSpy = jest.spyOn(component, 'dispatchProgress');
		//playerSpy = jest.spyOn(component.player, 'pause');
		loadVideoSpy = jest.spyOn(component, 'loadVideo');
		consoleSpy = jest.spyOn(console, 'log');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should ngOnInit', () => {
		const newLoc = {position: 42};
		getVideoLocSpy.mockClear();
		getVideoLocSpy.mockImplementationOnce(() => newLoc);
		//TODO validate that selector is only called once (because of take(1) below)

		component.ngOnInit();

		expect(component.videoStartPosition).toBe(newLoc.position);
		expect(getVideoLocSpy).toHaveBeenCalledTimes(1);
	});

	const runNgOnChangesTest = (oldLectureValue: any, newLectureValue: any, oldShowVideoValue: any, newShowVideoValue: any) => {
		//jest.spyOn<any, any>(component.player, 'pause');
		const changes = {
			lecture: new SimpleChange({multimedia: {id: oldLectureValue}}, {multimedia: {id: newLectureValue}}, true),
			showVideo: new SimpleChange(oldShowVideoValue, newShowVideoValue, true)
		};
		component.ngOnChanges(changes);
		const videoIdIsSame = changes.lecture.currentValue.multimedia.system_id === changes.lecture.previousValue.multimedia.system_id;
		const showVideoIsSame = changes.showVideo.currentValue === changes.showVideo.previousValue;
		console.log('same', videoIdIsSame, showVideoIsSame);
		if (videoIdIsSame && showVideoIsSame) {
			expect(consoleSpy).toHaveBeenCalled();
		} else {
			if (component.lecture && component.showVideo) {
				expect(clearVideoSpy).toHaveBeenCalled();
				expect(loadVideoSpy).toHaveBeenCalledWith(component.lecture.multimedia, true, component.lecture.system_id);
			} else if (!component.showVideo && !showVideoIsSame) {
				expect(consoleSpy).toHaveBeenCalled();
				if (component.lecture && component.lecture.system_id) {
					expect(dispatchProgressSpy).toHaveBeenCalledWith(component.lecture.multimedia_id, component.lecture.system_id, true);
				}
			}
		}
		clearVideoSpy.mockReset();
		dispatchProgressSpy.mockReset();
	};

	it('should return on call to ngOnChanges', () => {
		component.lecture = helpers.getMockCourseLecture();
		component.showVideo = true;
		runNgOnChangesTest(1, 1, 2, 2);
	});

	it('should clear and load video on call to ngOnChanges', () => {
		component.lecture = helpers.getMockCourseLecture();
		component.showVideo = true;
		runNgOnChangesTest(1, 2, 2, 2);
	});

	it('should close video and dispatch progress on call to ngOnChanges', () => {
		component.playerVideoRef = {nativeElement: helpers.getMockHcVideoPlayer()} as any;
		component.lecture = helpers.getMockCourseLecture();
		component.showVideo = false;
		runNgOnChangesTest(1, 2, 1, 2);
		expect(component.playerVideoRef.nativeElement.pause).toHaveBeenCalled();
	});

	it('should ngOnDestroy', () => {
		const destroySpy = jest.spyOn(component, 'ngOnDestroy');
		component.ngOnDestroy();
		expect(destroySpy).toHaveBeenCalled();

		if (component.lecture && component.lecture.system_id) {
			expect(dispatchProgressSpy).toHaveBeenCalled();
		}

		destroySpy.mockReset();
		dispatchProgressSpy.mockReset();
	});

	it('should return on call to onPlayerInit', async () => {
		const setPositionSpy = jest.spyOn(component, 'setPositionIfNotStartedAndNotAtEndOfVideo')
			.mockImplementation(() => Promise.resolve(0));
		component.onPlayerInit();
		await Promise.resolve();
		expect(setPositionSpy).toHaveBeenCalled();
	});

	//TODO move all of this to a new component
	it.todo('should pause other media source when mediaType is switched');

	it('should onAudioDownload', () => {
		const url = 'testUrl';
		component.onAudioDownload(url);
		expect(store.dispatch).toHaveBeenCalledWith(audioDownloaded({
			url,
			courseId: component.courseId,
			lectureId: component.lecture && component.lecture.system_id
		}));
	});


});
