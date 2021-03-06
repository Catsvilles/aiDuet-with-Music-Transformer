/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'style/about.css'
import YouTubeIframeLoader from 'youtube-iframe'
import events from 'events'

const magentaLink = 'https://magenta.tensorflow.org/'
const originalList = 'https://experiments.withgoogle.com/ai/ai-duet/view/'
const onsetFramesLink = 'https://magenta.tensorflow.org/onsets-frames'
const transformerLink = 'https://magenta.tensorflow.org/music-transformer'


const blurbCopy = `This project builds on the original <a target='_blank' href='${originalList}'> A.I. Duet</a>
				   project by Yotam Mann.  We added the option to use raw audio as input by incorporating 
				   the <a target='_blank' href='${onsetFramesLink}'> Onset and Frames </a>  model from the 
				   <a target='_blank' href='${magentaLink}'>Magenta</a> project to transcribe audio input to MIDI. 
				   You can upload your own audio file or record music from your microphone and get an improvised 
				   continuation from the <a target='_blank' href='${transformerLink}'> Transformer</a>  model.`

export class About extends events.EventEmitter{
	constructor(container){

		super()

		this._container = document.createElement('div')
		this._container.id = 'about'
		container.appendChild(this._container)

		this._toggleButton = document.createElement('div')
		this._toggleButton.id = 'aboutButton'
		this._toggleButton.classList.add('open')
		container.appendChild(this._toggleButton)
		this._toggleButton.addEventListener('click', (e) => {
			e.preventDefault()
			if (this.isOpen()){
				this.close()
			} else {
				this.open()
			}
		})

		const content = document.createElement('div')
		content.id = 'content'
		this._container.appendChild(content)

		const title = document.createElement('div')
		title.id = 'title'
		title.textContent = 'A.I. Duet'
		// content.appendChild(title)

		// TODO once we have a video add it here
		const video = document.createElement('div')
		video.id = 'video'
		//vid YT0k99hCY5I
		video.innerHTML = `<iframe id='youtube-iframe' src="https://www.youtube.com/embed/0ZE1bfPtvZo?modestbranding=0&showinfo=0&enablejsapi=1" frameborder="0" allowfullscreen></iframe>`
		content.appendChild(video)

		this._ytplayer = null

		this._playButton = document.createElement('div')
		this._playButton.id = 'playButton'
		this._playButton.classList.add('visible')
		video.appendChild(this._playButton)

		YouTubeIframeLoader.load((YT) => {
			this._ytplayer = new YT.Player('youtube-iframe', {
				events : {
					onStateChange : (state) => {
						this._playButton.classList.remove('visible')
					}
				}
			})
		})

		const blurb = document.createElement('div')
		blurb.id = 'blurb'
		content.appendChild(blurb)
		blurb.innerHTML = blurbCopy

	}
	close(){
		this._toggleButton.classList.remove('close')
		this._toggleButton.classList.add('open')

		this._container.classList.remove('visible')

		if (this._ytplayer && this._ytplayer.stopVideo){
			this._ytplayer.stopVideo()
		}
		this.emit('close')
		if (window.ga){
			ga('send', 'event', 'AI-Duet', 'Click', 'About - Close')
		}
	}
	open(play=false){
		this._toggleButton.classList.add('close')
		this._toggleButton.classList.remove('open')

		this._playButton.classList.add('visible')
		this._container.classList.add('visible')
		this.emit('open')
		if (window.ga){
			ga('send', 'event', 'AI-Duet', 'Click', 'About - Open')
		}
		if (play){
			this._playVideo()
		}
	}
	// waits until the player is ready to play the video, 
	// otherwise goes back into waiting loop
	_playVideo(retries=0){
		if (this._ytplayer && this._ytplayer.playVideo){
			this._ytplayer.playVideo()
		} else if (retries < 10 && this.isOpen()){
			setTimeout(() => this._playVideo(retries+1), 200);
		}	
	}
	isOpen(){
		return this._container.classList.contains('visible')
	}
	showButton(){
		this._toggleButton.classList.add('show')
	}
}