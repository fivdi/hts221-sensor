'use strict';

const Hts221 = require('../');

Hts221.open().then((hts221) => {
  setInterval(() => {
    hts221.read().then((reading) => {
      console.log('celsius: ' + reading.celsius);
      console.log('humidity: ' + reading.humidity);
    }).catch((err) => {
      console.log(err)
    });
  }, 1000);
}).catch((err) => {
  console.log(err);
});

