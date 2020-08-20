// Enable p5.js Intellisense using typescript definition file
/// <reference path="./p5.global-mode.d.ts" />
let sample;         // current sample
let modulator;      // osc to modulate the amplitude of the carrier
let fft;            // used to visualize the waveform
let loopStart       // holds start of loop (in seconds)
let loopDur;        // holds length of loop (in seconds)
let prevLoopStart;  // holds previous start of loop (in seconds)
let prevLoopDur;    // holds previous length of loop (in seconds)
let loopCue;        // holds overall loopCue time
function preload() {
  // Load a sound file
  sample = loadSound('jul.mp3');
}

function setup() {
  createCanvas(900, 400);
  noFill();
  background(30);

  // KNOBS
  // These are the 9 parameters that need to be passed to the MakeKnob function:
  /////////////////////////////////////
  // knobColor - use a word in quotes "red" or rgb value in brackets [255,0,0] or rgba [0,255,255,100]
  // diameter - Set knob size in pixels. Integer
  // locx, locy - Set the location on the canvas horizontal and vertical pixel coordinates.
  // lowNum, hiNum - Set the range of values returned. Floating point numbers are ok.
  // defaultNum - Sets the default value of the knob. DO NOT set a frequency knob to 0. Amplitude can be 0.
  // numPlaces - Refers to the displayed value below the knob. Sets the number of decimal places to display. 
  //  - Does not affect the actual value returned which is a float.
  // labelText - the text to display below the knob. example: "Frequency"
  // textColor - sets the color of the label and display value text; 
  //  - use a color word in quotes "cyan" or rgb or rgba value in brackets [255,0,0] [200,150,100,150]
  // textPt - enter a number (ie. 18) for the size of the type - sets return value and label text size
  masterKnob = new MakeKnobC("black", 100, 100, 100, 0, 1, .5, 2, "Amplitude", "white", 12);
  speedKnob = new MakeKnobC("black", 100, 200, 100, -5, 5, 1, 2, "Speed", "white", 12);
  modKnob = new MakeKnobC("black", 100, 400, 100, 0, 1, .5, 2, "Mod Amplitude", "white", 12);
  freqKnob = new MakeKnobC("black", 100, 500, 100, 0, 20, 0, 2, "Mod Freq", "white", 12);
  loopStartKnob = new MakeKnobC("black", 100, 700, 100, 0, 10, 0, 2, "Loop Start", "white", 12);
  loopDurKnob = new MakeKnobC("black", 100, 800, 100, .1, 10, 1, 2, "Loop Duration", "white", 12);

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
  sample.loop();
}

function draw() {
  background(30, 30, 30, 100); // alpha

  // Set the volume to a range between 0 and 1.0
  sample.amp(masterKnob.knobValue);

  // Set the rate to a range between -5 and 5.0
  sample.rate(speedKnob.knobValue);

  // Set the modulator freq to a range between 0 and 20hz
  //let modFreq = map(freqKnob.knobValue, 0, 20, 0, 20);
  modulator.freq(freqKnob.knobValue);

  // Set the modulator amplitude to a range between 0 and 1.0
  //let modAmp = map(modKnob.knobValue, 0, 1, 0, 1);
  modulator.amp(modKnob.knobValue, 0.01); // fade time of 0.1 for smooth fading

  // analyze the waveform
  waveform = fft.waveform();

  // draw the shape of the waveform
  //drawWaveform();

  // Set loop values based on knob position
  loopStart = loopStartKnob.knobValue;
  loopDur = loopDurKnob.knobValue
  // if loop start value has changed, play sample again
  if (loopStart != prevLoopStart) {
    prevLoopStart = loopStart;
    //sample.jump(loopStart);
    sample.jump(loopStart);
    loopCtrl();
  }

  if (loopDur != prevLoopDur) {
    prevLoopDur = loopDur;
    sample.jump(1);
    loopCtrl();
  }

  function loopCtrl() {
    loopCue = loopStart + loopDur;
    console.log(loopCue);
    sample.clearCues();
    sample.addCue(2, jumper);
  }

  function jumper() {
    sample.jump(1);
  }


  //draw/update all knobs
  masterKnob.update();
  speedKnob.update();
  modKnob.update();
  freqKnob.update();
  loopStartKnob.update();
  loopDurKnob.update();
}

// function drawWaveform() {
//   stroke(240);
//   strokeWeight(1);
//   beginShape();
//   for (let i = 0; i < waveform.length; i++) {
//     let x = map(i, 0, waveform.length, 0, width);
//     let y = map(waveform[i], -1, 1, -height / 2, height / 2);
//     vertex(x, y + 300);
//   }
//   endShape();
// }

// function drawText(modFreq, modAmp) {
//   strokeWeight(1);
//   text('Modulator Frequency: ' + modFreq.toFixed(3) + ' Hz', 20, 20);
//   text('Modulator Amplitude: ' + modAmp.toFixed(3), 20, 40);
// }

function mousePressed() {
  // pause sample while parameters are being changed
  // sample.stop();
  // enable all knobs
  masterKnob.active();
  speedKnob.active();
  modKnob.active();
  freqKnob.active();
  loopStartKnob.active();
  loopDurKnob.active();
}

function mouseReleased() {
  // resume sample when parameters are set
  // sample.jump(loopStart);
  // sample.play();
  // disable all knobs
  masterKnob.inactive();
  speedKnob.inactive();
  modKnob.inactive();
  freqKnob.inactive();
  loopStartKnob.inactive();
  loopDurKnob.inactive();
}
