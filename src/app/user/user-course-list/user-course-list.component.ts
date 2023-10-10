import {Component, Input, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { State } from '../../state';
import { selectMyCoursesWithProgress } from '../../state/courses/selectors';
import {Course, CourseDataService} from '../../services/course-data.service';
import {courseListRequested, getCoursesProgress} from '../../state/courses/actions';
import {tap} from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'; //TODO ngx-bootstrap
import * as enrollmentActions from '../../state/enrollment/actions';
import {selectWithdrawReasons} from '../../state/enrollment/selectors';

@Component({
	selector: 'app-user-user-course-list',
	templateUrl: './user-course-list.component.html',
	styleUrls: ['./user-course-list.component.less']
})
export class UserCourseListComponent {
	courses$: Observable<Course[]>;
	coursesInProgress: Course[];
	coursesCompleted: Course[];
	// courses: CourseProgress[];
	selectedCourse: Course;
	modalRef: BsModalRef;

	constructor(private store: Store<State>, private modalService: BsModalService) {
		this.store.dispatch(courseListRequested());
		this.store.dispatch(getCoursesProgress());
		this.courses$ = this.store.pipe(
			select(selectMyCoursesWithProgress),
			tap(allc => {
				this.coursesInProgress = allc.filter(c => c.progress && c.progress.completed === false)
					.sort((a, b) => b.progress.progressPercentage - a.progress.progressPercentage);
				this.coursesCompleted = allc.filter(c => c.progress && c.progress.completed === true);

				// console.log('Courses in progress:', this.coursesInProgress);
				// console.log('Courses completed:', this.coursesCompleted);
			})
		);
	}

	leaveCourse(course: Course) {
		//save the reference in case we ever want to add a timeout to this question (or something)
		this.modalRef = this.modalService.show(
			ConfirmUserUnenrollComponent,
			{ initialState: { course },
				class: 'modal-lg modal-dialog-centered modal-dialog-scrollable' }
		);
	}

	userHasFullCourseAccess(c: Course) {
		return CourseDataService.userHasAccessToFullCourse(c);
	}

	getAccessDateForCurrentUser(course: Course) {
		return CourseDataService.getAccessDateForCurrentUser(course);
	}
}

@Component({
	selector: 'app-user-course-delete-confirm',
	template: `
		<div class="modal-header">
			<h4 class="modal-title" id="modal-title">Leave &quot;<span [innerHTML]="course.title | hcSimpleMd"></span>&quot;</h4>
			<button type="button" class="close" aria-describedby="modal-title" (click)="modal.hide()">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="modal-body text-center">
			<p>
				Are you sure you want to remove <strong [innerHTML]="course.title | hcSimpleMd"></strong> from your course list?
			</p>

			<div style="margin-top: 30px;">
				<label for="withdraw-reason">Can you tell us why you are leaving <span [innerHTML]="course.title | hcSimpleMd"></span>?</label>
				<select id='withdraw-reason' class="form-control" [(ngModel)]="withdrawalReason">
					<option [value]="null"></option>
					<ng-container *ngFor="let reason of availableReasons$ | async">
						<option *ngIf="reason.id > 0" [value]="reason.id">{{reason.text}}</option>
					</ng-container>
				</select>
			</div>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-primary" (click)="modal.hide()">Cancel</button>
			<button type="button" class="btn btn-outline-danger" (click)="confirmRemove()">Yes, please remove me</button>
		</div>
	`
})
export class ConfirmUserUnenrollComponent implements OnInit {
	@Input()
		course: Course;
	constructor(public modal: BsModalRef, private store: Store<State>) {}

	withdrawalReason: number = null;
	availableReasons$ = this.store.pipe(select(selectWithdrawReasons));

	ngOnInit() {
		this.store.dispatch(enrollmentActions.getWithdrawalReasons());
	}

	confirmRemove() {
		this.store.dispatch(enrollmentActions.withdrawFromCourseRequested({ course: this.course, reason: this.withdrawalReason }));
		this.modal.hide();
	}
}
