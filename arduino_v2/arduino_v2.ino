#include <Wire.h>
#include "Adafruit_Trellis.h"

Adafruit_Trellis matrix0 = Adafruit_Trellis();
Adafruit_TrellisSet trellis =  Adafruit_TrellisSet(&matrix0);

#define NUMTRELLIS 1
#define numKeys (NUMTRELLIS * 16)
#define INTPIN A2

int LEDstatus[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int blinkStatus = 1;
int blinkTime = 0;
int buttonPress[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int oldStatus[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

void setup() {
  Serial.begin(9600);
  pinMode(INTPIN, INPUT);
  pinMode(5, INPUT);
  pinMode(6, INPUT);
  pinMode(7, INPUT);
  pinMode(8, INPUT);
  digitalWrite(INTPIN, HIGH);

  trellis.begin(0x70);  // only one trellis is connected

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
  delay(80); // 30ms delay is required, don't remove me!


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

      // step knob
      int pot1Value = 0;
      if (digitalRead(5) == HIGH) {
        pot1Value = 4;
      } else if (digitalRead(6) == HIGH) {
        pot1Value = 3;
      } else if (digitalRead(7) == HIGH) {
        pot1Value = 2;
      } else if (digitalRead(8) == HIGH) {
        pot1Value = 1;
      }
      Serial.print(pot1Value);
      Serial.print(",");

      // volume knob
      int pot2Value = analogRead(A1);
      int pot2ValueMapped = map(pot2Value, 0, 1020, 0, 100);
      Serial.print(pot2ValueMapped);
      Serial.print(",");

      // speed knob
      int pot3Value = analogRead(A0);
      int pot3ValueMapped = map(pot3Value, 0, 1020, 0, 100);
      Serial.print(pot3ValueMapped);
      Serial.print(",");

      // cut knob
      int pot4Value = analogRead(A3);
      int pot4ValueMapped = map(pot4Value, 0, 1020, 0, 100);
      Serial.print(pot4ValueMapped);
      Serial.print(",");

      // blink data
      Serial.print(blinkTime);

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
