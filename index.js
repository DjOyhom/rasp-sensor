const { Board, Proximity, Led } = require("johnny-five");
const board = new Board();

const ip_parking_api = "192.168.1.4";
const port_parking_api = "3003";

const { exec } = require('child_process');const { throws } = require("assert");

var able = true;

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "HCSR04",
    pin: 7
  });

  const led_red = new Led(8);
  led_red.on();
  const led_green = new Led(9);
  led_green.off();

  proximity.on("change", () => {
    const {centimeters, inches} = proximity;
    if (centimeters > 15 && centimeters < 20 && able == true){
      able = false;
      exec('fswebcam -p YUYV -d /dev/video0 -r 640x480 ima.jpeg', (err, stdout, stderr) => {
        console.log(err)
        console.log(stderr)
        console.log(stdout)
        exec('curl -F "photo=@ima.jpeg" ' + ip_parking_api + ":" + port_parking_api + "/upload_photo", (err, stdout, stderr) => {
          console.log(err)
          console.log(stderr)
          console.log(stdout)
          if (stdout == "ok"){
            led_green.on();
            led_red.off();
            setTimeout(function (){
              led_green.off();
              led_red.on();
              able = true;
            }, 5000)
          }else{
            led_green.off();
            led_red.on();
            setTimeout(function (){
              able = true;
            }, 5000)
          }
        });
      });
    } 
  });
});
// exec('curl -F "photo=@ima.jpeg" ' + ip_parking_api + ":" + port_parking_api + "/upload_photo", (err, stdout, stderr) => {
//   console.log(err)
//   console.log(stderr)
//   console.log(stdout)
// });