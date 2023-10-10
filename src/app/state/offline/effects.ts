
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {State} from '../index';
import {Injectable} from '@angular/core';
import {concatMap, map, withLatestFrom} from 'rxjs/operators';

import {saveVideoPostInfo, uploadVideoPostInfos} from './actions';
import {UserDataService} from '../../services/user-data.service';
import * as actions from '../courses/actions';
import {VideoPostInfo} from '../courses/actions';
import {OfflineDatabase, VideoPostInfoDb} from './index';


@Injectable()
export class OfflineDbEffects {
	db = new OfflineDatabase();

	saveVideoPostInfo$ = createEffect(() => this.actions$.pipe(
		ofType(saveVideoPostInfo),
		map(async action => {
			const vidPostInfoDb = {
				...(action as VideoPostInfo as VideoPostInfoDb),
				synced: false
			};

			try {
				// save VideoPostInfo to IndexedDb before getting unsynced records from IndexedDb and uploading to server
				await this.db.saveVideoPostInfo(vidPostInfoDb);
			} catch (e){
				if (e.message.includes('A mutation operation was attempted on a database that did not allow mutations')){
					// This is probably due to FireFox in private mode... can't write to IndexedDB
					// so we will send the data directly to API
					const data = [action as VideoPostInfo];
					const progressPercent = await this.progressSvc.postVideoProgress(data).toPromise();
					if (typeof progressPercent === 'number' && progressPercent >= 0) {
						this.store.dispatch(actions.updateCourseContentProgress({
							courseSystemId: data[0].courseId,
							contentSystemId: data[0].contentId,
							progressPercentage: progressPercent,
							completedThreshold: 0.8,
							started: true,
						}));
					}else{
						console.error('There was a problem posting video progress.');
					}

					// skip the dispatch of uploadVideoPostInfos
					return;
				} else {
					console.error('Offline db error:', e);
				}
			}

			this.store.dispatch(uploadVideoPostInfos());
		}),
	), {dispatch: false});

	pushUnsyncedVideoPostInfosToAPI$ = createEffect(() => this.actions$.pipe(
		ofType(uploadVideoPostInfos),
		withLatestFrom(this.store),
		concatMap(async ([action, state]) => {
			const userId = state.user?.currentUser?.id;
			if (!userId) return;
			const videoPostInfoDbs: VideoPostInfoDb[] = await this.db.getUnsyncedVideoPostInfos(userId);
			if (!videoPostInfoDbs?.length) return;
			const groupedByVideoId = this.groupByArray(videoPostInfoDbs, 'videoId');
			for (const grp of groupedByVideoId){
				console.log('Found ' + grp.values.length + ' unsynced videoPostInfoDb records for videoId = ' + grp.values[0].videoId);
			}
			for (const grp of groupedByVideoId){
				const progressPercent = await this.progressSvc.postVideoProgress(grp.values as VideoPostInfo[]).toPromise();
				if (typeof progressPercent === 'number' && progressPercent >= 0) {
					this.store.dispatch(actions.updateCourseContentProgress({
						courseSystemId: grp.values[0].courseId,
						contentSystemId: grp.values[0].contentId,
						progressPercentage: progressPercent,
						completedThreshold: 0.8,
						started: true,
					}));

					// purge the records that were just successfully synced
					await this.db.videoPostInfo.bulkDelete(grp.values.map(x => x.id));
				}else{
					try{
						console.error(`There was a problem with the data, or auth, or something. (${grp.values.length} entries for videoId=${grp.key})`);
					} catch (e){
						console.error('fho34:' + e.toString());
					}
					break;
				}
			}
		}),
	), {dispatch: false});

	//TODO handle quiz calc

	constructor(
		private actions$: Actions, private store: Store<State>,
		private userDataService: UserDataService, private progressSvc: UserDataService
	) {}

	groupByArray<Type>(xs: Type[], propertyNameOrProjectionFunction: string | ((x: Type) => any)) {
		return xs.reduce(
			(previousValue: { key: any; values: Type[]; }[], currentElement: Type) =>
			{
				const groupingKey: any = propertyNameOrProjectionFunction instanceof Function ? propertyNameOrProjectionFunction(currentElement) : currentElement[propertyNameOrProjectionFunction];
				const existingGroup = previousValue.find((r) => r && r.key === groupingKey);
				if (existingGroup) {
					existingGroup.values.push(currentElement);
				} else {
					previousValue.push({ key: groupingKey, values: [currentElement] });
				}
				return previousValue;
			},
			[]);
	}
}
