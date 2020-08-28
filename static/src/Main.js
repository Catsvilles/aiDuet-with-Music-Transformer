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

import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import {Splash} from 'interface/Splash'
import {About} from 'interface/About'
import {Tutorial} from 'ai/Tutorial'
import 'babel-polyfill'
import {AIRaw} from "./ai/AIRaw";
import {RollClass} from 'roll/Roll'
import events from "events";

/////////////// SPLASH ///////////////////	

const about = new About(document.body)
const splash = new Splash(document.body)

class Recorder {

	constructor(ai){
		this.ai = ai;
		this.recorder = undefined;
		this.isRecording = false;
	}


 init(roll) {
	navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
		console.log('CLONING STEAM')
		roll.set_stream(stream.clone())

		this.recorder = new window.MediaRecorder(stream);
		this.recorder.ondataavailable = (e) => {
			console.log("GOT DATA")
			this.transcribeFromFile(e.data)
		};
		this.recorder.start();
		this.isRecording = true;
		window.setInterval(() => {
						if (this.isRecording)
						{this.recorder.requestData()}
					}, 5000);
		});
 }

	transcribeFromFile(blob) {
		console.log("Transcribing " + blob)
		this.ai.submit(blob)
	}
}

const ai = new AIRaw()
const recorder = new Recorder(ai)
const roll = new RollClass()

splash.on('click', () => {
	console.log("GOT INIT RECORDER")
	recorder.init(roll);
	keyboard.activate()
	tutorial.start()
	about.showButton()
})

splash.on('about', () => {
	about.open(true)
})
about.on('close', () => {
	if (!splash.loaded || splash.isOpen()){
		splash.show()
	} else {
		keyboard.activate()
	}
})
about.on('open', () => {
	keyboard.deactivate()
	if (splash.isOpen()){
		splash.hide()
	}
})


/////////////// PIANO ///////////////////

const container = document.createElement('div')
container.id = 'container'
document.body.appendChild(container)

const glow = new Glow(container)
const keyboard = new Keyboard(container, roll)

const sound = new Sound()
sound.load()

keyboard.on('keyDown', (note) => {
	sound.keyDown(note)
	ai.keyDown(note)
	glow.user()
})

keyboard.on('keyUp', (note) => {
	sound.keyUp(note)
	ai.keyUp(note)
	glow.user()
})

/////////////// AI ///////////////////

ai.on('keyDown', (note, time) => {
	sound.keyDown(note, time, true)
	keyboard.keyDown(note, time, true)
	glow.ai(time)
})

ai.on('keyUp', (note, time) => {
	sound.keyUp(note, time, true)
	keyboard.keyUp(note, time, true)	
	glow.ai(time)
})

/////////////// TUTORIAL ///////////////////

const tutorial = new Tutorial(container)

tutorial.on('keyDown', (note, time) => {
	sound.keyDown(note, time)
	keyboard.keyDown(note, time)
	glow.user()
})

tutorial.on('keyUp', (note, time) => {
	sound.keyUp(note, time)
	keyboard.keyUp(note, time)
	glow.user()
})

tutorial.on('aiKeyDown', (note, time) => {
	ai.keyDown(note, time)
})

tutorial.on('aiKeyUp', (note, time) => {
	ai.keyUp(note, time)
})