import {AuthComponent} from './auth.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {CustomMocksModule} from '../../../test.helpers';
import {RouterTestingModule} from '@angular/router/testing';

describe('AuthComponent', () => {
	let component: AuthComponent;
	let fixture: ComponentFixture<AuthComponent>;

	beforeEach(waitForAsync( () => {
		return TestBed.configureTestingModule({
			declarations: [AuthComponent],
			imports: [CustomMocksModule, RouterTestingModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AuthComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
