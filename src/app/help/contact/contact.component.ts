import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';

@Component({
	selector: 'app-contact',
	templateUrl: './contact.component.html',
	styleUrls: ['./contact.component.less']
})
export class ContactComponent implements OnInit, AfterViewInit {
	@ViewChild('contactUsForm', {read: ElementRef}) private contactUsForm: ElementRef;

	constructor(
		private renderer2: Renderer2,
	) { }

	ngOnInit(): void { }

	ngAfterViewInit() {
		// const s = this.renderer2.createElement('script');
		// s.type = 'text/javascript';
		// s.src = 'https://hillsdale.formstack.com/forms/js.php/online_courses_contact_us';
		// s.async = true;
		// s.text = '';
		// this.renderer2.appendChild(this.contactUsForm.nativeElement, s);
	}
}
