'use strict';

const hts221 = require('../');

hts221.open().then(sensor =>
  sensor.read().
  then(reading => {
    console.log('celsius: ' + reading.celsius);
    console.log('humidity: ' + reading.humidity);
  }).
  then(_ => sensor.close())
).catch(console.log);

