# hts221-sensor

HTS221 I2C temperature and humidity sensor module for Node.js on Linux boards
like the Raspberry Pi, BeagleBone or C.H.I.P.

Supports Node.js versions 4, 6, 8 and 10.

## Contents

 * [Features](#features)
 * [Installation](#installation)
 * [Usage](#usage)
   * [Report Temperature and Humidity](#report-temperature-and-humidity)
   * [Report Temperature and Humidity Continuously](#report-temperature-and-humidity-continuously)
 * [API](#api)
 * [Related Packages](#related-packages)

## Features

 * Simple temperature and humidity sensing
 * Promise based asynchronous API

## Installation

```
npm install hts221-sensor
```

## Usage

#### Report Temperature and Humidity

```js
'use strict';

const Hts221 = require('hts221-sensor');

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
```

#### Report Temperature and Humidity Continuously

```js
const Hts221 = require('hts221-sensor');

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
```

## API

### Functions

- [open([options])](#openoptions)

### Class Hts221

- [close()](#close)
- [read()](#read)

#### open([options])
Returns a promise for a Hts221 object.

The following options are supported:
- i2cBusNumber - integer, I2C bus number, optional, default 1
- i2cAddress - integer, Hts221 I2C address, optional, default 0x5f

#### close()
Returns a promise which will resolve when all resources used by the HTS221
object have been freed.

#### read()
Returns a promise for an object containing a
[sensor reading](#sensor-reading).

### Seosor Reading
- celsius - number, temperature in degrees Celsius
- humidity - number, relative humidity in percent

## Related Packages

- [onoff](https://github.com/fivdi/onoff) - GPIO access and interrupt detection
- [i2c-bus](https://github.com/fivdi/i2c-bus) - I2C serial bus access

