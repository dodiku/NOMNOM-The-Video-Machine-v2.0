#include <Wire.h>
#include "Adafruit_Trellis.h"


#define MOMENTARY 0
#define LATCHING 1
// set the mode here
#define MODE LATCHING


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


void setup() {
  Serial.begin(9600);
  // INT pin requires a pullup
  pinMode(INTPIN, INPUT);
  digitalWrite(INTPIN, HIGH);

  // begin() with the addresses of each panel in order
  // I find it easiest if the addresses are in order
  trellis.begin(0x70);  // only one
  // trellis.begin(0x70, 0x71, 0x72, 0x73);  // or four!

  // light up all the LEDs in order
  //  for (uint8_t i = 0; i < numKeys; i++) {
  //    trellis.setLED(i);
  //    trellis.writeDisplay();
  //    delay(50);
  //  }
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
  delay(100); // 30ms delay is required, dont remove me!

  if (MODE == MOMENTARY) {
    // If a button was just pressed or released...
    if (trellis.readSwitches()) {
      // go through every button
      for (uint8_t i = 0; i < numKeys; i++) {
        // if it was pressed, turn it on
        if (trellis.justPressed(i)) {
          //Serial.print("v");
          Serial.write(i);
          trellis.setLED(i);
        }
        // if it was released, turn it off
        if (trellis.justReleased(i)) {
          //Serial.print("v");
          Serial.write(i);
          trellis.clrLED(i);
        }
      }
      // tell the trellis to set the LEDs we requested
      trellis.writeDisplay();
    }
  }

  if (Serial.available() > 0) {
    if (MODE == LATCHING) {
      int incoming = Serial.read();

      // print current status
      for (int i = 0; i < 16; i++) {
        Serial.print(LEDstatus[i]);
        Serial.print(",");
      }
      int pot1Value = analogRead(A0);
      int pot1ValueMapped = map(pot1Value, 0, 1020, 1, 100);
      Serial.print(pot1ValueMapped);
      Serial.print(",");

      int pot2Value = analogRead(A1);
      int pot2ValueMapped = map(pot2Value, 0, 1020, 1, 100);
      Serial.print(pot2ValueMapped);
      Serial.print(",");

      int pot3Value = analogRead(A3);
      int pot3ValueMapped = map(pot3Value, 0, 1020, 1, 100);
      Serial.print(pot3ValueMapped);

      Serial.println("");

      // check out if there were changes to button status
      if (trellis.readSwitches()) {
        for (int n = 0; n < 16; n++) {

          if (trellis.justPressed(n)) {
            if (trellis.isLED(n)) {
              trellis.clrLED(n);
              LEDstatus[n] = 0;
            } else {
              trellis.setLED(n);
              LEDstatus[n] = 1;
            }
          }
        }
        trellis.writeDisplay();
      }
    }
  }

}

