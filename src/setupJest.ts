import 'jest-preset-angular/setup-jest';
/*import 'zone.js';
import 'zone.js/testing';
import {getTestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting(), {
		teardown: { destroyAfterEach: false }
	}
);*/

Object.defineProperty(window, 'CSS', {value: {supports: false}});
Object.defineProperty(document, 'doctype', {
	value: '<!DOCTYPE html>'
});
Object.defineProperty(window, 'getComputedStyle', {
	value: () => {
		return {
			display: 'none',
			appearance: ['-webkit-appearance']
		};
	}
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
	value: () => {
		return {
			enumerable: true,
			configurable: true,
		};
	},
});
// defineCustomElements();
import type {Components} from 'hc-video-player/dist/types/components';

customElements.define(
	'hc-video-player',
	class extends HTMLElement implements Components.HcVideoPlayer {
		private paused = false;

		playerTypePreference: ['v'];
		chapterStyle: 'popover-chapters' | 'bottom' = 'popover-chapters';
		multimedia: any;
		multimediaId: string;

		getDuration(): Promise<number> {
			return Promise.resolve(0);
		}

		getTime(): Promise<number> {
			return Promise.resolve(0);
		}

		getTitle(): Promise<string> {
			return Promise.resolve('');
		}

		isPaused(): Promise<boolean> {
			return Promise.resolve(this.paused);
		}


		onAvailable(): Promise<unknown> {
			console.log('called onAvailable');
			return Promise.resolve(undefined);
		}

		pause(): Promise<void> {
			this.paused = true;
			return Promise.resolve(undefined);
		}

		play(): Promise<void> {
			this.paused = false;
			return Promise.resolve(undefined);
		}

		setControlsEnabled(enabled: boolean): Promise<void> {
			return Promise.resolve(undefined);
		}

		setTime(timestamp: number): Promise<number> {
			return Promise.resolve(1);
		}
		constructor() {
			super();
		}

		getPlaybackRate(): Promise<number> {
			return Promise.resolve(undefined);
		}

		setPlaybackRate(rate: number): Promise<number> {
			return Promise.resolve(rate);
		}
		getCaptionLanguage(): Promise<string> {
			return Promise.resolve(null);
		}
		setCaptionLanguage(lang: string): Promise<string> {
			return Promise.resolve(lang);
		}
		getVolume(): Promise<number> {
			return Promise.resolve(undefined);
		}
		setVolume(rate: number): Promise<number> {
			return Promise.resolve(rate);
		}

		force360p: false;
	}
);
