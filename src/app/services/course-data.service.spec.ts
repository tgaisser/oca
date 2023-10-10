import {getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {Course, CourseDataService, CourseStatus} from './course-data.service';
import {HttpClient} from '@angular/common/http';
import {getMockKenticoFilters} from '../../test.helpers';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { text } from '@fortawesome/fontawesome-svg-core';

import * as helpers from '../../test.helpers';
import { lastValueFrom, of } from 'rxjs';
import * as e from 'express';


const mockKentico = {
	system: {
		id: 'mockId',
		name: '',
		codename: '',
		language: 'default',
		type: 'lecture',
		collection: 'default',
		sitemap_locations: [],
		last_modified: '',
		workflow_step: ''
	},
	elements: {},
	modular_content: {},
	pagination: {
		skip: 0,
		limit: 0,
		count: 33,
		next_page: ''
	}
};

const mock_system_res = {
	system_codename: undefined,
	system_id: undefined,
	system_last_modified: undefined,
	system_name: undefined,
	system_type: undefined,
};


const sampleCourseLoad = {
	items: [
		{
			system: {
				id: '39c75e85-b1f0-431e-b54c-4d15eab5a620',
				name: 'American Heritage',
				codename: 'american_heritage',
				language: 'default',
				type: 'course',
				collection: 'default',
				sitemap_locations: [],
				last_modified: '2021-08-13T19:34:08.1802015Z',
				workflow_step: 'published'
			},
			elements: {
				attributions: {
					type: 'custom',
					name: 'attributions',
					value: '{"result":true, "count":42}',
				},
				title: {
					type: 'text',
					name: 'Title',
					value: 'American Heritage: From Colonial Settlement to the Current Day'
				},
				overview: {
					type: 'rich_text',
					name: 'Overview',
					images: {},
					links: {},
					modular_content: [],
					value: '<p>On July 4, 1776, America—acting under the authority of “the Laws of Nature and of Nature’s God”—declared its independence from Great Britain. The new nation, founded on the principle that “all Men are created equal,” eventually grew to become the most prosperous and powerful nation in the world. This course will consider the history of America from the colonial era to the present, including major challenges to the Founders’ principles.</p>'
				},
				course_subject: {
					type: 'multiple_choice',
					name: 'Course Subject',
					value: [
						{
							name: 'History',
							codename: 'history'
						}
					]
				},
				catalog_image: {
					type: 'asset',
					name: 'Catalog Image',
					value: [
						{
							name: 'AmerHeritageMap2.jpg',
							description: 'American Heritage Course Thumbnail',
							type: 'image/jpeg',
							size: 789107,
							url: 'https://preview-assets-us-01.kc-usercontent.com:443/c7bb3f89-eb78-007e-971a-d5864cf7a236/9c764f15-65d2-4ff8-8c90-cb5f413b5cf6/AmerHeritageMap2.jpg',
							width: 1280,
							height: 720
						}
					]
				},
				study_guide: {
					type: 'asset',
					name: 'Study Guide',
					value: []
				},
				course_sponsor: {
					type: 'text',
					name: 'Course Sponsor',
					value: ''
				},
				estimated_course_ttc: {
					type: 'number',
					name: 'Estimated Course TTC (Unused)',
					value: null
				},
				course_trailer_id: {
					type: 'custom',
					name: 'Multimedia ID',
					value: null
				},
				course_donation_url: {
					type: 'text',
					name: 'Course Donation URL',
					value: 'https://secured.hillsdale.edu/hillsdale/support-american-heritage-companion-textbook?sc=MK220DA10'
				},
				course_companion_donation_url: {
					type: 'text',
					name: 'Course Companion Donation URL',
					value: 'https://secured.hillsdale.edu/hillsdale/support-american-heritage-companion-textbook?sc=MK220DA10'
				},
				pluralize_course_companion_button: {
					type: 'multiple_choice',
					name: 'Pluralize Course Companion Button',
					value: []
				},
				course_dvd_donation_url: {
					type: 'text',
					name: 'DVD Donation URL - Course Page',
					value: ''
				},
				dvd_donation_url___catalog_page: {
					type: 'text',
					name: 'DVD Donation URL - Catalog Page',
					value: ''
				},
				dvd_catalog_image: {
					type: 'asset',
					name: 'DVD Catalog Image',
					value: []
				},
				dvd_catalog_description: {
					type: 'rich_text',
					name: 'DVD Catalog Description',
					images: {},
					links: {},
					modular_content: [],
					value: '<p><br></p>'
				},
				url_slug: {
					type: 'url_slug',
					name: 'URL Slug',
					value: 'american-heritage'
				},
				meta_description: {
					type: 'text',
					name: 'Meta Description',
					value: 'Explore the American heritage--from the colonial era to the present--to learn what made America the most prosperous and powerful nation on earth.'
				},
				publication_date: {
					type: 'date_time',
					name: 'Publication Date & Time (UTC)',
					value: '2017-02-01T00:00:00Z'
				},
				early_access_date: {
					type: 'date_time',
					name: 'Early Access Date & Time (UTC)',
					value: '2017-02-01T00:00:00Z'
				},
				hubspot_key: {
					type: 'text',
					name: 'Hubspot Key',
					value: 'American Heritage 2017'
				},
				featured_course: {
					type: 'multiple_choice',
					name: 'Featured Course',
					value: [
						{
							name: 'No',
							codename: 'no'
						}
					]
				},
				lengthy_course: {
					type: 'multiple_choice',
					name: 'Lengthy Course',
					value: []
				},
				hide_from_catalog: {
					type: 'multiple_choice',
					name: 'Hide From Catalog',
					value: []
				},
				share_campaign_utm_code: {
					type: 'text',
					name: 'Share Campaign UTM Code',
					value: 'americanheritage'
				},
				instructors: {
					type: 'modular_content',
					name: 'Instructors',
					value: [
						'larry_p__arnn',
						'bradley_j__birzer',
						'thomas_h__conner',
						'matthew_gaetano',
						'paul_moreno',
						'paul_a__rahe'
					]
				},
				lectures: {
					type: 'modular_content',
					name: 'Lectures',
					value: [
						'american_heritage__lecture__american_history',
						'american_heritage__lecture__colonial_settlement',
						'american_heritage__lecture__enlightenment',
						'american_heritage__lecture__founding',
						'american_heritage__lecture__jacksonian',
						'american_heritage__lecture__union_crisis',
						'american_heritage__lecture__western_expansion',
						'american_heritage__lecture__progressivism',
						'american_heritage__lecture__world_power',
						'american_heritage__lecture__post_1960s'
					]
				},
				final_quiz: {
					type: 'modular_content',
					name: 'Final Quiz',
					value: [
						'american_heritage__quiz__final_quiz'
					]
				},
				intro_text: {
					type: 'text',
					name: 'Landing Page Intro Text',
					value: 'Deepen your understanding of American history.'
				},
				about_text: {
					type: 'rich_text',
					name: 'Landing Page About Text',
					images: {},
					links: {},
					modular_content: [],
					value: '<p>You can enroll for FREE in Hillsdale College’s popular online course “American Heritage: From Colonial Settlement to the Current Day,” and pursue an education in the ideas, arguments and people that have shaped America’s remarkable history.&nbsp;</p>\n<p>America’s Founders had a unique opportunity to start government anew—while drawing on the accumulated knowledge and experience of Western Civilization, from ancient Greece and Rome to the English constitutional tradition. Based on principles of equality and consent, the Constitution secures the rights and promotes the happiness of all citizens. The great controversies of American history—including the current crisis of progressivism—have centered around the meaning of those principles.</p>\n<p>In this free online course you will examine the history of America from the colonial era to the present, including the major challenges to the Founders’ principles.&nbsp;</p>\n<p>By enrolling in this ten-lesson course you will receive free access to lectures by Hillsdale’s history faculty, course readings, and quizzes to aid you in the study of the development and ideas of our great nation’s history, from its first beginnings to today.</p>\n<p>We invite you to join us and explore the inspiring history of America.</p>'
				},
				form_cta_text: {
					type: 'text',
					name: 'Form CTA Text',
					value: 'Enroll in this free online course on the American heritage today!'
				},
				study_group_headline: {
					type: 'text',
					name: 'Study Group Headline',
					value: ''
				},
				study_group_body_text: {
					type: 'rich_text',
					name: 'Study Group Body Text',
					images: {},
					links: {},
					modular_content: [],
					value: '<p><br></p>'
				},
				study_group_cta_text: {
					type: 'text',
					name: 'Study Group CTA Text',
					value: ''
				}
			}
		},
	],
	modular_content: {},
	pagination: {
		skip: 0,
		limit: 0,
		count: 33,
		next_page: ''
	}
};



describe('CourseDataService', () => {
	let service: CourseDataService;
	let http: HttpTestingController;
	let transferState;
	let mockHttp: HttpClient;

	beforeEach(async () => {
		return TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [CourseDataService]
		}).compileComponents();
	});

	beforeEach(() => {
		transferState = {
			hasKey: jest.fn(() => false),
			get: jest.fn(() => null),
			remove: jest.fn()
		};
		service = new CourseDataService(new HttpClient(null), transferState, '');
		http = TestBed.inject(HttpTestingController);
		mockHttp = TestBed.inject(HttpClient);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should validate format from mapKenticoObject', () => {
		const parsed = sampleCourseLoad.items.map(i => CourseDataService.mapKenticoObject(i, sampleCourseLoad.modular_content));
		expect(parsed).toEqual([{
			system_id: '39c75e85-b1f0-431e-b54c-4d15eab5a620',
			system_type: 'course',
			system_name: 'American Heritage',
			system_codename: 'american_heritage',
			system_last_modified: '2021-08-13T19:34:08.1802015Z',
			title: 'American Heritage: From Colonial Settlement to the Current Day',
			overview: '<p>On July 4, 1776, America—acting under the authority of “the Laws of Nature and of Nature’s God”—declared its independence from Great Britain. The new nation, founded on the principle that “all Men are created equal,” eventually grew to become the most prosperous and powerful nation in the world. This course will consider the history of America from the colonial era to the present, including major challenges to the Founders’ principles.</p>',
			course_subject: [
				{
					name: 'History',
					codename: 'history'
				}
			],
			catalog_image: {
				name: 'AmerHeritageMap2.jpg',
				description: 'American Heritage Course Thumbnail',
				type: 'image/jpeg',
				size: 789107,
				url: 'https://preview-assets-us-01.kc-usercontent.com:443/c7bb3f89-eb78-007e-971a-d5864cf7a236/9c764f15-65d2-4ff8-8c90-cb5f413b5cf6/AmerHeritageMap2.jpg',
				width: 1280,
				height: 720
			},
			study_guide: null,
			course_sponsor: '',
			estimated_course_ttc: null,
			course_trailer_id: null,
			course_donation_url: 'https://secured.hillsdale.edu/hillsdale/support-american-heritage-companion-textbook?sc=MK220DA10',
			course_companion_donation_url: 'https://secured.hillsdale.edu/hillsdale/support-american-heritage-companion-textbook?sc=MK220DA10',
			pluralize_course_companion_button: false,
			course_dvd_donation_url: '',
			dvd_donation_url___catalog_page: '',
			dvd_catalog_image: null,
			dvd_catalog_description: '<p><br></p>',
			url_slug: 'american-heritage',
			meta_description: 'Explore the American heritage--from the colonial era to the present--to learn what made America the most prosperous and powerful nation on earth.',
			publication_date: new Date('2017-02-01T00:00:00.000Z'),
			early_access_date: new Date('2017-02-01T00:00:00.000Z'),
			hubspot_key: 'American Heritage 2017',
			featured_course: false,
			lengthy_course: [],
			hide_from_catalog: false,
			share_campaign_utm_code: 'americanheritage',
			instructors: [
				'larry_p__arnn',
				'bradley_j__birzer',
				'thomas_h__conner',
				'matthew_gaetano',
				'paul_moreno',
				'paul_a__rahe'
			],
			lectures: [
				'american_heritage__lecture__american_history',
				'american_heritage__lecture__colonial_settlement',
				'american_heritage__lecture__enlightenment',
				'american_heritage__lecture__founding',
				'american_heritage__lecture__jacksonian',
				'american_heritage__lecture__union_crisis',
				'american_heritage__lecture__western_expansion',
				'american_heritage__lecture__progressivism',
				'american_heritage__lecture__world_power',
				'american_heritage__lecture__post_1960s'
			],
			final_quiz: 'american_heritage__quiz__final_quiz',
			intro_text: 'Deepen your understanding of American history.',
			about_text: '<p>You can enroll for FREE in Hillsdale College’s popular online course “American Heritage: From Colonial Settlement to the Current Day,” and pursue an education in the ideas, arguments and people that have shaped America’s remarkable history.&nbsp;</p>\n<p>America’s Founders had a unique opportunity to start government anew—while drawing on the accumulated knowledge and experience of Western Civilization, from ancient Greece and Rome to the English constitutional tradition. Based on principles of equality and consent, the Constitution secures the rights and promotes the happiness of all citizens. The great controversies of American history—including the current crisis of progressivism—have centered around the meaning of those principles.</p>\n<p>In this free online course you will examine the history of America from the colonial era to the present, including the major challenges to the Founders’ principles.&nbsp;</p>\n<p>By enrolling in this ten-lesson course you will receive free access to lectures by Hillsdale’s history faculty, course readings, and quizzes to aid you in the study of the development and ideas of our great nation’s history, from its first beginnings to today.</p>\n<p>We invite you to join us and explore the inspiring history of America.</p>',
			small_text: '',
			medium_text: '',
			attributions: {
				count: 42,
				result: true
			},
			form_cta_text: 'Enroll in this free online course on the American heritage today!',
			study_group_headline: '',
			study_group_body_text: '',
			study_group_cta_text: ''
		}]);
	});

	it('should validate system_type lecture', () => {
		const testType = 'lecture';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
		};
		const system_res = {
			system_codename: undefined,
			system_id: undefined,
			system_last_modified: undefined,
			system_name: undefined,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			discussion_questions: '',
			quiz: null,
			recommended_readings: null,
			study_guide: null,
			...system_res
		});
	});

	it('should validate page___home_v2 ', () => {
		const testType = 'page___home_v2';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				welcome_button_url__signed_in_: {
					type: 'text',
					name: 'welcome button url',
					value: 'https://online.hillsdale.edu/link',
				},
				introduction_button_url: {
					type: 'text',
					name: 'welcome button url',
					value: 'https://online.hillsdale.edu/link',
				},
				announcement_button_url: {
					type: 'text',
					name: 'welcome button url',
					value: 'https://online.hillsdale.edu/link',
				}
			}

		};
		const system_res = {
			system_codename: undefined,
			system_id: undefined,
			system_last_modified: undefined,
			system_name: undefined,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			banner_image: null,
			welcome_text: '',
			welcome_fallback_image: null,
			welcome_text__signed_in_: '',
			welcome_fallback_image__signed_in_: null,
			introduction_text: '',
			introduction_fallback_image: null,
			announcement_text: '',
			announcement_fallback_image: null,
			cta_text: '',
			welcome_button_url__signed_in_: '/link',
			introduction_button_url: '/link',
			announcement_button_url: '/link',
			...system_res
		});
	});

	it('should validate page_about ', () => {
		const row_button_helper = {
			type: 'button',
			name: 'row button',
			value: [{
				link: 'something.online.hillsdale.edu',
				open_in_new_tab: {codename: 'yes'}
			}]
		};

		const testType = 'page_about';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				n1st_row_image: {
					type: 'image',
					name: 'Row Image',
					value: ['image.jpeg'],
				},
				n2nd_row_image: {
					type: 'image',
					name: 'Row Image',
					value: ['image.jpeg'],
				},
				n3rd_row_image: {
					type: 'image',
					name: 'Row Image',
					value: ['image.jpeg'],
				},
				n1st_row_button: {
					should_return: null
				},
				n2nd_row_button: {
					...row_button_helper
				},
				n3rd_row_button: {
					...row_button_helper
				},
				n4th_row_button: {
					...row_button_helper
				},
				n5th_row_button: {
					...row_button_helper
				},
				n6th_row_button: {
					...row_button_helper
				},

			}

		};
		const system_res = {
			system_codename: undefined,
			system_id: undefined,
			system_last_modified: undefined,
			system_name: undefined,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			n1st_row_image: 'image.jpeg',
			n2nd_row_image: 'image.jpeg',
			n3rd_row_image: 'image.jpeg',
			n1st_row_button: null,
			n2nd_row_button: {
				link: 'something.online.hillsdale.edu',
    			open_in_new_tab: false,
			},
			n3rd_row_button: {
				link: 'something.online.hillsdale.edu',
    			open_in_new_tab: false,
			},
			n4th_row_button: {
				link: 'something.online.hillsdale.edu',
    			open_in_new_tab: false,
			},
			n5th_row_button: {
				link: 'something.online.hillsdale.edu',
    			open_in_new_tab: false,
			},
			n6th_row_button: {
				link: 'something.online.hillsdale.edu',
    			open_in_new_tab: false,
			},
			...system_res
		});
	});

	xit('should getKenticoObject', (done) => {
		const filters = getMockKenticoFilters();
		// @ts-ignore
		jest.spyOn(mockHttp, 'get').mockReturnValue( of(mockKentico) );
		service.getKenticoObject('mockKenticoObject', filters).subscribe(result => {
			expect(result).toBeTruthy();
			done();
		});
		//const req = http.expectOne(`${environment.kenticoRoot}/items/mockKenticoObject`);
		//expect(req.request.method).toEqual('GET');
		//req.flush('Ok');
	});

	it('should validate system_type study_group', () => {
		const testType = 'study_group';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				study_group_syllabus: 'week1',
				essay_contest_pdf: ['contest details are here']
			}
		};
		const system_res = {
			system_codename: undefined,
			system_id: undefined,
			system_last_modified: undefined,
			system_name: undefined,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			study_group_syllabus: null,
			essay_contest_pdf: null,
			...system_res
		});
	});

	it('should validate system_type quiz_question', () => {
		const testType = 'quiz_question';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				answer: {
					codename: 'mockCodename',
				},
				extra_details: 'mockDetail',
			}
		};
		const system_res = {
			system_codename: undefined,
			system_id: undefined,
			system_last_modified: undefined,
			system_name: undefined,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			answer: '',
			extra_details: '',
			...system_res
		});
	});

	it('should validate system_type tv_ad___landing_page', () => {
		const testType = 'tv_ad___landing_page';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				banner_image: 'mockImage',
				banner_cta_description: 'mockImage',
				final_cta_description: 'mockDescription',
				social_graph_image: 'mockSocialGraph',
			}
		};
		const system_res = {
			system_codename: undefined,
			system_id: undefined,
			system_last_modified: undefined,
			system_name: undefined,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			banner_image: null,
			banner_cta_description: '',
			final_cta_description: '',
			social_graph_image: null,
			...system_res
		});
	});

	it('should validate system_type tv_ad___recommended_course', () => {
		const testType = 'tv_ad___recommended_course';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				custom_image: 'mockImage',
				custom_description: 'mockDescription',
				course: 'mockDescription',
			}
		};
		const system_res = {
			system_codename: undefined,
			system_id: undefined,
			system_last_modified: undefined,
			system_name: undefined,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			custom_image: null,
			custom_description: '',
			course: null,
			...system_res
		});
	});

	xit('should make http call to get getKenticoObjects', waitForAsync(() => {
		const spy = jest.spyOn(mockHttp, 'get');
		const res = lastValueFrom(service.getKenticoObjects(getMockKenticoFilters()));
		return expect(res).resolves.toBe(spy);
	}));

	xit('should make http call to get getKenticoObject', waitForAsync(() => {
		const spy = jest.spyOn(mockHttp, 'get');
		const res = lastValueFrom(service.getKenticoObject('mockId', getMockKenticoFilters()));
		return expect(res).resolves.toBe(spy);
	}));


	xit('should getKenticoObjects', () => {
		const kObjs = service.getKenticoObjects(getMockKenticoFilters());
		expect(kObjs).toBeTruthy();
		expect(kObjs).toEqual({});
	});

	it('should getPageAbout', () => {
		const aboutPage = service.getPageAbout();
		expect(aboutPage).toBeTruthy();
	});

	xit('should getPageDvdCatalog', done => {
		service.getPageDvdCatalog().subscribe(result => {
			console.log('result', result);
			done();
		});
		//const req = http.expectOne(`${environment.kenticoRoot}/items/dvd_catalog_page`);
		//expect(req.request.method).toEqual('GET');
	});

	it('cleans HTML strings', () => {
		expect(CourseDataService.cleanEmptyHtmlText(null)).toBe('');
		expect(CourseDataService.cleanEmptyHtmlText('')).toBe('');
		expect(CourseDataService.cleanEmptyHtmlText('<p><br></p>')).toBe('');
		expect(CourseDataService.cleanEmptyHtmlText(' trash    with spaces   ')).toBe('trash    with spaces');
		expect(CourseDataService.cleanEmptyHtmlText('clean')).toBe('clean');
	});

	describe('getAccessDate', () => {
		const course = helpers.getMockCourse({
			userHasEarlyAccess: false,
			publication_date: '2020-10-01',
			early_access_date: '2020-08-02',
		});

		it('should get correct access data for normal course', () => {
			expect(CourseDataService.getAccessDate(course)).toEqual(course.publication_date);
		});
		it('should get correct access data for early course', () => {
			const c = {...course, userHasEarlyAccess: true};
			expect(CourseDataService.getAccessDate(c)).toEqual(course.early_access_date);
		});

		it('should get correct access data for normal course (default = false)', () => {
			expect(CourseDataService.getAccessDateWithDefault(course, false)).toEqual(course.publication_date);
		});
		it('should get correct access data for early course (default = true)', () => {
			expect(CourseDataService.getAccessDateWithDefault(course, true)).toEqual(course.early_access_date);
		});
	});

	describe('isInEarlyAccessWindow', () => {
		const course = {
			userHasEarlyAccess: true,
			early_access_date: new Date('1999-01-01'),
			publication_date: new Date('2080-01-01')
		} as any;

		it('should return false if EA > now and publish > now', () => {
			const secondAhead = new Date(new Date().getTime() + 1000);
			const res = CourseDataService.isInEarlyAccessWindow({...course, early_access_date: secondAhead});
			expect(res).toBe(false);
		});

		it('should return false if EA < now and publish < now', () => {
			const secondAgo = new Date(new Date().getTime() - 1000);
			const res = CourseDataService.isInEarlyAccessWindow({...course, publication_date: secondAgo});
			expect(res).toBe(false);
		});

		it('should return true if EA < now and publish > now', () => {
			const res = CourseDataService.isInEarlyAccessWindow(course);
			expect(res).toBe(true);
		});
	});

	describe('isInPreRegPageCampaignWindow', () => {
		const course = {
			userHasEarlyAccess: true,
			prereg_page_campaign_start_date: new Date('1999-01-01'),
			prereg_page_campaign_end_date: new Date('2090-01-01'),
		} as any;

		it('should return true within campaign window', () => {
			const inputCourse = {...course};
			inputCourse.prereg_page_campaign_start_date = new Date('1999-01-01');
			inputCourse.prereg_page_campaign_end_date = new Date('2090-01-01');
			const res = CourseDataService.isInPreRegPageCampaignWindow(inputCourse);
			expect(res).toBe(true);
		});

		it('should return false before campaign start date', () => {
			const inputCourse = {...course};
			inputCourse.prereg_page_campaign_start_date = new Date('2079-01-01');
			inputCourse.prereg_page_campaign_end_date = new Date('2090-01-01');
			const res = CourseDataService.isInPreRegPageCampaignWindow(inputCourse);
			expect(res).toBe(false);
		});

		it('should return false after campaign end date', () => {
			const inputCourse = {...course};
			inputCourse.prereg_page_campaign_start_date = new Date('1999-01-01');
			inputCourse.prereg_page_campaign_end_date = new Date('2000-01-01');
			const res = CourseDataService.isInPreRegPageCampaignWindow(inputCourse);
			expect(res).toBe(false);
		});

		it('should return false if course is falsy', () => {
			const inputCourse = null;
			const res = CourseDataService.isInPreRegPageCampaignWindow(inputCourse);
			expect(res).toBe(false);
		});

		it('should return false if start date is falsy', () => {
			const inputCourse = {...course};
			inputCourse.prereg_page_campaign_start_date = null;
			const res = CourseDataService.isInPreRegPageCampaignWindow(inputCourse);
			expect(res).toBe(false);
		});

		it('should return false if end date is falsy', () => {
			const inputCourse = {...course};
			inputCourse.prereg_page_campaign_end_date = null;
			const res = CourseDataService.isInPreRegPageCampaignWindow(inputCourse);
			expect(res).toBe(false);
		});
	});


	it.todo('maps system_type lecture');
	it.todo('maps system_type page___home_v2');
	it.todo('maps system_type page_about');

	it.todo('should getPageHelp');
	it.todo('should getPageHome');
	it.todo('should getPagePolicies');

	it('should make http call to get MultiMedia Objects', waitForAsync(() => {
		const spy = jest.spyOn(mockHttp, 'get');
		const res = lastValueFrom(service.getMultiMediaObjects());
		return expect(res).resolves.toBe(spy);
	}));

	it('should get pre registration course status', () => {
		const c = {pre_reg_date: new Date(), early_access_date: new Date(), publication_date: new Date()} as Course;
		c.pre_reg_date = addDays(c.pre_reg_date, -1);
		c.early_access_date = addDays(c.early_access_date, 1);
		c.publication_date = addDays(c.publication_date, 2);

		expect(CourseDataService.getCourseStatus(c)).toStrictEqual(CourseStatus.pre_reg);
	});

	it('should get early access course status', () => {
		const c = {pre_reg_date: new Date(), early_access_date: new Date(), publication_date: new Date()} as Course;
		c.pre_reg_date = addDays(c.pre_reg_date, -2);
		c.early_access_date = addDays(c.early_access_date, -1);
		c.publication_date = addDays(c.publication_date, 1);

		expect(CourseDataService.getCourseStatus(c)).toStrictEqual(CourseStatus.early_access);
	});

	it('should get published course status', () => {
		const c = {pre_reg_date: new Date(), early_access_date: new Date(), publication_date: new Date()} as Course;
		c.pre_reg_date = addDays(c.pre_reg_date, -3);
		c.early_access_date = addDays(c.early_access_date, -2);
		c.publication_date = addDays(c.publication_date, -1);

		expect(CourseDataService.getCourseStatus(c)).toStrictEqual(CourseStatus.published);
	});

	it('test fixDates', () => {
		const o = {dummy_date: '2017-02-01T00:00:00.000Z', date_property: '2017-02-01T00:00:00.000Z', object_property: {another_dummy_date: '2017-02-01T00:00:00.000Z'}};
		const o2 = {object_property: {}};

		const consoleErrorSpy = jest.spyOn(console, 'error');

		CourseDataService.fixDates(o);

		expect(o.dummy_date).toBeInstanceOf(Date);
		expect(o.object_property.another_dummy_date).toBeInstanceOf(Date);
		expect(typeof o.date_property).toStrictEqual('string');
	});

	it('should validate system_type landing_page_utility___content_row', () => {
		const testType = 'landing_page_utility___content_row';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				text_content: { value: 'mockText' },
				image_content: { value: ['mockImage'] },
				row_background_color: { value: [{codename: 'mockColor'}] },
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			text_content: 'mockText',
			image_content: 'mockImage',
			row_background_color: 'mockColor',
			...system_res
		});
	});

	it('should validate system_type landing_page_utility___dvd_cta', () => {
		const testType = 'landing_page_utility___dvd_cta';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				cta_text: { value: 'mockText' },
				course: { value: ['mockCourse'] },
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			cta_text: 'mockText',
			course: 'mockCourse',
			...system_res
		});
	});

	it('should validate system_type landing_page_utility___logo', () => {
		const testType = 'landing_page_utility___logo';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				entity_logo_image: { value: ['mockLogo'] },
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			entity_logo_image: 'mockLogo',
			...system_res
		});
	});

	it('should validate system_type landing_page_utility___logo_row', () => {
		const testType = 'landing_page_utility___logo_row';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				text_content: { value: 'mockText' },
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			text_content: 'mockText',
			...system_res
		});
	});

	it('should validate system_type tv_ad___recommended_course', () => {
		const testType = 'tv_ad___recommended_course';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				custom_description: { value: 'mockCustom_description' },
				course: { value: ['mockCourse'] },
				custom_image: { value: ['mockImage']},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			custom_description: 'mockCustom_description',
			course: 'mockCourse',
			custom_image: 'mockImage',
			...system_res
		});
	});

	it('should validate system_type landing_page___tv_ad__extended_', () => {
		const testType = 'landing_page___tv_ad__extended_';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				banner_image: { value: ['banner_image']},
				banner_cta_description: { value: 'banner_cta_description'},
				donation_cta: { value: ['donation_cta']},
				logos: { value: ['logos']},
				dvd_cta: { value: ['dvd_cta']},
				final_cta_description: { value: 'final_cta_description'},
				social_graph_image: { value: ['social_graph_image']},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			banner_image: 'banner_image',
			banner_cta_description:'banner_cta_description',
			donation_cta: 'donation_cta',
			logos: 'logos',
			dvd_cta: 'dvd_cta',
			final_cta_description:'final_cta_description',
			social_graph_image: 'social_graph_image',
			...system_res
		});
	});

	it('should validate system_type partnership', () => {
		const testType = 'partnership';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				partner_logo: { value: ['partner_logo']},
				banner_description: { value: 'banner_description'},
				banner_image: { value: ['banner_image']},
				social_graph_image: { value: ['social_graph_image']},
				final_cta_description: { value: 'final_cta_description'},
				additional_partnership_info: { value: 'additional_partnership_info'},
				recommended_courses: { value: [{system_type: 'course', value: 'mockValue'}]},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			partner_logo: 'partner_logo',
			banner_description: 'banner_description',
			banner_image: 'banner_image',
			social_graph_image: 'social_graph_image',
			final_cta_description: 'final_cta_description',
			additional_partnership_info: 'additional_partnership_info',
			recommended_courses: [{course: {system_type: 'course', value: 'mockValue'}}],
			...system_res
		});
	});

	it('should validate system_type study_group_session', () => {
		const testType = 'study_group_session';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				discussion_questions: { value: 'discussion_questions'},
				lecture_ids: null,
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			discussion_questions: 'discussion_questions',
			lecture_ids: [],
			optional_lectures: [],
			...system_res
		});
	});

	it('should validate system_type quiz', () => {
		const testType = 'quiz';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				description: { value: 'description'},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			description: 'description',
			...system_res
		});
	});

	it('should validate system_type qa', () => {
		const testType = 'qa';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				overview: { value: 'overview'},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			overview: 'overview',
			...system_res
		});
	});

	it('should validate system_type page_dvd_catalog', () => {
		const testType = 'page_dvd_catalog';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				highlighted_product_image: { value: ['highlighted_product_image']},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			highlighted_product_image: 'highlighted_product_image',
			...system_res
		});
	});

	it('should validate system_type page___learn', () => {
		const testType = 'page___learn';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				banner_image: { value: ['banner_image']},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			banner_image: 'banner_image',
			...system_res
		});
	});

	it('should validate system_type page_home', () => {
		const testType = 'page_home';
		const data = {
			...mockKentico,
			system: {
				type: testType,
			},
			elements: {
				banner_image: { value: ['banner_image']},
			}
		};
		const system_res = {
			...mock_system_res,
			system_type: testType,
		};
		const parsed = CourseDataService.mapKenticoObject(data, {});
		expect(parsed).toEqual({
			banner_image: 'banner_image',
			...system_res
		});
	});


});

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
