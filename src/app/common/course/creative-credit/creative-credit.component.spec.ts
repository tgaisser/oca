import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributionsComponent } from '../attributions/attributions.component';
import {CreativeCreditComponent} from './creative-credit.component';
import {CommonModule} from '@angular/common';
import {HcPipesModule} from 'hillsdale-ng-helper-lib';

describe('CreativeCreditComponent', () => {
	let component: CreativeCreditComponent;
	let fixture: ComponentFixture<CreativeCreditComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ CreativeCreditComponent ],
			imports: [
				CommonModule,
				HcPipesModule,
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreativeCreditComponent);
		component = fixture.componentInstance;

		//set up component properties
		component.creativeCredit = {
			media_title: 'The Scream',
			media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/483px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
			video_position: '1:20:07',
			creator: 'Edvard Munch',
			source: 'Wikimedia Commons',
			license: 'public domain',
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render media title as link', () => {
		const renderedElement: HTMLElement = fixture.nativeElement;
		const a = renderedElement.querySelector('a');
		expect(a.textContent).toEqual('The Scream');
		expect(a.getAttribute('href')).toEqual(component.creativeCredit.media_url);
	});

	it('should not render media title as link when no URL', () => {
		component.creativeCredit.media_url = '';
		fixture.detectChanges();
		const renderedElement: HTMLElement = fixture.nativeElement;
		const a = renderedElement.querySelector('a');
		expect(a).toBeNull();
	});
});
