import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {PartnershipComponent} from './partnership.component';
import {HcFormHelpersModule, HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {RouterTestingModule} from '@angular/router/testing';
import {CustomMocksModule} from '../../test.helpers';
import {Course, CourseDataService, LandingPageRecommendedCourse} from '../services/course-data.service';
import {UtmService} from '../services/utm.service';
import {lastValueFrom, Observable, of} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('PartnershipComponent', () => {
	let component: PartnershipComponent;
	let fixture: ComponentFixture<PartnershipComponent>;
	let courseService;
	let utmService;

	beforeEach(async () => {
		const dummyPartnership = {
			meta_description: '',
			recommended_courses: [
				{
					course: {url_slug: 'super-cool-course'} as Course
				} as LandingPageRecommendedCourse
			]
		};
		courseService = {getPartnership: jest.fn(() => of(dummyPartnership))};
		utmService = {setUtmCodes: jest.fn(() => {})};

		await TestBed.configureTestingModule({
			declarations: [PartnershipComponent, HcSimpleMdPipe],
			imports: [RouterTestingModule.withRoutes([]), CustomMocksModule, HcFormHelpersModule, HttpClientTestingModule],
			providers: [
				{provide: CourseDataService, useValue: courseService},
				{provide: UtmService, useValue: utmService},
				{provide: ActivatedRoute, useValue: {params: of({partnerId: 'dummy-organization'})}}
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PartnershipComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('test enrollInCourseFromSlug with invalid email', () => {
		const signupForm: FormGroup = new FormGroup({
			courseSlug: new FormControl('the-david-story', [Validators.minLength(1), Validators.required]),
			email: new FormControl('', [Validators.email, Validators.required]),
		}, {updateOn: 'submit'});

		const spyValidateAllFormFields = jest.spyOn(component, 'validateAllFormFields');

		component.enrollInCourseFromSlug(signupForm);

		expect(spyValidateAllFormFields).toHaveBeenCalledTimes(1);
	});

	it('test enrollInCourseFromSlug with invalid courseSlug', () => {
		const signupForm: FormGroup = new FormGroup({
			courseSlug: new FormControl('', [Validators.minLength(1), Validators.required]),
			email: new FormControl('test@test.com', [Validators.email, Validators.required]),
		}, {updateOn: 'submit'});

		const spyValidateAllFormFields = jest.spyOn(component, 'validateAllFormFields');

		component.enrollInCourseFromSlug(signupForm);

		expect(spyValidateAllFormFields).toHaveBeenCalledTimes(1);
	});

	it('test enrollInCourseFromSlug with valid form', () => {
		const signupForm: FormGroup = new FormGroup({
			courseSlug: new FormControl('the-david-story', [Validators.minLength(1), Validators.required]),
			email: new FormControl('test@test.com', [Validators.email, Validators.required]),
		}, {updateOn: 'submit'});

		const spyValidateAllFormFields = jest.spyOn(component, 'validateAllFormFields');
		component.recommendedCourses = [{url_slug: 'the-david-story'}, {url_slug: 'the-rise-and-fall-of-the-roman-republic'}] as Course[];

		component.enrollInCourseFromSlug(signupForm);

		expect(spyValidateAllFormFields).toHaveBeenCalledTimes(0);
	});

	it('validateAllFormFields should validate nested FormGroups', () => {
		const signupForm: FormGroup = new FormGroup({
			courseSlug: new FormControl('the-david-story', [Validators.minLength(1), Validators.required]),
			email: new FormControl('test@test.com', [Validators.email, Validators.required]),
			dummyFormGroup: new FormGroup({dummyField: new FormControl('abc')})
		}, {updateOn: 'submit'});

		expect((signupForm.controls.dummyFormGroup as FormGroup).controls.dummyField.touched).toBeFalsy();

		const spyValidateAllFormFields = jest.spyOn(component, 'validateAllFormFields');

		component.validateAllFormFields(signupForm);

		expect(spyValidateAllFormFields).toHaveBeenCalledTimes(2);
		expect((signupForm.controls.dummyFormGroup as FormGroup).controls.dummyField.touched).toBeTruthy();
	});

	it('test partnership$', waitForAsync(() => {

		const spyCourseServiceGetPartnership = jest.spyOn(courseService, 'getPartnership');
		jest.mock('../common/helpers', () => ({setPartnershipMetaTags: jest.fn()}));

		lastValueFrom(component.partnership$).then(r => {
			expect(component.recommendedCourses.length).toStrictEqual(1);
			expect(component.recommendedCourses[0].url_slug).toStrictEqual('super-cool-course');
			expect(spyCourseServiceGetPartnership).toHaveBeenCalledTimes(2);
		});

	}));
});
