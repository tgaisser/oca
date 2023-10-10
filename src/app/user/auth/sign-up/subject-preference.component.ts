import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap.local/modal';
import {CourseDataService} from '../../../services/course-data.service';

@Component({
	selector: 'app-subject-preference',
	template: `
		<form hcForm [formGroup]="subjectForm" class="form" (hcValidSubmit)="setSubject()">
			<div class="modal-header">
				<h4 class="modal-title" id="modal-title">Select Subject of Interest</h4>
				<button type="button" class="close" aria-describedby="modal-title" (click)="modal.hide()">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group required col-12" hc-form-field fieldType="select" [selectValues]="subjectList"
						 selectTextField="title" selectValueField="codename"
						 fieldName="Primary Subject of Interest" elemId="subjectPreference">
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<!--<button type="button" class="btn btn-default" (click)="modal.hide()">Close</button>-->
				<button class="btn btn-primary mb-0" type="submit">Select Subject</button>
			</div>
		</form>`,
	styles: []
})
export class SubjectPreferenceComponent {
	constructor(public modal: BsModalRef){}

	subjectList = CourseDataService.SUBJECT_LIST;
	subjectForm: FormGroup = new FormGroup({
		subjectPreference: new FormControl('', Validators.required),
	});

	setSubject() {
		const subj = this.subjectForm.getRawValue().subjectPreference;
		if (subj) {
			this.modal.onHide.next(subj);
			this.modal.hide();
		}
	}
}