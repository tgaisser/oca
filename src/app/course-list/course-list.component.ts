import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Observable} from 'rxjs';
import {Course, CourseDataService, CourseSubject, Instructor, PageDvdCatalog} from '../services/course-data.service';
import {select, Store} from '@ngrx/store';
import {selectAllCourses, selectCourseSubjects} from '../state/courses/selectors';
import {Meta} from '@angular/platform-browser';
import {State} from '../state';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {map, startWith, tap} from 'rxjs/operators';
import {courseListRequested} from '../state/courses/actions';
import {faFilter, faSearch, faSort} from '@fortawesome/free-solid-svg-icons';
import {setNonCourseMetaTags} from '../common/helpers';

@Component({
	selector: 'app-course-list',
	templateUrl: './course-list.component.html',
	styleUrls: ['./course-list.component.less']
})
export class CourseListComponent implements OnInit {
	faSearch = faSearch;
	faSort = faSort;
	faFilter = faFilter;

	courseSubjectShowAll = false;
	instructorShowAll = false;

	@ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;

	searchForm: FormGroup = new FormGroup({
		search: new FormControl(''),
	});
	filterForm: FormGroup = new FormGroup({});

	courses$: Observable<Course[]> = this.store.pipe(
		select(selectAllCourses),
		// tap(c => {
		// 	console.log('Courses:', c);
		// })
	);
	courseSubjects$: Observable<CourseSubject[]> = this.store.pipe(
		select(selectCourseSubjects),
		// tap(cs => {
		// 	console.log('Course Subjects:', cs);
		// })
	);
	instructors$: Observable<Instructor[]> = this.dataService.getInstructors().pipe(
		map(i => i.sort((a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name))),
		// tap(i => {
		// 	console.log('Instructors:', i);
		// })
	);
	filteredCourses$: Observable<Course[]> = this.courses$.pipe(
		map(courses => courses),
		// tap(fc => {
		// 	console.log('Filtered Courses:', fc);
		// })
	);

	constructor(
		private dataService: CourseDataService,
		private meta: Meta,
		private store: Store<State>,
		private fb: FormBuilder,
	) {
		store.dispatch(courseListRequested());
		this.filterForm = fb.group({
			selectedSubjects:  new FormArray([]),
			selectedInstructors:  new FormArray([]),
		});
	}

	ngOnInit(): void {
		// console.log('Filtered Courses:', this.filteredCourses$);
	}

	sortCourses(sorting) {
		this.filteredCourses$ = this.filteredCourses$.pipe(
			map(fc => fc.sort((a, b) => {
				switch (sorting) {
				case 'NtoO':
					return a.publication_date > b.publication_date ? -1 : 1;
					break;
				case 'OtoN':
					return a.publication_date < b.publication_date ? -1 : 1;
					break;
				case 'AtoZ':
					return a.title.replace(/[^a-zA-Z\d\s:]/g, '').localeCompare(b.title.replace(/[^a-zA-Z\d\s:]/g, ''));
					break;
				case 'ZtoA':
					return -a.title.replace(/[^a-zA-Z\d\s:]/g, '').localeCompare(b.title.replace(/[^a-zA-Z\d\s:]/g, ''));
					break;
				default:
					return a.publication_date < b.publication_date ? -1 : 1;
				}
			})),
			// tap(fc => {
			// 	console.log('Sorted Courses:', fc);
			// })
		);
	}

	onFilterCheckboxChange(event: any, selectedGroupName: string) {
		let selectedGroup;
		switch (selectedGroupName) {
		case 'selectedSubjects':
			selectedGroup = (this.filterForm.controls.selectedSubjects as FormArray);
			break;
		case 'selectedInstructors':
			selectedGroup = (this.filterForm.controls.selectedInstructors as FormArray);
			break;
		default:
			selectedGroup = null;
		}

		if (selectedGroup) {
			if (event.target.checked) {
				selectedGroup.push(new FormControl(event.target.value));
			} else {
				const index = selectedGroup.controls
					.findIndex(x => x.value === event.target.value);
				selectedGroup.removeAt(index);
			}
		}

		this.filterCourses();
	}

	filterCourses() {
		// console.log('Filtered Courses before filter:', this.filteredCourses$);
		const searchInput = this.searchForm.getRawValue().search?.toLowerCase() || '';
		// console.log('Search input:', searchInput);
		const subjectFilterInput = this.filterForm.getRawValue().selectedSubjects;
		// console.log('Filter Subjects input:', subjectFilterInput);
		const instructorFilterInput = this.filterForm.getRawValue().selectedInstructors;
		// console.log('Filter Lecturers input:', instructorFilterInput);

		this.filteredCourses$ = this.courses$.pipe(
			map(courses => courses.filter(
				(c) => {
					// console.log('Course:', c);
					let searchResult;
					let subjectFilterResult;
					let instructorFilterResult;

					if (!!searchInput) {
						searchResult = c.title.toLowerCase().indexOf(searchInput) !== -1 ||
								c.overview.toLowerCase().indexOf(searchInput) !== -1 ||
								c.meta_description.toLowerCase().indexOf(searchInput) !== -1 ||
								c.search_keywords.toLowerCase().indexOf(searchInput) !== -1;
					}

					if (!!subjectFilterInput.length) {
						subjectFilterResult = c.course_subject.filter(
							(cs) => {
								// console.log('Course Subject codename:', cs.codename);
								// console.log('Course contains Course Subject codename:', subjectFilterInput.includes(cs.codename));
								return subjectFilterInput.includes(cs.codename);
							}
						).length > 0;
						// console.log('Returned filter:', csFilterResult);
					}

					if (!!instructorFilterInput.length) {
						instructorFilterResult = c.instructors.filter(
							(i) => {
								// console.log('Instructor:', i);
								// console.log('Course contains Instructor:', instructorFilterInput.includes(i));
								return instructorFilterInput.includes(i);
							}
						).length > 0;
						// console.log('Returned filter:', csFilterResult);
					}

					return (!searchInput || !!searchResult) &&
							(!subjectFilterInput.length || !!subjectFilterResult) &&
							(!instructorFilterInput.length || !!instructorFilterResult);
				}
			)
			)
		);

		// console.log('Filtered Courses after filter:', this.filteredCourses$);
	}

	toggleListSize(nameOfListToToggle) {
		switch (nameOfListToToggle) {
		case 'courseSubjectList':
			this.courseSubjectShowAll = !this.courseSubjectShowAll;
			break;
		case 'instructorList':
			this.instructorShowAll = !this.instructorShowAll;
			break;
		}
	}

	clearFilters() {
		this.searchForm.reset();
		this.checkboxes.forEach((element) => {
			if (element.nativeElement.checked) element.nativeElement.click();
		});
		// console.log('Filter form:', this.filterForm);

		this.filterCourses();
	}
}
