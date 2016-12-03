#include <Wire.h>
#include "Adafruit_Trellis.h"

#define MOMENTARY 0
#define LATCHING 1
// set the mode here
#define MODE LATCHING
//#define MODE MOMENTARY

Adafruit_Trellis matrix0 = Adafruit_Trellis();
Adafruit_TrellisSet trellis =  Adafruit_TrellisSet(&matrix0);
// or use the below to select 4, up to 8 can be passed in
//Adafruit_TrellisSet trellis =  Adafruit_TrellisSet(&matrix0, &matrix1, &matrix2, &matrix3);

// set to however many you're working with here, up to 8
#define NUMTRELLIS 1

#define numKeys (NUMTRELLIS * 16)

// Connect Trellis Vin to 5V and Ground to ground.
// Connect the INT wire to pin #A2 (can change later!)
#define INTPIN A2
// Connect I2C SDA pin to your Arduino SDA line
// Connect I2C SCL pin to your Arduino SCL line
// All Trellises share the SDA, SCL and INT pin!
// Even 8 tiles use only 3 wires max

int LEDstatus[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int blinkStatus = 1;
int blinkTime = 0;
int buttonPress[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int oldStatus[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

void setup() {
  Serial.begin(9600);
  // INT pin requires a pullup
  pinMode(INTPIN, INPUT);
  digitalWrite(INTPIN, HIGH);

  trellis.begin(0x70);  // only one

  // light up all the LEDs in order
   for (uint8_t i = 0; i < numKeys; i++) {
     trellis.setLED(i);
     trellis.writeDisplay();
     delay(50);
   }

  // then turn them off
  for (uint8_t i = 0; i < numKeys; i++) {
    trellis.clrLED(i);
    trellis.writeDisplay();
    delay(50);
  }
  while (Serial.available() <= 0) {
    Serial.println("hello"); // send a starting message
    delay(300);              // wait 1/3 second
  }
}

void loop() {
  delay(80); // 30ms delay is required, dont remove me!


  /*************************************
  // SENDING DATA TO P5.JS
  *************************************/
  if (Serial.available() > 0) {

      // reading serial from p5.js
      int incoming = Serial.read();

      // print current status
      for (int i = 0; i < 16; i++) {
        Serial.print(LEDstatus[i]);
        Serial.print(",");
      }

      // volume knob
      int pot2Value = analogRead(A1);
      int pot2ValueMapped = map(pot2Value, 0, 1020, 1, 100);
      Serial.print(pot2ValueMapped);
      Serial.print(",");

      // step knob
      int pot3Value = analogRead(A3);
      int pot3ValueMapped = map(pot3Value, 0, 1020, 1, 4);
      Serial.print(pot3ValueMapped);
      Serial.print(",");

      // speed knob
      int pot1Value = analogRead(A0);
      int pot1ValueMapped = map(pot1Value, 0, 1020, 1, 100);
      Serial.print(pot1ValueMapped);
      Serial.print(",");

      // // cut knob
      // int pot3Value = analogRead(A3);
      // int pot3ValueMapped = map(pot3Value, 0, 1020, 1, 4);
      // Serial.print(pot3ValueMapped);
      // Serial.print(",");

      // blink data
      Serial.print(blinkTime);

      //////// SENDING BLINK DATA FROM DEBUG PURPOSES
      // Serial.print(",");
      // Serial.print(blinkTime);
      // Serial.print(",");
      // Serial.print(blinkStatus);
      // Serial.print(",");
      // for (int i = 0; i < 16; i++) {
      //   Serial.print(buttonPress[i]);
      //   Serial.print(",");
      // }

      // steps knob
      //      int pot3Value = analogRead(A4);
      //      int pot3ValueMapped = map(pot3Value, 0, 1020, 1, 100);
      //      Serial.print(pot3ValueMapped);

      Serial.println("");
  }

  /*************************************************
  // CHANGING BUTTON STATES BASED ON BUTTON PRESSES
  **************************************************/

  blinkTime = blinkTime + 1;
  if (blinkTime == 5) {
    blinkTime = 0;
  }

  trellis.readSwitches();
  for (uint8_t n = 0; n < numKeys; n++) {
    if (trellis.justPressed(n)) {
      LEDstatus[n] = 3;

      continue;
    }

      if (LEDstatus[n] == 3) {
        buttonPress[n]++;
        if (blinkTime >= 4) {
          if (trellis.isLED(n)) {
            trellis.clrLED(n);
            trellis.writeDisplay();
            } else {
              trellis.setLED(n);
              trellis.writeDisplay();
            }
        }
      }

    if (trellis.justReleased(n)) {
      if (buttonPress[n] > 8) {
        LEDstatus[n] = 1;
        oldStatus[n] = 1;
        buttonPress[n] = 0;
        trellis.setLED(n);
        trellis.writeDisplay();
      } else {
        buttonPress[n] = 0;
        if (oldStatus[n] == 1) {
          LEDstatus[n] = 0;
          oldStatus[n] = 0;
          trellis.clrLED(n);
          trellis.writeDisplay();
        } else {
          LEDstatus[n] = 1;
          oldStatus[n] = 1;
          trellis.setLED(n);
          trellis.writeDisplay();
        }
      }
    }
  }
}

