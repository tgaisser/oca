import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {ModalComponent} from './modal.component';
import {BsModalRef} from 'ngx-bootstrap/modal';

describe('ModalComponent', () => {
	let component: ModalComponent;
	let fixture: ComponentFixture<ModalComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [ModalComponent],
			providers: [BsModalRef]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
