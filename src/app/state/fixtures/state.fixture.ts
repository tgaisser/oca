import {mockInitialState, State} from '..';
import {courseFixture} from './courses.fixture';
import {enrollmentFixture} from './enrollment.fixture';


export const fixtureState: State = {
	...mockInitialState,
	course: courseFixture,
	enrollment: enrollmentFixture,
};
