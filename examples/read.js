'use strict';

const Hts221 = require('../');

let hts221;

Hts221.open().then((sensor) => {
  hts221 = sensor;
  return hts221.read();
}).then((reading) => {
  console.log('celsius: ' + reading.celsius);
  console.log('humidity: ' + reading.humidity);
  return hts221.close();
}).catch((err) => {
  console.log(err);
});

