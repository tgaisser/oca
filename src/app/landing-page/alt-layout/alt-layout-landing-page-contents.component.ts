import {BaseLandingPageContentsComponentDirective} from '../base-landing-page-contents-component.directive';
import {Component} from '@angular/core';
import {select} from '@ngrx/store';
import {selectTestimonials} from '../../state/courses/selectors';

@Component({
	selector: 'app-alt-layout-landing-page-contents',
	templateUrl: './alt-layout-landing-page-contents.component.html',
	styleUrls: ['./alt-layout-landing-page-contents.component.less']
})
export class AltLayoutLandingPageContentsComponent extends BaseLandingPageContentsComponentDirective {

}
