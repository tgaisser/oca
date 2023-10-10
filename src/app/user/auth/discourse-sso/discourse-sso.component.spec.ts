import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {DiscourseSsoComponent} from './discourse-sso.component';
import {RouterTestingModule} from '@angular/router/testing';
import {UserDataService} from '../../../services/user-data.service';
import {createSpyObj} from '../../../../test.helpers';
import {of} from 'rxjs';

describe('DiscourseSsoComponent', () => {
	let component: DiscourseSsoComponent;
	let fixture: ComponentFixture<DiscourseSsoComponent>;

	let userService;

	beforeEach(waitForAsync(() => {
		userService = {processDiscourseSSO: jest.fn(() => of('response'))};

		TestBed.configureTestingModule({
			declarations: [DiscourseSsoComponent],
			imports: [
				RouterTestingModule.withRoutes([]),
			],
			providers: [
				{provide: UserDataService, useValue: userService}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DiscourseSsoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
