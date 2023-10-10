import Dexie from 'dexie';
import {VideoPostInfo} from '../courses/actions';

export class OfflineDatabase extends Dexie {
	// Declare implicit table properties.
	// (just to inform Typescript. Instantiated by Dexie in stores() method)
	quizzes: Dexie.Table<QuizRes, number>; // number = type of the primkey
	watches: Dexie.Table<VideoWatchDb, number>; // number = type of the primkey
	videoPositions: Dexie.Table<VideoPosition, string>; // string = type of the primkey
	videoPostInfo: Dexie.Table<VideoPostInfoDb, number>; // number = type of the primkey

	constructor() {
		super('OLOfflineDb');
		this.version(1).stores({
			quizzes: '++id,quizId',
			watches: '++id,videoId,endWatchTime,endPosition,lastSyncedDate',
			videoPositions: 'id'
		});
		this.version(2).stores({
			videoPostInfo: '++id,videoId,userId,eventTime'
		});
		// The following line is needed if your typescript
		// is compiled using babel instead of tsc:
		this.quizzes = this.table('quizzes');
		this.watches = this.table('watches');
		this.videoPositions = this.table('videoPositions');
		this.videoPostInfo = this.table('videoPostInfo');
	}

	saveVideoPosition(userId: string, videoId: string, newPosition: number) {
		this.transaction('rw', this.videoPositions, async () => {
			const now = new Date();
			let watch: VideoPosition = await this.videoPositions.get(videoId);
			if (!watch) {
				watch = {
					id: videoId,
					userId,
					firstSaveDate: now,
					lastSaveDate: undefined,
					maxWatch: 0,
				};
			}

			watch.maxWatch = newPosition >= watch.maxWatch ? newPosition : watch.maxWatch;
			watch.lastSaveDate = now;

			await this.videoPositions.put(watch);
		}).catch(e => {
			console.error('error updating video stat', e);
		});
	}

	async saveVideoPostInfo(vidPostInfoDb: VideoPostInfoDb): Promise<number> {
		return this.transaction('rw', this.videoPostInfo, async () => {
			return this.videoPostInfo.put(vidPostInfoDb);
		}).catch(e => {
			console.error('Problem saving VideoPostInfoDb to IndexedDB');
			throw e;
		});
	}

	async getUnsyncedVideoPostInfos(userId: string){
		return this.videoPostInfo
			.where('userId').equals(userId)
			.and(v => v.synced === false)
			.sortBy('eventTime');
	}


	// TODO: (not currently being used)
	// saveQuizResult(quiz) {
	// 	this.transaction('rw', this.quizzes, async () => {
	// 		const now = new Date();
	//
	// 		await this.quizzes.add({
	// 			quizId: quiz.quizId || quiz.id,
	// 			courseId: quiz.courseId,
	// 			lectureId: quiz.lectureId,
	// 			score: quiz.score,
	// 			percentage: quiz.percentage,
	// 			numQuestions: quiz.numQuestions,
	// 			completeTime: now,
	// 		});
	// 	}).catch(e => {
	// 		console.log('error updating quiz', e);
	// 	});
	// }
}

export interface VideoWatch {
	userId: string;
	videoId: string;
	courseId: string;
	lectureType: string;
	lectureId: string;
	endPosition: number; // video position where user stopped watching
	endWatchTime: Date; // timestamp when user stopped watching
}
export interface VideoWatchDb extends VideoWatch {
	id?: number;
	lastSyncedDate: Date;
	startWatchTime: Date; // timestamp when user started watching
	startPosition: number; // video position where user started watching
}

export interface VideoPosition {
	id: string;
	userId: string;
	maxWatch: number; // the farthest video position a user has ever reached
	firstSaveDate: Date;
	lastSaveDate: Date;
}

export interface QuizRes {
	userId: string;
	quizId: string;
	courseId: string;
	lectureId: string;
	score: number;
	percentage: number;
	numQuestions: number;
	completeTime: Date;
}

export interface VideoPostInfoDb extends VideoPostInfo {
	id: number;
	synced: boolean;
}



