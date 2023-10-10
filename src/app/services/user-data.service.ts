import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {catchError, retry, tap} from 'rxjs/operators';
import {Observable, of, throwError} from 'rxjs';
import {FINAL_QUIZ_LECTURE_ID} from '../common/constants';
import {Course} from './course-data.service';
import {CookieService} from 'ngx-cookie-service';
import {User, UserMatch} from './user.service';
import {
	AltVideoResolutions,
	CourseEnrollment,
	CourseInquiry,
	CourseProgress,
	Note,
	QuizResult,
	SESSION_STORAGE,
	UserPreferences,
	WatchInfo,
	WithdrawalReason
} from '../common/models';
import {DOCUMENT} from '@angular/common';
import {WindowBehaviorService} from './window-behavior.service';
import {VideoPostInfo} from '../state/courses/actions';
import {UtmService} from './utm.service';

const jsonHeader = new HttpHeaders().set('Content-type', 'application/json');
const jsonIDTokenHeaders = jsonHeader.append('X-HC-UserInfo', '1');

const userUtmCodesKeys = ['utm_term', 'utm_source', 'utm_medium', 'utm_content', 'utm_campaign', 'appeal_code', 'sc', 'source_partner', 'gclid'];

@Injectable({
	providedIn: 'root'
})
export class UserDataService {

	constructor(
		private httpService: HttpClient, private cookieService: CookieService, private utmService: UtmService,
		@Inject(DOCUMENT) private document: Document, private windowBehaviorService: WindowBehaviorService,
		@Inject(SESSION_STORAGE) private sessionStorage: Storage
	) {
	}

	private static forceDataTypeOnNote(note: Note) {
		if (typeof note.createDate === 'string') note.createDate = new Date(note.createDate);
		if (typeof note.updateDate === 'string') note.updateDate = new Date(note.updateDate);
	}

	enrollInCourse(courseId: string, studyGroupId: string = null) {
		const body: { enroll: boolean, studyGroupId?: string } = {enroll: true};
		if (studyGroupId) {
			body.studyGroupId = studyGroupId;
		}
		return this.httpService.put<CourseEnrollment>(`${environment.dataStoreRoot}courses/${courseId}`,
			body,
			{
				headers: jsonIDTokenHeaders,
				params: this.utmService.getUtmParams(),
				withCredentials: true
			}
		).pipe(
			retry(3)
		);
	}

	validateAndUpdateEarlyAccess(courseId: string, earlyAccessToken: string): Observable<boolean> {
		return this.httpService.put<boolean>(`${environment.dataStoreRoot}courses/${courseId}/${earlyAccessToken}`,
			null,
			{
				headers: jsonIDTokenHeaders,
				params: this.utmService.getUtmParams(),
				withCredentials: true
			}).pipe(
			retry(1)
		);
	}

	inquireInCourse(courseId: string, email: string, earlyAccessToken?: string, studyGroupId?: string): Observable<CourseInquiry> {
		const body: { email: string, earlyAccessToken?: string, studyGroupId?: string } = {email};
		if (earlyAccessToken) {
			body.earlyAccessToken = earlyAccessToken;
		}
		if (studyGroupId) {
			body.studyGroupId = studyGroupId;
		}
		return this.httpService.put<CourseInquiry>(`${environment.dataStoreRoot}courses/${courseId}/inquiries`,
			body,
			{
				headers: jsonHeader,
				params: this.utmService.getUtmParams()
			}
		).pipe(
			retry(3)
		);
	}

	unenrollFromCourse(courseId: string, reason: number) {
		return this.httpService.put<CourseEnrollment>(`${environment.dataStoreRoot}courses/${courseId}`,
			{enroll: false, withdrawalReason: reason},
			{
				headers: jsonIDTokenHeaders,
				params: this.utmService.getUtmParams(),
				withCredentials: true
			}
		).pipe(
			retry(3)
		);
	}

	getCoursesProgress() {
		return this.httpService.get<CourseProgress[]>(
			`${environment.dataStoreRoot}courses/progress-new`
		).pipe(
			retry(3)
		);
	}


	/* istanbul ignore next */
	getEnrolledCourses() {
		return this.httpService.get<CourseEnrollment[]>(
			`${environment.dataStoreRoot}courses`
		).pipe(
			retry(3)
		);
	}

	getCourseProgress(courseId: string) {
		return this.httpService.get<CourseProgress>(
			`${environment.dataStoreRoot}courses/${courseId}/progress/new`
		).pipe(
			retry(3)
		);
	}

	getWithdrawalReasons() {
		return this.httpService.get<WithdrawalReason[]>(
			`${environment.dataStoreRoot}courses/withdrawal-reasons`
		).pipe(
			retry(3)
		);
	}

	markCourseOpen(courseId: string) {
		return this.httpService.put<boolean>(`${environment.dataStoreRoot}courses/${courseId}/progress`, true, {headers: jsonHeader});
	}

	markFileDownload(courseId: string, lectureId: string, fileUrl: string, fileType: string) {
		return this.httpService.post<boolean>(
			lectureId ?
				`${environment.dataStoreRoot}courses/${courseId}/progress/lecture/${lectureId}/files/${fileType}` :
				`${environment.dataStoreRoot}courses/${courseId}/progress/files/${fileType}`,
			JSON.stringify(fileUrl),
			{headers: jsonHeader}
		);
	}

	markLectureOpen(courseId: string, lectureId: string) {

		return this.httpService.put<boolean>(
			`${environment.dataStoreRoot}courses/${courseId}/progress/lecture/${lectureId}`,
			true,
			{headers: jsonHeader}
		);
	}

	mergeAccounts(accounts: UserMatch[]) {
		return this.httpService.put<boolean>(
			`${environment.dataStoreRoot}users/me/merge-accounts`,
			accounts,
			{headers: jsonHeader}
		);
	}

	markAccountsIgnored(accounts: UserMatch[]) {
		return this.httpService.put<boolean>(
			`${environment.dataStoreRoot}users/me/ignore-accounts`,
			accounts,
			{headers: jsonHeader}
		);
	}

	private submitHubspotForm(formId: number | string, fields: { [key: string]: string }) {
		const headers = new HttpHeaders().append('Content-Type', 'application/json');

		const allFields = {...this.utmService.getHubspotUtm(), ...fields};

		const url = `https://api.hsforms.com/submissions/v3/integration/submit/${environment.hubspotPortalId}/${formId}`;
		const form = {
			fields: Object.entries(allFields).map(([k, v]) => ({name: k, value: v.toString()})),
			context: {
				// include this parameter and set it to the hubspotutk cookie value to enable cookie tracking on your submission
				hutk: this.cookieService.get('hutk') || null,
				//TODO remove global references
				pageUri: this.windowBehaviorService.getCurrentUrl(),
				pageName: this.document ? this.document.title : 'Online Courses'
			},
			//TODO
			/*legalConsentOptions: {
				consent: { // Include this object when GDPR options are enabled
					consentToProcess: true,
					text: 'I agree to allow Example Company to store and process my personal data.',
					communications: [
						{
							value: true,
							subscriptionTypeId: 999,
							text: 'I agree to receive marketing communications from Example Company.'
						}
					]
				}
			}*/
		};
		return this.httpService.post(url, form, {headers});
	}

	markAccountVerified(email: string) {
		return this.submitHubspotForm(environment.hubspotAccountCreateForm, {email});
	}

	markCourseInquiry(email: string, course: Course) {
		return this.submitHubspotForm(environment.hubspotCourseInquiryForm, {
			email,
			online_courses_last_course_inquiry: course.hubspot_key
		});
	}

	markCourseStudyGroup(email: string, course: Course) {
		return this.submitHubspotForm(environment.hubspotCourseStudyGroupForm, {email, online_courses_study_groups: course.hubspot_key});
	}

	markProfileSubmit(user: User) {
		return this.submitHubspotForm(environment.hubspotProfileUpdateForm, {
			email: user.email,
			salutation: user.title,
			firstname: user.firstname,
			lastname: user.lastname,
			address: user.address,
			city: user.city,
			state: user.state,
			zip: user.zip
		});
	}

	markSocialSigninComplete(): Observable<boolean> {
		// console.log('current utm_codes', this.utmService.getSerializedCodes());
		return this.httpService.put<boolean>(
			`${environment.dataStoreRoot}users/me/social-signin`,
			this.utmService.getSerializedCodes(),
			{headers: jsonIDTokenHeaders}
		).pipe(
			catchError(e => {
				console.error('Got error posting signin info', e);
				return of(false);
			})
		);
	}


	postBulkVideoProgress(courseId: string, lectureId: string, videoId: string, type: string, records: WatchInfo[]): Observable<number> {
		return this.httpService.put<number>(
			`${environment.dataStoreRoot}courses/${courseId}/progress/${type}/${lectureId}/videos/${videoId}/bulk`,
			records,
			{headers: jsonHeader}
		).pipe(
			catchError(e => {
				console.error('Got error bulk posting video progress', e);
				return of(null);
			})
		);

	}

	postVideoProgress(vidPostInfos: VideoPostInfo[]): Observable<number> {
		const {courseId, contentId: lectureId, videoId, lectureType: type} = vidPostInfos[0];
		return this.httpService.put<number>(
			`${environment.dataStoreRoot}courses/${courseId}/progress/${type}/${lectureId}/videos/${videoId}`,
			vidPostInfos.map(x => ({videoPosition: x.progress, eventTime: x.eventTime})),
			{headers: jsonHeader}
		).pipe(
			catchError(e => {
				console.error('Got error posting video progress', e);
				return of(null);
			})
		);

	}


	getNotesInfo(courseId: string = null) {
		const rootUrl = `${environment.dataStoreRoot}notes/`;
		const url = rootUrl + (courseId ? courseId + '/' : '') + 'headers';
		return this.httpService.get<Note[]>(url).pipe(tap(notes => {
			notes.forEach(note => {
				if (typeof note.createDate === 'string') note.createDate = new Date(note.createDate);
				if (typeof note.updateDate === 'string') note.updateDate = new Date(note.updateDate);
			});
		}));
	}

	getNote(courseId: string, lectureId: string) {
		return this.httpService.get<Note>(`${environment.dataStoreRoot}notes/${courseId}/lectures/${lectureId}`).pipe(
			retry(3),
			tap(note => {
				if (typeof note.createDate === 'string') note.createDate = new Date(note.createDate);
				if (typeof note.updateDate === 'string') note.updateDate = new Date(note.updateDate);
			})
		);
	}

	getNotes(courseId: string) {
		return this.httpService.get<Note[]>(`${environment.dataStoreRoot}notes/${courseId}`).pipe(
			retry(3),
			tap(notes => notes.forEach(note => UserDataService.forceDataTypeOnNote(note)))
		);
	}

	saveNote(courseId: string, lectureId: string, text: string) {
		return this.httpService.put<Note>(
			`${environment.dataStoreRoot}notes/${courseId}/lectures/${lectureId}`,
			JSON.stringify(text),
			{headers: jsonHeader}
		).pipe(
			retry(3),
			tap(note => UserDataService.forceDataTypeOnNote(note)),
			catchError(e => {
				console.error('Got error saving note', e);
				throw new Error('Unable to save note. Please try again.');
			})
		);
	}

	getQuizResult(courseId: string, lectureId: string, quizName: string) {
		return this.httpService.get<QuizResult>(
			`${environment.dataStoreRoot}courses/${courseId}/lecture/${lectureId}/quiz/${quizName}`,
		);
	}

	getQuizResults(courseId: string) {
		return this.httpService.get<QuizResult[]>(
			`${environment.dataStoreRoot}courses/${courseId}/quizzes`,
		);
	}

	recordQuiz(courseId: string, lectureId: string, quizName: string, results: { [key: string]: string }) {
		return this.httpService.put<QuizResult>(
			`${environment.dataStoreRoot}courses/${courseId}/lecture/${lectureId ? lectureId : FINAL_QUIZ_LECTURE_ID}/quiz/${quizName}`,
			results
		).pipe(
			retry(3)
		);
	}

	processDiscourseSSO(payload: string, signature) {
		const defaultError = 'Error validating token';
		return this.httpService.post(
			`${environment.dataStoreRoot}sso/validate`,
			{payload, signature},
			{responseType: 'text', headers: jsonIDTokenHeaders}
		).pipe(
			retry(3),
			catchError(e => {
				console.error('Token validation error', e);
				if (e.status !== 500) {
					return throwError(new Error(defaultError + (e.error ? `: ${e.error}` : '')));
				} else {
					return throwError(new Error(defaultError));
				}
			})
		);
	}

	getUserPreferences() {
		return this.httpService.get<UserPreferences>(
			`${environment.dataStoreRoot}users/me/preferences`,
		).pipe(
			retry(3),
			catchError(e => {
				throw new Error('Unable to load preferences. Please try again.');
			})
		);
	}

	saveUserPreferences(preferences: UserPreferences) {
		return this.httpService.put<UserPreferences>(
			`${environment.dataStoreRoot}users/me/preferences`,
			preferences,
			{headers: jsonHeader}
		).pipe(
			retry(3),
			catchError(e => {
				throw new Error('Unable to save preferences. Please try again.');
			})
		);
	}

	saveUserMediaPreferences(prefersAudio: boolean) {
		return this.httpService.put<UserPreferences>(
			`${environment.dataStoreRoot}users/me/preferences/preferAudio`,
			prefersAudio,
			{headers: jsonHeader}
		).pipe(
			retry(3),
			catchError(e => {
				throw new Error('Unable to save preferences. Please try again.');
			})
		);
	}

	saveUserSubjectPreferences(preferredSubject: string) {
		return this.httpService.put<UserPreferences>(
			`${environment.dataStoreRoot}users/me/preferences/subject`,
			JSON.stringify(preferredSubject),
			{headers: jsonHeader}
		).pipe(
			retry(3),
			catchError(e => {
				throw new Error('Unable to save preferences. Please try again.');
			})
		);
	}

	// getAlternateVimeoResolutions(vimeoId: string|number) {
	// 	return this.httpService.get<AltVideoResolutions>(
	// 		`${environment.dataStoreRoot}multimedia/vimeo/${vimeoId}`,
	// 	).pipe(
	// 		retry(3),
	// 		catchError(e => {
	// 			console.error('Unable to load alternate video resolutions.', e);
	// 			return of({});
	// 		})
	// 	);
	// }

	getAlternateVimeoResolutionsMulti(vimeoIds: string[] | number[]) {
		if (!vimeoIds.length) {
			return of([]);
		}
		vimeoIds = vimeoIds.map(x => `${x}`);
		return this.httpService.post<AltVideoResolutions[]>(
			`${environment.dataStoreRoot}multimedia/vimeo/alt-resolutions`,
			vimeoIds,
			{headers: jsonHeader}
		).pipe(
			retry(3),
			catchError(e => {
				console.error('Unable to load alternate video resolutions (multi).', e);
				return of([]);
			})
		);
	}
}
