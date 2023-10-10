import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {PasswordValidateListComponent} from './password-validate-list.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

describe('PasswordValidateListComponent', () => {
	let component: PasswordValidateListComponent;
	let fixture: ComponentFixture<PasswordValidateListComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [PasswordValidateListComponent],
			imports: [FontAwesomeModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PasswordValidateListComponent);
		component = fixture.componentInstance;
		component.passwordInput = {} as any;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
