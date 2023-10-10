import {ElementRef, InjectionToken} from '@angular/core';
import {AudioPlayerComponent} from './course/audio-player/audio-player.component';
import {MultimediaItem} from 'hc-video-player';
export const LOCAL_STORAGE = new InjectionToken('LocalStorage');
export const SESSION_STORAGE = new InjectionToken('SessionStorage');

export type MediaType = 'audio'|'video';

export interface UserUtmCodes {
	utm_term?: string;
	utm_source?: string;
	utm_medium?: string;
	utm_content?: string;
	utm_campaign?: string;
	appeal_code?: string;
	sc?: string;
	source_partner?: string;
	source_tv_ad?: string;
}

export interface UserPreferences {
	progressReportFrequency: 'Monthly' | 'Weekly' | 'Never';
	preferAudioLectures?: boolean;
	subjectPreference?: string;
	storeAudioOffline?: boolean;
	dataSaver?: boolean;
}

export class CourseEnrollment {
	id: number;
	userId: string;
	courseId: string;
	enrollmentDate: Date;
	withdrawalDate?: Date;
	userHasEarlyAccess?: boolean;
	studyGroupId?: string;
}

export class CourseInquiry {
	id: number;
	email: string;
	courseId: string;
	inquiryDate: Date;
	enrolledUserId?: string;
	enrollmentDate?: Date;
	userHasEarlyAccess?: boolean;
	studyGroupId?: string;
}

export class CourseProgress {
	itemType: string;
	itemId: string;
	itemName: string;
	progressPercentage: number;
	started: boolean;
	completed: boolean;
	lastActivityDate: string;
	children: CourseProgress[];
	videoStatuses?: { videoId: string, position: number, modifiedDate: Date }[];
}

export interface IAudioComponent {
	audioPlayer: AudioPlayerComponent;
}

export interface IVideoComponent {
	courseId: string;
	requestedVideo: MultimediaItem;
	playbackRate: number;
	playerVideoRef: ElementRef<HTMLHcVideoPlayerElement>;
	videoStartPosition: number;
}
export interface IMultiMediaComponent extends IAudioComponent, IVideoComponent {
	hasInitAudio: boolean;
	hasInitVideo: boolean;
	_mediaMode: string;
}

export interface WithdrawalReason {
	id: number;
	text: string;
}


export class Note {
	id: number;
	courseId: string;
	lectureId: string;
	lectureName?: string;
	text: string;
	createDate?: Date;
	updateDate?: Date;
}

export class QuizResult {
	quizId: string;
	quizName: string;
	courseId: string;
	lectureId: string;
	results?: { id: string; correct: boolean, selectedOption: string }[];
	correctQuestions: number;
	percentageCorrect: number;
	completeTime: Date;
	bestPercentageCorrect;
}

export interface WatchKeys {
	courseId: string;
	lectureId: string;
	videoId: string;
	type: string;
}

export interface WatchInfo {
	start: WatchTime;
	end: WatchTime;
}

interface WatchTime {
	pos: number;
	time: Date;
}

export interface AltVideoResolutions {
	vimeo_id: number;
	resolutions: {[key: string]: { resolution: string, signature: string, token: string }};
}
