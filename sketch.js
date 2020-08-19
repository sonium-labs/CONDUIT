/// <reference path="./p5.global-mode.d.ts" />
let sample;
let modulator; // this oscillator will modulate the amplitude of the carrier
let fft; // we'll visualize the waveform

function preload() {
  // Load a sound file
  sample = loadSound('jul.mp3');
}

function setup() {
  createCanvas(600, 400);
  noFill();
  background(30);

  // KNOBS
  // These are the 9 parameters that need to be passed to the MakeKnob function:

  // imgSrc - Set the image source in the first parameter. example: "knob.png" or "images/knob.png"
  // diameter - Set knob size. Just a number (but refers to pixels)
  // locx, locy - Set the location on the canvas horizontal and vertical pixel coordinates.
  // lowNum, hiNum - Set the range of values returned. Floating point numbers.
  // defaultNum - Sets the default value of the knob. DO NOT set a frequency knob to 0. Amplitude can be 0.
  // numPlaces - Refers to the displayed value below the knob. Sets the number of decimal places to display. 
  //  - Does not affect the actual value returned.
  // label - the text to display below the knob. example: "Frequency"
  masterKnob = new MakeKnobC("white", 100, 100, 100, 0, 1, .5, 2, "Amplitude", "white", 12);
  speedKnob = new MakeKnobC("white", 100, 200, 100, -5, 5, 0, 2, "Speed", "white", 12);
  modKnob = new MakeKnobC("white", 100, 400, 100, 0, 1, .5, 2, "Mod Amplitude", "white", 12);
  freqKnob = new MakeKnobC("white", 100, 500, 100, 0, 20, 0, 2, "Mod Freq", "white", 12);

  modulator = new p5.Oscillator('triangle');
  modulator.disconnect(); // disconnect the modulator from master output
  modulator.freq(5);
  modulator.amp(1);
  modulator.start();

  // Modulate the carrier's amplitude with the modulator
  sample.amp(modulator.scale(-1, 1, 1, -1));

  // create an fft to analyze the audio
  fft = new p5.FFT();

  // Loop the sound forever
  // (well, at least until stop() is called)
  //sample.play();
  sample.loop();
}

function draw() {
  background(30, 30, 30, 100); // alpha

  // Set the volume to a range between 0 and 1.0
  sample.amp(masterKnob.knobValue);

  // Set the rate to a range between 0.1 and 4
  sample.rate(speedKnob.knobValue);

  // map mouseY to moodulator freq between 0 and 20hz
  let modFreq = map(freqKnob.knobValue, 0, 20, 0, 20);
  modulator.freq(freqKnob.knobValue);

  let modAmp = map(modKnob.knobValue, 0, 1, 0, 1);
  modulator.amp(modAmp, 0.01); // fade time of 0.1 for smooth fading

  // analyze the waveform
  waveform = fft.waveform();

  // draw the shape of the waveform
  drawWaveform();

  //drawText(modFreq, modAmp);

  //draw/update all knobs
  masterKnob.update();
  speedKnob.update();
  modKnob.update();
  freqKnob.update();
}

function drawWaveform() {
  stroke(240);
  strokeWeight(1);
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, -height / 2, height / 2);
    vertex(x, y + 300);
  }
  endShape();
}

function drawText(modFreq, modAmp) {
  strokeWeight(1);
  text('Modulator Frequency: ' + modFreq.toFixed(3) + ' Hz', 20, 20);
  text('Modulator Amplitude: ' + modAmp.toFixed(3), 20, 40);
}

function mousePressed() {
  masterKnob.active();
  speedKnob.active();
  modKnob.active();
  freqKnob.active();
}

function mouseReleased() {
  masterKnob.inactive();
  speedKnob.inactive();
  modKnob.inactive();
  freqKnob.inactive();
}
