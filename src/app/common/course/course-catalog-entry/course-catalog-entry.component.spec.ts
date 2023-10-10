import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CourseCatalogEntryComponent} from './course-catalog-entry.component';
import {provideMockStore} from '@ngrx/store/testing';
import {mockInitialState, State as AppState} from '../../../state';
import {RouterTestingModule} from '@angular/router/testing';
import {Component, Input} from '@angular/core';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {Store} from '@ngrx/store';
import {Course} from '../../../services/course-data.service';
import {of} from 'rxjs';

@Component({
	selector: 'app-enrolled-progress-pie-chart',
	template: 'PIE'
})
class MockEnrolledProgressPieChartComponent {
	@Input() course: any;
}
describe('CourseCatalogEntryComponent', () => {
	let component: CourseCatalogEntryComponent;
	let fixture: ComponentFixture<CourseCatalogEntryComponent>;

	beforeEach(waitForAsync(() => {
		return TestBed.configureTestingModule({
			declarations: [CourseCatalogEntryComponent, MockEnrolledProgressPieChartComponent, HcSimpleMdPipe],
			imports: [RouterTestingModule.withRoutes([])],
			providers: [
				provideMockStore({initialState: mockInitialState}),
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CourseCatalogEntryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('test catalogEntry setter', () => {
		component.store = new Store<AppState>(null, null, null); // of(new State()) as Store;
		const pipeSpy = jest.spyOn(component.store, 'pipe').mockReturnValue(of({}));

		component.catalogEntry = {} as Course;

		expect(pipeSpy).toHaveBeenCalledTimes(0);
		expect(component.studyGroup$).toBeFalsy();

		component.catalogEntry = {system_id: '00000000-0000-0000-0000-000000000000'} as Course;

		expect(pipeSpy).toHaveBeenCalledTimes(1);
		expect(component.studyGroup$).toBeTruthy();
	});
});
