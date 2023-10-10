import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SignUpComponent} from './sign-up.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HcFormHelpersModule} from 'hillsdale-ng-helper-lib';
import {ToastrService} from 'ngx-toastr';
import {createSpyObj, CustomMocksModule, MockBrowserAbstractionModule} from '../../../../test.helpers';
import {RouterTestingModule} from '@angular/router/testing';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState} from '../../../state';
import {BsModalService} from 'ngx-bootstrap/modal';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { UserService } from '../../../services/user.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SubjectPreferenceComponent } from './subject-preference.component';
import { EventEmitter } from 'stream';

describe('SubjectPreferenceComponent', () => {
	let component: SubjectPreferenceComponent;
	let fixture: ComponentFixture<SubjectPreferenceComponent>;
	let modalService;

	beforeEach(waitForAsync(() => {

		return TestBed.configureTestingModule({
			declarations: [SubjectPreferenceComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HcFormHelpersModule,
				CustomMocksModule,
				RouterTestingModule.withRoutes([]),
				MockBrowserAbstractionModule,
				FontAwesomeTestingModule,
				HttpClientTestingModule
			],
			providers: [
				{provide: ToastrService, useValue: {error: jest.fn()}},
				provideMockStore({initialState: mockInitialState}),
				{provide: BsModalService, useValue:  modalService},
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SubjectPreferenceComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('set valid subject', () => {
		const mockUserService: UserService = TestBed.inject(UserService);
		jest.spyOn(mockUserService, 'checkEmailWithDebounce').mockReturnValue(of('success'));

		const formData = {
			subjectPreference: 'subject 1'
		};
		component.subjectForm.setValue(formData);

		expect(component.subjectForm.valid).toEqual(true);
	});
});
