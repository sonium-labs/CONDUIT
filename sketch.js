// Enable p5.js Intellisense using typescript definition file
/// <reference path="./p5.global-mode.d.ts" />
var sample;         // current sample
var modulator;      // osc to modulate the amplitude of the carrier
var fft;            // used to visualize the waveform
var loopStart = 0;       // holds start of loop (in seconds)
var loopDur = 2;        // holds length of loop (in seconds)
var prevLoopStart;  // holds previous start of loop (in seconds)
var prevLoopDur;    // holds previous length of loop (in seconds)
var loopCue;        // holds overall loopCue time
var i = 0;
var revEnable = 1;  
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
  speedKnob = new MakeKnobC("black", 100, 200, 100, 0, 5, 1, 2, "Speed", "white", 12);
  modKnob = new MakeKnobC("black", 100, 400, 100, 0, 1, .5, 2, "Mod Amplitude", "white", 12);
  freqKnob = new MakeKnobC("black", 100, 500, 100, 0, 20, 0, 2, "Mod Freq", "white", 12);
  loopStartKnob = new MakeKnobC("black", 100, 700, 100, 0, 10, 0, 2, "Loop Start", "white", 12);
  loopDurKnob = new MakeKnobC("black", 100, 800, 100, .1, 10, 2, 2, "Loop Duration", "white", 12);

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
  //sample.playMode('restart');
  sample.stop();
  
  //jumploop();
  //sample.addCue(2, jumploop);

  // Start/Stop Buttons
  var startButton = createButton("Start");
  startButton.mousePressed(jumpLoop);
  startButton.position(0, height);
  var stopButton = createButton("Stop");
  stopButton.mousePressed(stopSamp);
  stopButton.position(50, height);
  // Reverse Button
  var revButton = createButton("Rev");
  revButton.mousePressed(revSamp);
  revButton.position(100, height);

  // Set initial values
  loopCtrl();
}
// Don't ask me why the button needs this to function...
function stopSamp() {
  sample.stop();
}

// Negates Sample Rate (changes direction of playback)
function revSamp() {
  revEnable *= -1;
}

function draw() {
  background(30, 30, 30, 255); // alpha

  // Set the volume to a range between 0 and 1.0
  sample.amp(masterKnob.knobValue);

  // Set the rate to a range between -5 and 5.0
  sample.rate(speedKnob.knobValue * revEnable);

  // Set the modulator freq to a range between 0 and 20hz
  //let modFreq = map(freqKnob.knobValue, 0, 20, 0, 20);
  modulator.freq(freqKnob.knobValue);

  // Set the modulator amplitude to a range between 0 and 1.0
  //let modAmp = map(modKnob.knobValue, 0, 1, 0, 1);
  modulator.amp(modKnob.knobValue, 0.01); // fade time of 0.1 for smooth fading

  // analyze the waveform
  waveform = fft.waveform();

  // draw the shape of the waveform
  drawWaveform();

  // Set loop values based on knob position
  loopStart = loopStartKnob.knobValue;
  loopDur = loopDurKnob.knobValue;

  //draw/update all knobs
  masterKnob.update();
  speedKnob.update();
  modKnob.update();
  freqKnob.update();
  loopStartKnob.update();
  loopDurKnob.update();
  
  // Debug text
  text('Debug: ', 50, 20);
  text('Start Position: ' + loopStart.toFixed(2) + " Sec", 150, 20);
  text('Current position: ' + sample.currentTime().toFixed(2) + ' Sec', 300, 20);
  text('Loop end time: ' + loopCue.toFixed(2) + ' Sec', 450, 20);
  text('Loop duration: ' + loopDur.toFixed(2) + ' Sec', 600, 20);
  text('Loop Diff: ' + abs(loopStart - loopDur).toFixed(2) + ' Sec', 800, 20);

  // Ensures sample pointer cannot leave loop
    if(revEnable == 1 && sample.currentTime() > loopCue) 
    {
      jumpLoop();
    } 
    else if(revEnable == -1 && sample.currentTime() < sample.duration() - loopCue) 
    {
      jumpLoop();
    }

}

function loopCtrl() {
  loopCue = loopStart + loopDur;
  console.log(loopCue);
  sample.clearCues();
  sample.addCue(loopCue, jumpLoop);
  console.log("Cue added!");
}

function jumpLoop() {
  console.log("Jump!" + i++);
  sample.jump(loopStart);
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
  
  // enable all knobs
  masterKnob.active();
  speedKnob.active();
  modKnob.active();
  freqKnob.active();
  loopStartKnob.active();
  loopDurKnob.active();
}

function mouseReleased() {
  // disable all knobs
  masterKnob.inactive();
  speedKnob.inactive();
  modKnob.inactive();
  freqKnob.inactive();
  loopStartKnob.inactive();
  loopDurKnob.inactive();
}

// Mostly unchanged from knob function, but added some sample logic to mouse on events near bottom of function
function MakeKnobC(knobColor, diameter, locx, locy, lowNum, hiNum, defaultNum, numPlaces, labelText, textColor, textPt) {
  this.pos = createVector(0,0);
  this.pos.x = locx;
  this.pos.y = locy;
  this.lowNum = lowNum;
  this.hiNum = hiNum;
  this.rotateMe = map(defaultNum, lowNum, hiNum, 0, -280);
  this.currentRot = map(defaultNum, lowNum, hiNum, 0, -280);
  this.radius = diameter;
  this.knobValue = defaultNum;
  this.displayValue=0;
  this.isClickedOn = false;
  this.mouseOver = false;
  this.myY=mouseY;
  this.label=labelText;
  this.numPlaces = numPlaces;
  this.knobColor = knobColor;
  this.textColor = textColor;
  this.textPt = textPt;
  
  // the update function will be called in the main program draw function
  this.update = function() {
    push(); // store the coordinate matrix ------------------------------------
       fill(255);
    // move the origin to the pivot point
    translate(this.pos.x, this.pos.y);

    // rotate the grid around the pivot point by a
    // number of degrees based on drag on button
  
    if (dist(this.pos.x, this.pos.y, mouseX, mouseY) < this.radius/2) {
      this.mouseOver = true;
    } else {
      this.mouseOver = false;
    }
    if (mouseIsPressed && this.isClickedOn) { 
      this.rotateMe=this.currentRot+map(mouseY, this.myY, 280, 0, 280);
      this.rotateMe=int(this.rotateMe);
      if (this.rotateMe <  -280) { this.rotateMe = -280; }
      if (this.rotateMe > 0) { this.rotateMe = 0; }
      rotate(radians(-this.rotateMe));   // change degrees to radians
    } else {
      rotate(radians(-this.rotateMe));
    }
  
    if (!mouseIsPressed ) {
      this.currentRot=this.rotateMe;
      this.isClickedOn = false;
    } 
    // now we actually draw the knob to the screen ----------------------------
    fill(200);
    ellipse(0, 0, this.radius, this.radius);
    fill(this.knobColor);
    ellipse(0, 0, this.radius-5, this.radius-5);
    fill(100);
    ellipse(0,0,this.radius/2,this.radius/2);
    fill(180);
    ellipse(0,0,(this.radius/2)-5,(this.radius/2)-5);
    fill(255);
    ellipse(-26, this.radius* 0.3, this.radius/10,this.radius/10);
    fill(0);
    pop(); // restore coordinate matrix
  
    rotate(0);
    fill(255);
   // add the display value and label
    textAlign(CENTER);
    this.knobValue=map(this.rotateMe, -280, 0, hiNum, lowNum);
    textSize(this.textPt);
    fill(this.textColor);
    text(""+ nfc(this.knobValue, numPlaces), this.pos.x, this.pos.y+this.radius/2+this.textPt*1.5); 
    text(this.label, this.pos.x, this.pos.y+this.radius/2+this.textPt*2.8);
  
    if (this.mouseOver || this.isClickedOn) { pointerCursor = true; }
  }; // end update
  
  this.active = function() {
    if (this.mouseOver){
      this.isClickedOn = true; 
      this.myY=mouseY;  
      cursor('pointer');
    } else {
      this.isClickedOn = false;
    }
  }
  
  this.inactive = function() {
    this.currentRot=this.rotateMe;
    if(this.isClickedOn) {          // added to update loop values when knob is updated
      loopCtrl();
    }
    this.isClickedOn = false;
    cursor('default');
  }
}