[![Build Status](https://app.travis-ci.com/fivdi/hts221-sensor.svg?branch=master)](https://app.travis-ci.com/github/fivdi/hts221-sensor)
[![npm Version](http://img.shields.io/npm/v/hts221-sensor.svg)](https://www.npmjs.com/package/hts221-sensor)
[![Downloads Per Month](http://img.shields.io/npm/dm/hts221-sensor.svg)](https://www.npmjs.com/package/hts221-sensor)

# hts221-sensor

HTS221 I2C temperature and humidity sensor module for Node.js on Linux boards
like the Raspberry Pi or BeagleBone.

Supports Node.js versions 10, 12, 14, 15 and 16.

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

const hts221 = require('hts221-sensor');

hts221.open().then(sensor =>
  sensor.read().
  then(reading => {
    console.log('celsius: ' + reading.celsius);
    console.log('humidity: ' + reading.humidity);
  }).
  then(_ => sensor.close())
).catch(console.log);
```

#### Report Temperature and Humidity Continuously

```js
const hts221 = require('hts221-sensor');

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

### Sensor Reading
- celsius - number, temperature in degrees Celsius
- humidity - number, relative humidity in percent

## Related Packages

- [onoff](https://github.com/fivdi/onoff) - GPIO access and interrupt detection
- [i2c-bus](https://github.com/fivdi/i2c-bus) - I2C serial bus access

