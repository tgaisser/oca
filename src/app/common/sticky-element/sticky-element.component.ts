import { Component, OnInit, OnDestroy, ElementRef, NgZone, ViewChild, AfterViewInit } from '@angular/core';

@Component({
	selector: 'app-sticky-element',
	templateUrl: './sticky-element.component.html',
	styleUrls: ['./sticky-element.component.less'],
	// inputs: ['stickyClass'],
	queries: {
		topMarkerRef: new ViewChild('topMarkerRef', { static: false }),
		bottomMarkerRef: new ViewChild('bottomMarkerRef', { static: false })
	}
})
export class StickyElementComponent implements OnInit, OnDestroy, AfterViewInit {
	private elementRef: ElementRef;
	private zone: NgZone;

	public bottomMarkerRef: ElementRef;
	public topMarkerRef: ElementRef;

	private isBottomMarkerVisible: boolean;
	private isTopMarkerVisible: boolean;
	public isStuck: boolean;

	private observer: IntersectionObserver | null;
	public stickyClass = 'stuck';

	// I initialize the sticky-header component.
	constructor(elementRef: ElementRef, zone: NgZone) {
		this.elementRef = elementRef;
		this.zone = zone;

		this.isBottomMarkerVisible = false;
		this.isTopMarkerVisible = false;
		this.isStuck = false;
		this.observer = null;
	}

	// ---
	// PUBLIC METHODS.
	// ---

	// I get called once when the component is being destroyed.
	public ngOnDestroy(): void {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	public ngOnInit(): void {}

	// I get called once after the inputs have been bound for the first time.
	public ngAfterViewInit(): void {
		// If the browser doesn't support "position: sticky" or doesn't support the
		// IntersectionObserver, let's short-circuit the initialization of the sticky
		// header component. This will allow the component to degrade gracefully.
		if (!this.supportsStickyPosition() || !IntersectionObserver) {
			return;
		}

		// If the browser supports "position: sticky", we're going to start watching for
		// changes in DOM-state. In order to limit the amount of change-detection that
		// Angular will run, let's configure the IntersectionObserver outside of the core
		// NgZone. Then, we can re-enter the zone when public state has to change.
		this.zone.runOutsideAngular(() => {
			this.observer = new IntersectionObserver(this.handleIntersection);
			this.observer.observe(this.bottomMarkerRef.nativeElement);
			this.observer.observe(this.topMarkerRef.nativeElement);
		});
	}

	// ---
	// PRIVATE METHODS.
	// ---

	// I handle changes to the intersection of the observed elements.
	private handleIntersection = (entries: IntersectionObserverEntry[]): void => {
		const previousIsStuck = this.isStuck;
		let nextIsStuck = this.isStuck;

		for (const entry of entries) {
			if (entry.target === this.bottomMarkerRef.nativeElement) {
				this.isBottomMarkerVisible = entry.isIntersecting;
			}

			if (entry.target === this.topMarkerRef.nativeElement) {
				this.isTopMarkerVisible = entry.isIntersecting;
			}
		}

		// Since we know that the "sticky-header" component will only stick to the top of
		// the Viewport with "top: 0px", we know that the header can be considered stuck
		// if the bottom marker is visible and the top marker is not. This would place
		// the top-edge of the header along the top-edge of the Viewport.
		// --
		// CAUTION: This is a rough calculation and does not account for border styling
		// that may be applied to the header by the calling-context.
		nextIsStuck = this.isBottomMarkerVisible && !this.isTopMarkerVisible;

		// If the overall "stickiness" of the header hasn't changed, just return out.
		// While this callback may have changed private properties, nothing public has
		// changed. As such, we don't have to worry about triggering change-detection.
		if (nextIsStuck === previousIsStuck) {
			return;
		}

		// If the stickiness of the header has changed (either entering or exiting the
		// sticky state), we are going to change the public state of the component. As
		// such, we need to dip back into the core Zone so that these changes will be
		// picked up by the change-detection digest.
		this.zone.run(() => {
			this.isStuck = nextIsStuck;
			(this.isStuck) ? this.elementRef.nativeElement.classList.add(this.stickyClass) :
				this.elementRef.nativeElement.classList.remove(this.stickyClass);
		});
	};

	// I determine if the browser supports "position: sticky".
	private supportsStickyPosition(): boolean {
		if (typeof CSS === 'undefined' || !CSS.supports) {
			return false;
		}

		return CSS.supports('position', 'sticky') || CSS.supports('position', '-webkit-sticky');
	}
}
