import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributionsComponent } from './attributions.component';
import {CreativeCreditComponent} from '../creative-credit/creative-credit.component';
import {CreativeCredit} from '../../../services/course-data.service';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';

describe('AttributionsComponent', () => {
	let component: AttributionsComponent;
	let fixture: ComponentFixture<AttributionsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ AttributionsComponent, CreativeCreditComponent ],
			imports: [HcPipesModule]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AttributionsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('compareByVideoPosition test', () => {
		const t = [
			{video_position: '1:23:23'},
			{video_position: '55'},
			{video_position: '3:59'},
			{video_position: '00:45'},
		] as CreativeCredit[];
		// const test = ['00:45', '1:23:23', '3:59', '55'];
		t.sort(component.compareByVideoPosition);

		const expected = [
			{video_position: '00:45'},
			{video_position: '55'},
			{video_position: '3:59'},
			{video_position: '1:23:23'},
		] as CreativeCredit[];

		expect(t).toStrictEqual(expected);
	});
});
