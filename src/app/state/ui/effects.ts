import {Actions, createEffect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {State} from '../index';
import {Inject, Injectable} from '@angular/core';
import {catchError, debounceTime, filter, map, mergeMap, pairwise, startWith, tap, withLatestFrom} from 'rxjs/operators';

import * as sidebar from './actions';
import {CourseDataService} from '../../services/course-data.service';
import {setHomePage} from './actions';
import {EMPTY} from 'rxjs';
import {LOCAL_STORAGE} from '../../common/models';
import {RxjsHelperService} from '../../services/rxjs-helper.service';
// import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

const sidebarStatusKey = 'side-bar-selection-status';



@Injectable()
export class SidebarEffects {
	//check for sidebar save
	initialize$ = createEffect(() => this.actions$.pipe(
		ofType(ROOT_EFFECTS_INIT),
		map(() => sidebar.loadSidebarStatus())
	));

	sidebarLoader$ = createEffect(() => this.actions$.pipe(
		ofType(sidebar.loadSidebarStatus),
		map(action => this.localStorage.getItem(sidebarStatusKey)),
		filter(savedStatus => savedStatus && savedStatus === 'false'),
		map(status => sidebar.closeSidebar())
	));

	statusChangeSaver$ = createEffect(() => this.actions$.pipe(
		ofType(sidebar.closeSidebar, sidebar.openSidebar),
		withLatestFrom(this.store),
		//don't try to save any changes if mobile
		filter(([action, state]) => state.ui.isDesktop),
		tap(([action, state]) => {
			this.localStorage.setItem(
				sidebarStatusKey,
				JSON.stringify(action.type === sidebar.openSidebar.type)
			);
		})
	), {dispatch: false});

	mobileToggler$ = createEffect(() => this.actions$.pipe(
		ofType(sidebar.setIsDesktop),
		startWith({isDesktop: null}),
		pairwise(),
		filter(([previousAction, action]) => previousAction.isDesktop !== action.isDesktop),
		map(([prev, cur]) => cur),
		this.rxjsHelper.debounce(30),
		map(action => {
			if (action.isDesktop) {
				//on desktop, restore the sidebar to the saved value
				const savedStatus = this.localStorage.getItem(sidebarStatusKey);
				if (savedStatus && savedStatus === 'false') {
					return sidebar.closeSidebar();
				} else {
					return sidebar.openSidebar();
				}
			} else {
				//on mobile close the sidebar
				return sidebar.closeSidebar();
			}
		})
	));

	/*hasSidebar$ = createEffect(() => this.router.events.pipe(
		filter(event => event instanceof NavigationEnd),
		tap(event => {
			// this.store.dispatch(ui.setHasSidebar({hasSidebar: get(this.currentRoute, 'root.firstChild.snapshot.data.hasSidebar', false)}));
		})
	), {dispatch: false});*/

	getHomePage$ = createEffect(() => this.actions$.pipe(
		ofType(sidebar.getHomePage),
		mergeMap(() => this.courseDataSvc.getPageHome().pipe(
			map(p => setHomePage({homepage: p})),
			catchError(e => {
				console.log('Error getting home page', e);
				return EMPTY;
			})
		)),
	));

	constructor(
		private actions$: Actions,
		//private router: Router,
		// private currentRoute: ActivatedRoute,
		private store: Store<State>,
		private courseDataSvc: CourseDataService,
		@Inject(LOCAL_STORAGE) private localStorage: Storage,
		private rxjsHelper: RxjsHelperService
	) {

	}
}

