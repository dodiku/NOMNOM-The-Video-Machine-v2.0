blinkTime = blinkTime + 100;
if (blinkTime == 500) {
  blinkTime = 0;
}

// check out if there were changes to button status
    // making changes on specific video. LED should blink
    // begin
    for (uint8_t n = 0; n < numKeys; n++) {
       if (trellis.isKeyPressed(n)) {
        buttonPress[n] = buttonPress[n] + 1;
        if (buttonPress[n] > 8 ) {
          buttonOldStatus[n] = LEDstatus[n];
          LEDstatus[n] = 3;
          if (blinkTime >= 500) {
            if (trellis.isLED(n)){
              trellis.clrLED(n);
            } else {
              trellis.setLED(n);
            }
            blinkTime = 0;
//                  trellis.setLED(n);
            trellis.writeDisplay();
            }
        }


//            if ((blinkStatus == 1) && (blinkTime >= 1000) ) {
//              trellis.clrLED(n);
//              blinkStatus = 0;
//            } else {
//              trellis.setLED(n);
//              blinkStatus = 1;
//            }
    }
    // end
    } // end of for loop




    if (trellis.readSwitches()) {

   for (uint8_t n = 0; n < numKeys; n++) {
     if ((trellis.justPressed(n)) && (LEDstatus[n] == 3)) {
       trellis.setLED(n);
       LEDstatus[n] = 1;
     } else if (trellis.justPressed(n)) {
       if (trellis.isLED(n)) {
         trellis.clrLED(n);
         LEDstatus[n] = 0;
//              trellis.writeDisplay();
       } else {
         trellis.setLED(n);
         LEDstatus[n] = 1;
//              trellis.writeDisplay();
       }
     }
//          if (trellis.justPressed(n)) {
//             if (trellis.isLED(n)) {
//              trellis.clrLED(n);
//              LEDstatus[n] = 0;
////              trellis.writeDisplay();
//            } else {
//              trellis.setLED(n);
//              LEDstatus[n] = 1;
////              trellis.writeDisplay();
//            }
//
//            }



     }
     trellis.writeDisplay();



//          if ((trellis.justReleased(n)) && (LEDstatus[n] == 3)) {
//            trellis.setLED(n);
//            LEDstatus[n] = 1;
//          }
//
//          if ((trellis.justReleased(n)) && (LEDstatus[n] == 1)) {
//            trellis.clrLED(n);
//            LEDstatus[n] = 0;
//          }
//
//          if ((trellis.justReleased(n)) && (LEDstatus[n] == 0)) {
//            trellis.setLED(n);
//            LEDstatus[n] = 1;
//          }

     //          if (trellis.justReleased(n)) {
     //            if (trellis.isLED(n)) {
     //              trellis.clrLED(n);
     //              LEDstatus[n] = 0;
     //            } else {
     //              trellis.setLED(n);
     //              LEDstatus[n] = 1;
     //            }
     //          }


//        }
//        trellis.writeDisplay();
 }
