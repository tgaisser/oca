import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {CourseDonateLinksComponent} from './course-donate-links.component';
import * as helpers from '../../../test.helpers';

describe('CourseDonateLinksComponent', () => {
	let component: CourseDonateLinksComponent;
	let fixture: ComponentFixture<CourseDonateLinksComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [CourseDonateLinksComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CourseDonateLinksComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	const getCourseTest = (courseDefaults, breakLine = false) => () => {
		component.course = helpers.getMockCourse(courseDefaults);
		component.splitText = breakLine;

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	};

	it('should render normally (all props)', getCourseTest({
		course_companion_donation_url: 'book',
		course_dvd_donation_url: 'dvd',
		pluralize_course_companion_button: true,
	}));


	it('should render normally (book plural)', getCourseTest({
		course_companion_donation_url: 'book',
		pluralize_course_companion_button: true,
	}));


	it('should render normally (book non-plural)', getCourseTest({
		course_companion_donation_url: 'book',
		pluralize_course_companion_button: false,
	}));

	it('should render normally (dvd)', getCourseTest({
		course_dvd_donation_url: 'dvd',
	}));

	it('should render normally (all props) - split text', getCourseTest({
		course_companion_donation_url: 'book',
		course_dvd_donation_url: 'dvd',
		pluralize_course_companion_button: true,
	}, true));


	it('should render normally (book plural) - split text', getCourseTest({
		course_companion_donation_url: 'book',
		pluralize_course_companion_button: true,
	}, true));


	it('should render normally (book non-plural) - split text', getCourseTest({
		course_companion_donation_url: 'book',
		pluralize_course_companion_button: false,
	}, true));

	it('should render normally (dvd) - split text', getCourseTest({
		course_dvd_donation_url: 'dvd',
	}, true));

	it('should render normally (classes)', () => {
		component.course = helpers.getMockCourse({course_companion_donation_url: 'book'});

		component.elemClasses = '1 2';

		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});

	it('should merge classes', () => {
		expect(component.elemClasses).toEqual('btn-group');
		component.elemClasses = 'face';
		expect(component.elemClasses).toEqual('btn-group face');
		component.elemClasses = 'face face';
		expect(component.elemClasses).toEqual('btn-group face');
	});
});
