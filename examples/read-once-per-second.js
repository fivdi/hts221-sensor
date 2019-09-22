'use strict';

const hts221 = require('../');

hts221.open().then(sensor =>
  setInterval(_ =>
    sensor.read().
    then(reading => {
      console.log('celsius: ' + reading.celsius);
      console.log('humidity: ' + reading.humidity);
    }).catch(console.log),
    1000
  )
).catch(console.log);

