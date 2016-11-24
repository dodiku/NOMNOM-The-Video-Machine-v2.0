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
int buttonOldStatus[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

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

  delay(30);
  Serial.print("trellis.readSwitches(0):");
  Serial.print(trellis.readSwitches());
  Serial.print("\t"); 

  Serial.print("trellis.isKeyPressed(0):");
  Serial.print(trellis.isKeyPressed(0));
  Serial.print("\t");

  
  Serial.print("trellis.justPressed(0):");
  Serial.print(trellis.justPressed(0));
  Serial.print("\t");  

  Serial.print("trellis.justReleased(0):");
  Serial.println(trellis.justReleased(0));
  
  
}

