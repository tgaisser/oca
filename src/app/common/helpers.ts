import {Store} from '@ngrx/store';
import {State} from '../state';
import {Observable} from 'rxjs';
import {filter, withLatestFrom} from 'rxjs/operators';
import {Course, DescriptionHaver, OCPage, Partnership, TvAdLandingPage} from '../services/course-data.service';
import {Meta} from '@angular/platform-browser';
import {HcSimpleMdPipe} from 'hillsdale-ng-helper-lib';
import {MultimediaItem} from 'hc-video-player';
import {ElementRef} from '@angular/core';
import {IMultiMediaComponent, MediaType} from './models';
import {userSetVideoPreferences} from '../state/user/actions';

export function onlyIfUserLoggedIn(store: Store<State>) {
	return <T>(source: Observable<T>) => {
		return source.pipe(
			withLatestFrom(store),
			filter(([action, state]) => !!state.user.currentUser)
		);
	};
}

export function setNonCourseMetaTags(meta: Meta, page: DescriptionHaver) {
	if (page?.meta_description) meta.updateTag({ name: 'description', content: page.meta_description || '' });
	meta.updateTag({
		property: 'og:type',
		content: 'website'
	});

	meta.removeTag('property="og:title"');
	meta.removeTag('name="twitter:title"');
	meta.removeTag('property="og:description"');
	meta.removeTag('name="twitter:description"');
	meta.removeTag('property="og:image"');
	meta.removeTag('name="twitter:image"');
	meta.removeTag('property="og:url"');
	meta.removeTag('name="twitter:card"');
}

export function setPartnershipMetaTags(p: Partnership, meta: Meta, simpleMdPipe: HcSimpleMdPipe, currentUrl: string, partnerName?: string) {
	meta.updateTag({name: 'description', content: simpleMdPipe.transform(p.meta_description ?? '', 'plaintext')});

	meta.updateTag({
		property: 'og:type',
		content: 'website'
	});

	meta.updateTag({
		property: 'og:title',
		content: simpleMdPipe.transform(partnerName ?? p.partner_name + ' Partnership', 'plaintext') + ' | Hillsdale College Online Courses'
	});
	meta.updateTag({
		name: 'twitter:title',
		content: simpleMdPipe.transform(partnerName ?? p.partner_name + ' Partnership', 'plaintext') + ' | Hillsdale College Online Courses'
	});

	meta.updateTag({
		property: 'og:description',
		content: simpleMdPipe.transform(p.meta_description ?? '', 'plaintext')
	});
	meta.updateTag({
		name: 'twitter:description',
		content: simpleMdPipe.transform(p.meta_description ?? '', 'plaintext')
	});

	meta.updateTag({
		property: 'og:image',
		content: p.social_graph_image?.url + '?w=1200',
	});
	meta.updateTag({
		name: 'twitter:image',
		content: p.social_graph_image?.url + '?w=1200',
	});

	meta.updateTag({
		property: 'og:url',
		content: currentUrl
	});

	meta.updateTag({
		name: 'twitter:card',
		content: 'summary'
	});
}

export function setTvAdMetaTags(tvAd: TvAdLandingPage, meta: Meta, simpleMdPipe: HcSimpleMdPipe, currentUrl: string, tvAdName?: string) {
	meta.updateTag({name: 'description', content: simpleMdPipe.transform(tvAd.meta_description ?? '', 'plaintext')});

	meta.updateTag({
		property: 'og:type',
		content: 'website'
	});

	meta.updateTag({
		property: 'og:title',
		content: simpleMdPipe.transform(tvAdName ?? tvAd.tv_ad_name, 'plaintext') + ' | Hillsdale College Online Courses'
	});
	meta.updateTag({
		name: 'twitter:title',
		content: simpleMdPipe.transform(tvAdName ?? tvAd.tv_ad_name, 'plaintext') + ' | Hillsdale College Online Courses'
	});

	meta.updateTag({
		property: 'og:description',
		content: simpleMdPipe.transform(tvAd.meta_description ?? '', 'plaintext')
	});
	meta.updateTag({
		name: 'twitter:description',
		content: simpleMdPipe.transform(tvAd.meta_description ?? '', 'plaintext')
	});

	meta.updateTag({
		property: 'og:image',
		content: tvAd.social_graph_image?.url + '?w=1200',
	});
	meta.updateTag({
		name: 'twitter:image',
		content: tvAd.social_graph_image?.url + '?w=1200',
	});

	meta.updateTag({
		property: 'og:url',
		content: currentUrl
	});

	meta.updateTag({
		name: 'twitter:card',
		content: 'summary'
	});
}

export function setCourseMetaTags(c: Course, meta: Meta, simpleMdPipe: HcSimpleMdPipe, currentUrl: string, title?: string) {
	meta.updateTag({name: 'description', content: simpleMdPipe.transform(c.meta_description, 'plaintext')});

	meta.updateTag({
		property: 'og:type',
		content: 'website'
	});

	meta.updateTag({
		property: 'og:title',
		content: simpleMdPipe.transform(title ?? c.title, 'plaintext') + ' | Hillsdale College Online Courses'
	});
	meta.updateTag({
		name: 'twitter:title',
		content: simpleMdPipe.transform(title ?? c.title, 'plaintext') + ' | Hillsdale College Online Courses'
	});

	meta.updateTag({
		property: 'og:description',
		content: simpleMdPipe.transform(c.meta_description, 'plaintext')
	});
	meta.updateTag({
		name: 'twitter:description',
		content: simpleMdPipe.transform(c.meta_description, 'plaintext')
	});

	meta.updateTag({
		property: 'og:image',
		content: c.catalog_image.url + '?w=1200',
	});
	meta.updateTag({
		name: 'twitter:image',
		content: c.catalog_image.url + '?w=1200',
	});

	meta.updateTag({
		property: 'og:url',
		content: currentUrl
	});

	meta.updateTag({
		name: 'twitter:card',
		content: 'summary'
	});
}

export function addMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60000);
}

export function addSeconds(date: Date, seconds: number): Date {
	return new Date(date.getTime() + seconds * 1000);
}

export function convertTimeStringToSeconds(timeString: string): number{
	const times = timeString.split(':');
	let seconds = 0;
	let multiplier = 1;
	while (times.length > 0) {
		seconds += multiplier * parseInt(times.pop(), 10);
		multiplier *= 60;
	}
	return seconds;
}

export function convertSecondsToTimeString(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return (hours > 0 ? hours.toString().padStart(2, '0') + ':' : '') +
		minutes.toString().padStart(2, '0') + ':' +
		remainingSeconds.toString().padStart(2, '0');
}

export function setVideo(playerVideoRef: ElementRef<HTMLHcVideoPlayerElement>, newMM?: MultimediaItem, captionLanguage?: string, selectedVolume?: string) {
	const existingMM = (playerVideoRef?.nativeElement?.multimedia as MultimediaItem);
	if (playerVideoRef?.nativeElement && newMM && newMM?.id !== existingMM?.id) {
		playerVideoRef.nativeElement.multimedia = (newMM as MultimediaItem);
	}
	if (captionLanguage && captionLanguage !== 'null') {
		// console.log('setting language', captionLanguage);
		//defer to next frame, and set the language
		setTimeout(() => {
			playerVideoRef?.nativeElement.setCaptionLanguage(captionLanguage).then();
		});
	}
	if (selectedVolume && selectedVolume !== 'null') {
		setTimeout(() => {
			playerVideoRef?.nativeElement.setVolume(+selectedVolume).then();
		});
	}
}


export function handleMediaModeSwitch(playerComponent: IMultiMediaComponent, newMode: 'audio'|'video', store?: Store<State>) {
	if (newMode === playerComponent._mediaMode) return;

	if (newMode === 'video') {
		playerComponent.hasInitVideo = true;

		const wasPlaying = playerComponent.audioPlayer?.playing ?? false;
		playerComponent.audioPlayer?.pause().then(async _ => {
			console.log('audio player paused on switch');
			const time = await playerComponent.audioPlayer?.getTime();
			if (time) {
				await playerComponent.playerVideoRef?.nativeElement.setTime(time);
			}
			if (wasPlaying) {
				await playerComponent.playerVideoRef?.nativeElement?.play();
			}
		});
	} else if (newMode === 'audio') {
		playerComponent.hasInitAudio = true;
		playerComponent.playerVideoRef?.nativeElement?.isPaused().then(async wasPaused => {
			return !wasPaused;
		})
			.then(async wasPlaying => {
				console.log('video player paused on switch');
				const time = await playerComponent.playerVideoRef.nativeElement.getTime();
				if (time) {
					if (playerComponent.audioPlayer) {
						await playerComponent.audioPlayer.setTime(time);
						playerComponent.audioPlayer.resetWaveformSize();
					} else {
						playerComponent.videoStartPosition = time;
					}
				}
				if (wasPlaying) {
					await playerComponent.playerVideoRef?.nativeElement?.pause();
					await playerComponent.audioPlayer?.play();
				}
			});
	}

	playerComponent._mediaMode = newMode;
	// store?.dispatch(userSetVideoPreferences({preferAudioLectures: newMode === 'audio'}));
}

export function removeURLParameter(url: string, parameter: string): string {
	const urlparts = url.split('?');
	if (urlparts.length === 1) return url;

	const prefix = encodeURIComponent(parameter) + '=';
	const pars = urlparts[1].split(/[&;]/g);

	//reverse iteration as may be destructive
	for (let i = pars.length; i-- > 0;) {
		//idiom for string.startsWith
		if (pars[i].lastIndexOf(prefix, 0) !== -1) {
			pars.splice(i, 1);
		}
	}

	let result = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
	if(result.endsWith('?') || result.endsWith('&')) result = result.slice(0, -1);
	return result;
}


export function mergeQueryParamsFromSourceUrlIntoDestinationUrl(sourceUrl: string, destinationUrl: string): string {
	const srcUrl = new URL(sourceUrl);
	const srcParams = new URLSearchParams(srcUrl.search);

	const destUrl = new URL(destinationUrl);
	const destParams = new URLSearchParams(destUrl.search);

	// @ts-ignore
	for (const [key, value] of srcParams.entries()) {
		destParams.set(key, value);
	}

	destUrl.search = destParams.toString();

	return destUrl.toString();
}
