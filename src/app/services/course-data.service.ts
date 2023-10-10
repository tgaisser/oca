import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {get} from 'lodash';
import {CourseProgress} from '../common/models';
import {makeStateKey, TransferState} from '@angular/platform-browser';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {MultimediaItem} from 'hc-video-player';
import {Params} from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class CourseDataService {
	public static SUBJECT_LIST = [
		{title: 'Politics', codename: 'politics'},
		{title: 'History', codename: 'history'},
		{title: 'Literature', codename: 'literature'},
		{title: 'Philosophy & Religion', codename: 'philosophy___religion'},
		{title: 'Economics', codename: 'economics'},
		{title: 'Mathematics & Natural Sciences', codename: 'the_natural_sciences'}
	];

	constructor(
		private httpService: HttpClient, private transferState: TransferState,
		@Inject(PLATFORM_ID) private _platformId
	) { }

	static cleanEmptyHtmlText(text: string) {
		if (!text) return '';
		const cleanText = text.trim();
		if (cleanText === '<p><br></p>') return '';

		return cleanText;
	}

	/**
	 * Parse the response from Kentico's response into a more standard JS Object
	 * @param item The item from Kentico
	 * @param modularContent The Modular Content from Kentico response
	 */
	static mapKenticoObject(item, modularContent) {
		const newObj = {} as any;

		newObj.system_id = item.system.id;
		newObj.system_type = item.system.type;
		newObj.system_name = item.system.name;
		newObj.system_codename = item.system.codename;
		newObj.system_last_modified = item.system.last_modified;
		Object.keys(item.elements).forEach(k => {
			if (!item.elements[k]) {
				newObj[k] = null;
			} else if (item.elements[k].type === 'modular_content') {
				newObj[k] = item.elements[k].value.map(modK => {
					if (modularContent && modularContent[modK]) {
						return CourseDataService.mapKenticoObject(modularContent[modK], modularContent);
					} else {
						return modK;
					}
				});
			} else if (item.elements[k].type === 'custom' && k === 'attributions') {
				if (!item.elements[k].value){
					newObj[k] = [];
				}else {
					try {
						// parses into array of CreativeCredit objects
						newObj[k] = JSON.parse(item.elements[k].value);
					} catch (e) {
						console.error(e.toString());
						newObj[k] = [];
					}
				}
			} else if (Array.isArray(item.elements[k].value) && item.elements[k].type === 'asset') {
				newObj[k] = item.elements[k].value;
			} else {
				// TODO handle multiple_choice
				// TODO do we need name?

				//TODO is useful or does ngrx handle this for me?
				if (k.endsWith('_date') && typeof item.elements[k].value === 'string') {
					try {
						const newDate = new Date(item.elements[k].value);
						if (newDate instanceof Date && !isNaN(newDate as any)) {
							newObj[k] = newDate;
							return;
						}
					} catch (e) {
						console.error(`unable to parse ${k} (${item.elements[k].value} to date`);
					}
				}

				newObj[k] = item.elements[k].value;
			}
		});

		if (newObj.system_type === 'lecture') {
			newObj.quiz = get(newObj, 'quiz[0]', null);
			newObj.study_guide = get(newObj, 'study_guide[0]', null);
			newObj.recommended_readings = get(newObj, 'recommended_readings', null);
			newObj.discussion_questions = CourseDataService.cleanEmptyHtmlText(newObj.discussion_questions);
			//TODO metadata_id
		}
		if (newObj.system_type === 'course') {
			newObj.catalog_image = get(newObj, 'catalog_image[0]', null);
			newObj.hide_from_catalog = get(newObj, 'hide_from_catalog[0]', {codename: 'no'}).codename === 'yes';
			newObj.dvd_catalog_image = get(newObj, 'dvd_catalog_image[0]', null);
			newObj.final_quiz = get(newObj, 'final_quiz[0]', null);
			newObj.study_guide = get(newObj, 'study_guide[0]', null);
			newObj.featured_course = get(newObj, 'featured_course[0]', {codename: 'no'}) === 'yes';
			newObj.pluralize_course_companion_button = get(newObj, 'pluralize_course_companion_button[0].codename', {codename: 'no'}) === 'yes';
			newObj.overview = CourseDataService.cleanEmptyHtmlText(newObj.overview);
			newObj.about_text = CourseDataService.cleanEmptyHtmlText(newObj.about_text);
			newObj.small_text = CourseDataService.cleanEmptyHtmlText(newObj.small_text);
			newObj.medium_text = CourseDataService.cleanEmptyHtmlText(newObj.medium_text);
			newObj.study_group_body_text = CourseDataService.cleanEmptyHtmlText(newObj.study_group_body_text);
		}

		if (newObj.system_type === 'page_home') {
			newObj.banner_image = get(newObj, 'banner_image[0]', null);
		}

		if (newObj.system_type === 'page___home_v2') {
			newObj.banner_image = get(newObj, 'banner_image[0]', null);
			newObj.welcome_text = CourseDataService.cleanEmptyHtmlText(newObj.welcome_text);
			newObj.welcome_fallback_image = get(newObj, 'welcome_fallback_image[0]', null);
			newObj.welcome_text__signed_in_ = CourseDataService.cleanEmptyHtmlText(newObj.welcome_text__signed_in_);
			newObj.welcome_fallback_image__signed_in_ = get(newObj, 'welcome_fallback_image__signed_in_[0]', null);
			newObj.introduction_text = CourseDataService.cleanEmptyHtmlText(newObj.introduction_text);
			newObj.introduction_fallback_image = get(newObj, 'introduction_fallback_image[0]', null);
			newObj.announcement_text = CourseDataService.cleanEmptyHtmlText(newObj.announcement_text);
			newObj.announcement_fallback_image = get(newObj, 'announcement_fallback_image[0]', null);
			newObj.cta_text = CourseDataService.cleanEmptyHtmlText(newObj.cta_text);

			newObj.welcome_button_url__signed_in_ = newObj.welcome_button_url__signed_in_.replace('https://online.hillsdale.edu', '');
			if (!newObj.welcome_button_url__signed_in_.includes('http') && newObj.welcome_button_url__signed_in_.includes('?')) {
				const splitWelcomeButtonURL = newObj.welcome_button_url__signed_in_.split('?');
				newObj.welcome_button_url__signed_in_ = splitWelcomeButtonURL[0];
				newObj.welcome_button_url__signed_in___query_params_ = Object.fromEntries(new URLSearchParams(splitWelcomeButtonURL[1]));
			}
			newObj.introduction_button_url = newObj.introduction_button_url.replace('https://online.hillsdale.edu', '');
			if (!newObj.introduction_button_url.includes('http') && newObj.introduction_button_url.includes('?')) {
				const splitIntroductionButtonURL = newObj.introduction_button_url.split('?');
				newObj.introduction_button_url = splitIntroductionButtonURL[0];
				newObj.introduction_button_url__query_params_ = Object.fromEntries(new URLSearchParams(splitIntroductionButtonURL[1]));
			}
			newObj.announcement_button_url = newObj.announcement_button_url.replace('https://online.hillsdale.edu', '');
			if (!newObj.announcement_button_url.includes('http') && newObj.announcement_button_url.includes('?')) {
				const splitAnnouncementButtonURL = newObj.announcement_button_url.split('?');
				newObj.announcement_button_url = splitAnnouncementButtonURL[0];
				newObj.announcement_button_url__query_params_ = Object.fromEntries(new URLSearchParams(splitAnnouncementButtonURL[1]));
			}
		}

		if (newObj.system_type === 'page_about') {
			newObj.n1st_row_image = get(newObj, 'n1st_row_image[0]', null);
			newObj.n2nd_row_image = get(newObj, 'n2nd_row_image[0]', null);
			newObj.n3rd_row_image = get(newObj, 'n3rd_row_image[0]', null);

			newObj.n1st_row_button = get(newObj, 'n1st_row_button[0]', null);
			newObj.n2nd_row_button = get(newObj, 'n2nd_row_button[0]', null);
			newObj.n3rd_row_button = get(newObj, 'n3rd_row_button[0]', null);
			newObj.n4th_row_button = get(newObj, 'n4th_row_button[0]', null);
			newObj.n5th_row_button = get(newObj, 'n5th_row_button[0]', null);
			newObj.n6th_row_button = get(newObj, 'n6th_row_button[0]', null);

			if (newObj.n1st_row_button) {
				newObj.n1st_row_button.open_in_new_tab = get(newObj, 'n1st_row_button.open_in_new_tab[0].codename', {codename: 'no'}) === 'yes';

				if (!newObj.n1st_row_button.open_in_new_tab) {
					newObj.n1st_row_button.link = newObj.n1st_row_button.link.replace(/^(.*)online.hillsdale.edu\/?/g, '/');
				}
			}

			if (newObj.n2nd_row_button) {
				newObj.n2nd_row_button.open_in_new_tab = get(newObj, 'n2nd_row_button.open_in_new_tab[0].codename', {codename: 'no'}) === 'yes';

				if (newObj.n2nd_row_button.open_in_new_tab) {
					newObj.n2nd_row_button.link = newObj.n2nd_row_button.link.replace(/^(.*)online.hillsdale.edu\/?/g, '/');
				}
			}

			if (newObj.n3rd_row_button) {
				newObj.n3rd_row_button.open_in_new_tab = get(newObj, 'n3rd_row_button.open_in_new_tab[0].codename', {codename: 'no'}) === 'yes';
				if (newObj.n3rd_row_button.open_in_new_tab) {
					newObj.n3rd_row_button.link = newObj.n3rd_row_button.link.replace(/^(.*)online.hillsdale.edu\/?/g, '/');
				}
			}

			if (newObj.n4th_row_button) {
				newObj.n4th_row_button.open_in_new_tab = get(newObj, 'n4th_row_button.open_in_new_tab[0].codename', {codename: 'no'}) === 'yes';

				if (newObj.n4th_row_button.open_in_new_tab) {
					newObj.n4th_row_button.link = newObj.n4th_row_button.link.replace(/^(.*)online.hillsdale.edu\/?/g, '/');
				}
			}
			if (newObj.n5th_row_button) {
				newObj.n5th_row_button.open_in_new_tab = get(newObj, 'n5th_row_button.open_in_new_tab[0].codename', {codename: 'no'}) === 'yes';

				if (newObj.n5th_row_button.open_in_new_tab) {
					newObj.n5th_row_button.link = newObj.n5th_row_button.link.replace(/^(.*)online.hillsdale.edu\/?/g, '/');
				}
			}
			if (newObj.n6th_row_button) {
				newObj.n6th_row_button.open_in_new_tab = get(newObj, 'n6th_row_button.open_in_new_tab[0].codename', {codename: 'no'}) === 'yes';

				if (newObj.n6th_row_button.open_in_new_tab) {
					newObj.n6th_row_button.link = newObj.n6th_row_button.link.replace(/^(.*)online.hillsdale.edu\/?/g, '/');
				}
			}
		}

		if (newObj.system_type === 'page___learn') {
			newObj.banner_image = get(newObj, 'banner_image[0]', null);
		}

		if (newObj.system_type === 'page_dvd_catalog') {
			newObj.highlighted_product_image = get(newObj, 'highlighted_product_image[0]', null);
		}

		if (newObj.system_type === 'qa') {
			newObj.overview = CourseDataService.cleanEmptyHtmlText(newObj.overview);
		}

		if (newObj.system_type === 'quiz') {
			newObj.description = CourseDataService.cleanEmptyHtmlText(newObj.description);
		}

		if (newObj.system_type === 'quiz_question') {
			newObj.answer = get(newObj, 'answer[0].codename', '');

			newObj.extra_details = CourseDataService.cleanEmptyHtmlText(newObj.extra_details);
		}

		if (newObj.system_type === 'study_group') {
			newObj.study_group_syllabus = get(newObj, 'study_group_syllabus[0]', null);
			newObj.essay_contest_pdf = get(newObj, 'essay_contest_pdf[0]', null);
		}
		if (newObj.system_type === 'study_group_session') {
			newObj.discussion_questions = CourseDataService.cleanEmptyHtmlText(newObj.discussion_questions);
			if (typeof newObj.lecture_ids === 'undefined' || newObj.lecture_ids === null) {
				newObj.lecture_ids = [];
			}
			if (typeof newObj.optional_lectures === 'undefined') {
				newObj.optional_lectures = [];
			}
		}

		if (newObj.system_type === 'partnership') {
			newObj.partner_logo = get(newObj, 'partner_logo[0]', null);
			newObj.banner_image = get(newObj, 'banner_image[0]', null);
			newObj.banner_description = CourseDataService.cleanEmptyHtmlText(newObj.banner_description);
			newObj.final_cta_description = CourseDataService.cleanEmptyHtmlText(newObj.final_cta_description);
			newObj.additional_partnership_info = CourseDataService.cleanEmptyHtmlText(newObj.additional_partnership_info);
			newObj.social_graph_image = get(newObj, 'social_graph_image[0]', null);

			get(newObj, 'recommended_courses', null).forEach(rc => {
				// console.log('DEBUG Partner Recommended Course before: ', rc);
				if (rc.system_type === 'course') {
					rc = { course: rc } as LandingPageRecommendedCourse;
				}
				// console.log('DEBUG Partner Recommended Course after: ', rc);
			});

			newObj.recommended_courses = get(newObj, 'recommended_courses', null).map(rc => {
				return rc.system_type === 'course' ? { course: rc } as LandingPageRecommendedCourse : rc;
			});
		}

		if (newObj.system_type === 'tv_ad___landing_page') {
			newObj.banner_image = get(newObj, 'banner_image[0]', null);
			newObj.banner_cta_description = CourseDataService.cleanEmptyHtmlText(newObj.banner_cta_description);
			newObj.final_cta_description = CourseDataService.cleanEmptyHtmlText(newObj.final_cta_description);
			newObj.social_graph_image = get(newObj, 'social_graph_image[0]', null);
		}

		if (newObj.system_type === 'landing_page___tv_ad__extended_') {
			newObj.banner_image = get(newObj, 'banner_image[0]', null);
			newObj.banner_cta_description = CourseDataService.cleanEmptyHtmlText(newObj.banner_cta_description);
			newObj.donation_cta = get(newObj, 'donation_cta[0]', null);
			newObj.logos = get(newObj, 'logos[0]', null);
			newObj.dvd_cta = get(newObj, 'dvd_cta[0]', null);
			newObj.final_cta_description = CourseDataService.cleanEmptyHtmlText(newObj.final_cta_description);
			newObj.social_graph_image = get(newObj, 'social_graph_image[0]', null);
		}

		if (newObj.system_type === 'landing_page_utility___content_row') {
			newObj.text_content = CourseDataService.cleanEmptyHtmlText(newObj.text_content);
			newObj.image_content = get(newObj, 'image_content[0]', null);
			newObj.row_background_color = get(newObj, 'row_background_color[0].codename', '');
		}

		if (newObj.system_type === 'landing_page_utility___dvd_cta') {
			newObj.course = get(newObj, 'course[0]', null);
			newObj.cta_text = CourseDataService.cleanEmptyHtmlText(newObj.cta_text);
		}

		if (newObj.system_type === 'landing_page_utility___logo') {
			newObj.entity_logo_image = get(newObj, 'entity_logo_image[0]', null);
		}

		if (newObj.system_type === 'landing_page_utility___logo_row') {
			newObj.text_content = CourseDataService.cleanEmptyHtmlText(newObj.text_content);
		}

		if (newObj.system_type === 'tv_ad___recommended_course') {
			newObj.course = get(newObj, 'course[0]', null);
			newObj.custom_description = CourseDataService.cleanEmptyHtmlText(newObj.custom_description);
			newObj.custom_image = get(newObj, 'custom_image[0]', null);
		}

		return newObj;
	}

	static getKenticoParams(kenticoFilters: KenticoFilters): HttpParams {
		let params = new HttpParams();
		if (typeof kenticoFilters.depth === 'number') params = params.append('depth', kenticoFilters.depth.toString());
		if (kenticoFilters.itemId) params = params.append('system.id', kenticoFilters.itemId);
		if (kenticoFilters.type) params = params.append('system.type', kenticoFilters.type);
		if (kenticoFilters.elements && kenticoFilters.elements.length) params = params.append('elements', kenticoFilters.elements.join(','));
		if (kenticoFilters.slug) params = params.append('elements.url_slug', kenticoFilters.slug);
		if (kenticoFilters.elementQueries) {
			params = Object.keys(kenticoFilters.elementQueries)
				.map(key => [`elements.${key}`, kenticoFilters.elementQueries[key]])
				.reduce((agg, cur) => agg.append(cur[0], cur[1]), params);
		}
		if (kenticoFilters.limit) params = params.append('limit', kenticoFilters.limit);

		return params;
	}

	static getKenticoHeaders(): HttpHeaders {
		let headers = new HttpHeaders();
		if (environment.kenticoToken) {
			headers = headers.append('Authorization', `Bearer ${environment.kenticoToken}`);
		}
		return headers;
	}

	static courseIsPreEnrollWithDefault(course: Course, isEarlyEnroll = false): boolean {
		const now = new Date();
		return isEarlyEnroll ?
			!this.hasEarlyAccessDatePassed(course) :
			!this.hasPublicationDatePassed(course);
	}

	static hasPublicationDatePassed(course: Course): boolean {
		return course.publication_date && course.publication_date < new Date();
	}

	static hasEarlyAccessDatePassed(course: Course): boolean {
		return course.early_access_date && course.early_access_date < new Date();
	}

	static hasPreRegDatePassed(course: Course): boolean {
		return course.pre_reg_date && course.pre_reg_date < new Date();
	}

	static isInPreRegPageCampaignWindow(course: Course): boolean {
		return !!course
		&& !!course.prereg_page_campaign_start_date
		&& course.prereg_page_campaign_start_date < new Date()
		&& !!course.prereg_page_campaign_end_date
		&& course.prereg_page_campaign_end_date > new Date();
	}

	static courseIsPreEnroll(course: Course): boolean {
		return this.courseIsPreEnrollWithDefault(course, course.userHasEarlyAccess);
	}

	static isInPreRegWindow(course: Course): boolean {
		return this.hasPreRegDatePassed(course) && !this.hasPublicationDatePassed(course);
	}

	static getAccessDateWithDefault(course: Course, isEarlyAccess = false): Date {
		return isEarlyAccess ? course.early_access_date : course.publication_date;
	}

	static getAccessDateForCurrentUser(course: Course): Date {
		return course.userHasEarlyAccess ? course.early_access_date : course.publication_date;
	}

	static getAccessDate(course: Course): Date {
		return this.getAccessDateWithDefault(course, course.userHasEarlyAccess);
	}

	static userHasAccessToFullCourse(c: Course): boolean {
		if(this.hasPublicationDatePassed(c))
			return true;
		else if(this.hasEarlyAccessDatePassed(c) && c.userHasEarlyAccess)
			return true;
		else
			return false;
	}

	static isInEarlyAccessWindow(course: Course): boolean {
		const now = new Date();
		return this.hasEarlyAccessDatePassed(course) && !this.hasPublicationDatePassed(course);
	}

	static getCourseStatus(course: Course): CourseStatus {
		if(CourseDataService.hasPublicationDatePassed(course)) return CourseStatus.published;
		else if(CourseDataService.hasEarlyAccessDatePassed(course)) return CourseStatus.early_access;
		else if(CourseDataService.hasPreRegDatePassed(course)) return CourseStatus.pre_reg;
		else 												 return null;
	}

	static getKenticoStateKey(base: string, params) {
		// const paramsStr = params.keys().map(k => `${k}=${params.get(k)}`).join('&');
		// console.log('making state key', `${base}|params:${params.toString()}`);
		return makeStateKey(`${base}|params:${params.toString()}`);
	}

	static fixDates(obj: unknown) {
		if (!obj) return;
		for (const k of Object.getOwnPropertyNames(obj)) {
			const type = typeof obj[k];
			if (type === 'string' && k.endsWith('_date')) {
				try {
					const newDate = new Date(obj[k]);
					if (newDate instanceof Date && !isNaN(newDate as any)) {
						obj[k] = newDate;
					}
				} catch (e) {
					console.error(`unable to parse ${k} (${obj[k]} to date`);
				}
			} else if (type === 'object') {
				CourseDataService.fixDates(obj[k]);
			}
		}
	}

	getKenticoObject(itemId: string, kenticoFilters: KenticoFilters) {
		const params = CourseDataService.getKenticoParams(kenticoFilters);

		const stateKey = CourseDataService.getKenticoStateKey(`item-${itemId}`, params);
		if (isPlatformBrowser(this._platformId) && this.transferState.hasKey(stateKey)){
			const val = this.transferState.get<KenticoObject>(stateKey, {
				system_id: '',
				system_codename: '',
				system_last_modified: new Date().toISOString(),
				system_name: '',
				system_type: ''
			});
			//since data changes will cause an add reload, we don't need to ever explicitly remove cache. The deploy auto-refresh will do that.
			//this.transferState.remove(stateKey);

			CourseDataService.fixDates(val);

			return of(val);
		}

		const headers = CourseDataService.getKenticoHeaders();

		return this.httpService.get<KenticoResponse>(`${environment.kenticoRoot}/items/${itemId}`, {params, headers}).pipe(
			map(r => CourseDataService.mapKenticoObject(r.item, r.modular_content)),
			tap(obj => {
				if (isPlatformServer(this._platformId) && obj != null) {
					this.transferState.set<KenticoObject>(stateKey, obj);
				}
			})
		);
	}
	getKenticoObjects(kenticoFilters: KenticoFilters) {
		const params = CourseDataService.getKenticoParams(kenticoFilters);
		const headers = CourseDataService.getKenticoHeaders();

		// const list = params.keys().map(k => `${k}-${params.get(k)}`);
		const stateKey = CourseDataService.getKenticoStateKey('items', params);

		if (isPlatformBrowser(this._platformId) && this.transferState.hasKey(stateKey)) {
			const val = this.transferState.get<KenticoObject[]>(stateKey, []);
			//since data changes will cause an add reload, we don't need to ever explicitly remove cache. The deploy auto-refresh will do that.
			//this.transferState.remove(stateKey);

			val.forEach(o => CourseDataService.fixDates(o));

			return of(val);
		}

		return this.httpService.get<KenticoMultiResponse>(`${environment.kenticoRoot}/items`, {params, headers}).pipe(
			map(r => r.items.map(i => CourseDataService.mapKenticoObject(i, r.modular_content))),
			tap(obj => {
				if (isPlatformServer(this._platformId) && obj != null) {
					this.transferState.set<KenticoObject[]>(stateKey, obj);
				}
			})
		);
	}


	getPageAbout(): Observable<PageAbout> {
		return this.getKenticoObject('about_page', {depth: 1});
	}

	getPageLearn(): Observable<PageLearn> {
		return this.getKenticoObject('learn_page', {depth: 1});
	}

	getPageDvdCatalog(): Observable<PageDvdCatalog> {
		return this.getKenticoObject('dvd_catalog_page', {depth: 1});
	}

	getPageHelp(): Observable<PageHelp> {
		return this.getKenticoObject('help_page', {depth: 1});
	}

	getPageHome(): Observable<PageHome> {
		return this.getKenticoObject('home_page__v2_', {depth: 1});
	}

	getPagePolicies(): Observable<PagePolicies> {
		return this.getKenticoObject('privacy_policy_page', {depth: 1});
	}
	getMultiMediaObjects(): Observable<MultimediaItem[]> {
		/*const stateKey = makeStateKey('multimedia');

		if (isPlatformBrowser(this._platformId) && this.transferState.hasKey(stateKey)) {
			const val = this.transferState.get<MultimediaItem[]>(stateKey, []);
			this.transferState.remove(stateKey);
			return of(val);
		}*/

		return this.httpService.get<MultimediaItem[]>(`${environment.staticFileRootUrl}mm/all.json`).pipe(
			tap(items => {
				//replace url with local cache if necessary
				items?.forEach(i => {
					if (i.poster_url) {
						i.poster_url = i.poster_url.replace(environment.kontentAssetReplace.regex, environment.kontentAssetReplace.replacement);
					}
				});
			})
		)/*.pipe(
			tap(obj => {
				if (isPlatformServer(this._platformId) && obj != null) {
					console.log('server setting mm');
					this.transferState.set<MultimediaItem[]>(stateKey, obj);
				}
			})
		)*/;
	}

	getPartnership(landingPageSlug: string): Observable<Partnership> {
		return this.getKenticoObjects({type: 'partnership', depth: 2, elementQueries: {landing_page_slug: landingPageSlug}}).pipe(
			map(ps => ps[0]),
		);
	}

	getTvAdLandingPage(landingPageSlug: string): Observable<TvAdLandingPage> {
		return this.getKenticoObjects({type: 'tv_ad___landing_page', depth: 2, elementQueries: {landing_page_slug: landingPageSlug}}).pipe(
			map(tvAd => tvAd[0]),
		);
	}

	getTvAdExtendedLandingPage(landingPageSlug: string): Observable<TvAdExtendedLandingPage> {
		return this.getKenticoObjects({type: 'landing_page___tv_ad__extended_', depth: 3, elementQueries: {landing_page_slug: landingPageSlug}}).pipe(
			map(tvAdExt => tvAdExt[0]),
		);
	}

	getInstructors(): Observable<Instructor[]> {
		return this.getKenticoObjects({type: 'instructor', depth: 1});
	}
}


class KenticoMultiResponse {items: any[]; pagination: any; modular_content: any; }

class KenticoResponse {item: any; pagination: any; modular_content: any; }

class KenticoFilters {
	itemId?: string;
	type?: string;
	elements?: string[];
	elementQueries?: {[key: string]: string};
	depth?: number;
	slug?: string;
	limit?: number;
}

export interface KenticoObject {
	system_id: string;
	system_type: string;
	system_name: string;
	system_codename: string;
	system_last_modified: string;
}

export interface KenticoAsset {
	name: string;
	type: string;
	size: number;
	description: string;
	url: string;
	width: number;
	height: number;
}

export interface KontentSelectProperty {
	name: string;
	codename: string;
}
export enum CourseStatus {
	published,
	pre_reg,
	early_access
}

export interface CourseSubject extends  KontentSelectProperty { }
export interface Course extends KenticoObject {
	meta_description: string;
	publication_date: Date;
	early_access_date: Date;
	title: string;
	url_slug: string;
	hubspot_key: string;
	featured_course: boolean;
	hide_from_catalog: boolean;
	course_subject: CourseSubject[];
	catalog_image: KenticoAsset;
	course_trailer_id: string;
	course_trailer?: MultimediaItem;
	intro_text?: string;
	about_text?: string;
	small_text?: string;
	medium_text?: string;
	form_cta_text?: string;
	overview: string;
	estimated_course_ttc: number;
	instructors: Instructor[];
	lectures: CourseLecture[];
	final_quiz: CourseQuiz;
	study_guide: KenticoAsset;
	cta_embed_code: string;

	pre_reg_date?: Date;
	pre_reg_intro_text?: string;
	pre_reg_about_text?: string;
	pre_reg_form_cta_text?: string;
	pre_reg_text_above_countdown_timer?: string;
	pre_reg_countdown_timer_embed_code?: string;
	pre_reg_donation_url?: string;
	prereg_page_campaign_start_date?: Date;
	prereg_page_campaign_end_date?: Date;

	search_keywords: string;
	lengthy_course: KontentSelectProperty[];
	course_donation_url: string;
	course_companion_donation_url: string;
	pluralize_course_companion_button: boolean;
	course_dvd_donation_url: string;
	dvd_donation_url___catalog_page: string;
	dvd_catalog_image: KenticoAsset;
	dvd_catalog_description: string;
	course_study_guide_donation_url: string;

	course_sponsor: string;
	share_campaign_utm_code: string;

	enrolled: boolean;
	userHasEarlyAccess?: boolean;
	progress?: CourseProgress;

	study_group_headline: string;
	study_group_body_text: string;
	study_group_cta_text: string;
}

export interface Instructor extends KenticoObject {
	prefix: string;
	first_name: string;
	middle_name: string;
	last_name: string;
	suffix: string;
	short_bio: string;
	long_bio: string;
	profile_photo: string[];
}

export interface CourseContent extends KenticoObject {
	title: string;

	//TODO is this correct? It's needed to compile (used in course-catalog-entry.component)
	url_slug: string;
	progress?: CourseProgress;
}

export interface MultimediaHaver {
	multimedia: MultimediaItem;
	multimedia_id: string;
}

export interface DescriptionHaver {
	meta_description: string;
}

export interface CourseLecture extends CourseContent, MultimediaHaver {
	study_guide: KenticoAsset;
	url_slug: string;
	overview: string;
	duration: string;
	// TODO fill video stuff
	video_service: string;

	recommended_readings: KenticoAsset[];
	discussion_questions: string;
	instructors: Instructor[];
	supplementary_videos: SupplementalVideo[];
	quiz: CourseQuiz; //TODO limit this to one
	podcast?: KenticoAsset;
	attributions: CreativeCredit[];
	search_keywords: string;
}

export interface SupplementalVideo extends CourseContent, MultimediaHaver {
	url_slug: string;
	overview: string;
	duration: string;
	// TODO fill video stuff
	video_id: string;
	audio_url: string;
	soundcloud_track_id: string;
	soundcloud_track_secret_token: string;
	audio_download_filename?: string;
}

export interface CourseQuiz extends CourseContent {
	quiz_id: string;
	questions: QuizQuestion[];
	description: string;
}

export interface QuizQuestion extends KenticoObject {
	answer_video_position?: number;
	question: string;
	option_1: string;
	option_2: string;
	option_3: string;
	option_4: string;
	option_5: string;
	answer: string;

	options?: string[];
	extra_details: string;
}

export interface OCPage extends KenticoObject, DescriptionHaver {
	meta_description: string;
}
export interface OCPageWithTitle extends OCPage {
	page_title: string;
}

export interface PageAbout extends OCPageWithTitle {
	main_page_content: TextBlock[];
	n1st_row_content: string;
	n1st_row_button: Button;
	n1st_row_image: KenticoAsset;
	n2nd_row_content: string;
	n2nd_row_button: Button;
	n2nd_row_image: KenticoAsset;
	n3rd_row_content: string;
	n3rd_row_button: Button;
	n3rd_row_image: KenticoAsset;
	n4th_row_content: string;
	n4th_row_button: Button;
	n4th_row_video_embed_url: string;
	n5th_row_content: string;
	n5th_row_button: Button;
	n6th_row_content: string;
	n6th_row_button: Button;
}

export interface PageLearn extends OCPage {
	banner_image: KenticoAsset;
	landing___left_column_text: string;
	thank_you___main_body_text: string;
}

export interface PageDvdCatalog extends OCPageWithTitle {
	highlighted_product_title: string;
	highlighted_product_description: string;
	highlighted_product_url: string;
	highlighted_product_image: KenticoAsset;
	main_page_content: TextBlock[];
	listed_dvds: Course[];
}

export interface PageHelp extends OCPageWithTitle {
	main_page_content: TextBlock[];
	faqs: FAQ[];
}

export interface PageHome extends OCPage {
	banner_image: KenticoAsset;
	welcome_title: string;
	welcome_text: string;
	welcome_video_embed_url: string;
	welcome_fallback_image: KenticoAsset;

	welcome_text__signed_in_: string;
	welcome_video_embed_url__signed_in_: string;
	welcome_fallback_image__signed_in_: KenticoAsset;
	welcome_button_text__signed_in_: string;
	welcome_button_url__signed_in_: string;
	welcome_button_url__signed_in___query_params_: Params;

	introduction_title: string;
	introduction_text: string;
	introduction_button_url: string;
	introduction_button_url__query_params_: Params;
	introduction_video_embed_url: string;
	introduction_fallback_image: KenticoAsset;

	featured_courses: Course[];

	announcement_title: string;
	announcement_text: string;
	announcement_button_url: string;
	announcement_button_url__query_params_: Params;
	announcement_video_embed_url: string;
	announcement_fallback_image: KenticoAsset;

	testimonials_title: string;
	testimonials_text: string;

	cta_title: string;
	cta_text: string;
}

export interface PagePolicies extends OCPageWithTitle {
	policies: Policy[];
}

export interface FAQ extends KenticoObject {
	question: string;
	answer: string;
}

export interface TextBlock extends KenticoObject {
	title: string;
	text: string;
}

export interface Button extends KenticoObject {
	text: string;
	link: string;
	open_in_new_tab: boolean;
}

export interface Policy extends KenticoObject {
	content: string;
}

export interface NavigationObject {
	type: string;
	title: string;
	slug: string;
}

export interface StudyGroup extends KenticoObject {
	course_id: string;
	introductory_body_text: string;
	intro_video_id: string;
	intro_video?: MultimediaItem;

	start_date: Date;
	end_date: Date;

	discussion_board_section_url: string;
	study_group_syllabus: KenticoAsset;
	pre_course_test_url: string;
	midterm_survey_url: string;
	midterm_survey_availability_date: Date;
	essay_contest_description: string;
	essay_contest_pdf: KenticoAsset;

	sessions: StudyGroupSession[];
}

export interface StudyGroupSession extends KenticoObject {
	title: string;
	available_date: Date;
	lecture_ids: string[];
	lectures?: CourseLecture[];
	optional_lectures?: CourseLecture[];
	podcast_id: string;
	podcast?: MultimediaItem;
	discussion_board_post_url: string;
	recommended_readings: KenticoAsset[];
	discussion_questions: string;
}

export interface Testimonial extends KenticoObject {
	title: string;
	user_name: string;
	user_location: string;
	message: string;
	referenced_course_id: string;
}

export interface Partnership extends KenticoObject {
	partner_name: string;
	partner_logo: KenticoAsset;

	banner_image: KenticoAsset;
	banner_title: string;
	banner_description: string;

	main_content: string;
	course_cta_text: string;

	recommended_courses: LandingPageRecommendedCourse[];
	faqs: FAQ[];

	final_cta_title: string;
	final_cta_description: string;

	additional_partnership_info: string;

	landing_page_slug: string;
	meta_description: string;
	social_graph_image: KenticoAsset;
}

export interface TvAdLandingPage extends KenticoObject {
	tv_ad_name: string;

	banner_image: KenticoAsset;
	banner_cta_title: string;
	banner_cta_description: string;

	recommended_courses: LandingPageRecommendedCourse[];
	faqs: FAQ[];

	final_cta_title: string;
	final_cta_description: string;

	landing_page_slug: string;
	meta_description: string;
	social_graph_image: KenticoAsset;
}

export interface TvAdExtendedLandingPage extends KenticoObject {
	tv_ad_name: string;

	banner_image: KenticoAsset;
	banner_cta_title: string;
	banner_cta_description: string;

	donation_cta: LandingPageUtilityDonationCTA;
	content_rows: LandingPageUtilityContentRow[];
	recommended_courses: LandingPageRecommendedCourse[];
	logos: LandingPageUtilityLogoRow;
	dvd_cta: LandingPageUtilityDVDCTA;
	faqs: FAQ[];

	final_cta_title: string;
	final_cta_description: string;

	landing_page_slug: string;
	meta_description: string;
	social_graph_image: KenticoAsset;
}

export interface LandingPageUtilityContentRow extends KenticoObject {
	text_content: string;
	image_content: KenticoAsset;
	row_background_color: string;

	course?: Course;
}

export interface LandingPageUtilityDonationCTA extends KenticoObject {
	cta_text: string;
	cta_button_text: string;
	cta_button_url: string;
}

export interface LandingPageUtilityDVDCTA extends KenticoObject {
	course: Course;
	cta_title: string;
	cta_text: string;
	cta_button_text: string;
	cta_button_url: string;
}

export interface LandingPageUtilityLogo extends KenticoObject {
	entity_name: string;
	entity_logo_image: KenticoAsset;
}

export interface LandingPageUtilityLogoRow extends KenticoObject {
	text_content: string;
	logos: LandingPageUtilityLogo[];
}

export interface LandingPageRecommendedCourse extends KenticoObject {
	course: Course;
	custom_description: string;
	custom_image: KenticoAsset;
}


export interface CreativeCredit {
	media_title: string;
	media_url: string;
	creator: string;
	source: string;
	license: string;
	video_position: string;
}
