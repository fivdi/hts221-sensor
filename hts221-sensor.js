'use strict';

// TODO
// - replace magic numbers with constants

const i2c = require('i2c-bus');

const DEFAULT_I2C_BUS = 1;
const DEFAULT_I2C_ADDRESS = 0x5f;

const WHO_AM_I = 0xbc;

const WHO_AM_I_REG = 0x0f;
const CTRL_REG1 = 0x20;
const HUMIDITY_OUT_L_REG = 0x28;
const CALIB_REG0 = 0x30;

const validateOpenOptions = (options) => {
  if (typeof options !== 'object') {
    return 'Expected options to be of type object.' +
      ' Got type ' + typeof options + '.';
  }

  if (options.i2cBusNumber !== undefined &&
      (!Number.isSafeInteger(options.i2cBusNumber) ||
       options.i2cBusNumber < 0
      )
     ) {
    return 'Expected i2cBusNumber to be a non-negative integer.' +
      ' Got "' + options.i2cBusNumber + '".';
  }

  if (options.i2cAddress !== undefined &&
      (!Number.isSafeInteger(options.i2cAddress) ||
       options.i2cAddress < 0 ||
       options.i2cAddress > 0x7f
      )
     ) {
    return 'Expected i2cAddress to be an integer' +
      ' >= 0 and <= 0x7f. Got "' + options.i2cAddress + '".'
  }

  return null;
};

class Hts221I2c {
  constructor(i2cBus, i2cAddress) {
    this._i2cBus = i2cBus;
    this._i2cAddress = i2cAddress;
    this._calibrationData = null;
  }

  readByte(register) {
    return new Promise((resolve, reject) => {
      this._i2cBus.readByte(this._i2cAddress, register, (err, byte) => {
        if (err) {
          reject(err);
        } else {
          resolve(byte);
        }
      });
    });
  }

  writeByte(register, byte) {
    return new Promise((resolve, reject) => {
      this._i2cBus.writeByte(this._i2cAddress, register, byte, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  readI2cBlock(register, length, buffer) {
    return new Promise((resolve, reject) => {
      this._i2cBus.readI2cBlock(
        this._i2cAddress, register, length, buffer,
        (err, bytesRead, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        }
      );
    });
  }

  static open(i2cBusNumber, i2cAddress) {
    let hts221I2c;

    return new Promise((resolve, reject) => {
      const i2cBus = i2c.open(i2cBusNumber, (err) => {
        if (err) {
          reject(err);
          return;
        }

        hts221I2c = new Hts221I2c(i2cBus, i2cAddress);

        resolve();
      });
    }).then(() => {
      return hts221I2c.whoAmI();
    }).then((whoAmI) => {
      if (whoAmI !== WHO_AM_I) {
        return Promise.reject(new Error(
          'Expected WHO_AM_I register to be 0x' + WHO_AM_I.toString(16) +
          '. Got 0x' + whoAmI.toString(16) + '. HTS221 sensor not found.'
        ));
      }

      return hts221I2c.configure();
    }).then(() => {
      return hts221I2c;
    });
  }

  whoAmI() {
    return this.readByte(WHO_AM_I_REG);
  }

  configure() {
    return this.writeByte(CTRL_REG1, 0x87).then(() => {
      return this.readCalibrationData();
    }).then((calibrationData) => {
      this._calibrationData = calibrationData;
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this._i2cBus.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  readCalibrationData() {
    const calibRegs = Buffer.alloc(16);

    return this.readI2cBlock(
      CALIB_REG0 | 0x80, calibRegs.length, calibRegs
    ).then((calibRegs) => {
      return {
        h0_rH: calibRegs[0] / 2,
        h1_rH: calibRegs[1] / 2,
        t0_degC: (((calibRegs[5] & 0x03) << 8) + calibRegs[2]) / 8,
        t1_degC: (((calibRegs[5] & 0x0c) << 6) + calibRegs[3]) / 8,
        h0_t0_out: calibRegs.readInt16LE(6),
        h1_t0_out: calibRegs.readInt16LE(10),
        t0_out: calibRegs.readInt16LE(12),
        t1_out: calibRegs.readInt16LE(14),
      };
    });
  }

  read() {
    const rawData = Buffer.alloc(4);

    return this.readI2cBlock(
      HUMIDITY_OUT_L_REG | 0x80, rawData.length, rawData
    ).then((rawData) => {
      const interpolate = (x, x1, x2, y1, y2) =>
        y1 + (x - x1) * (y2 - y1) / (x2 - x1);

      const t_out = rawData.readInt16LE(2);
      const celsius = interpolate(t_out,
        this._calibrationData.t0_out, this._calibrationData.t1_out,
        this._calibrationData.t0_degC, this._calibrationData.t1_degC
      );

      const h_out = rawData.readInt16LE(0);
      const humidity = interpolate(h_out,
        this._calibrationData.h0_t0_out, this._calibrationData.h1_t0_out,
        this._calibrationData.h0_rH, this._calibrationData.h1_rH
      );

      return {
        celsius: celsius,
        humidity: humidity
      };
    });
  }
}

class Hts221 {
  constructor(hts221I2c) {
    this._hts221I2c = hts221I2c
  }

  static open(options) {
    return Promise.resolve().then(() => {
      options = options || {};

      const errMsg = validateOpenOptions(options);
      if (errMsg) {
        return Promise.reject(new Error(errMsg));
      }

      const i2cBusNumber = options.i2cBusNumber === undefined ?
        DEFAULT_I2C_BUS : options.i2cBusNumber;
      const i2cAddress = options.i2cAddress === undefined ?
        DEFAULT_I2C_ADDRESS : options.i2cAddress;

      return Hts221I2c.open(i2cBusNumber, i2cAddress);
    }).then((hts221I2c) => {
      return new Hts221(hts221I2c);
    });
  }

  close() {
    return this._hts221I2c.close();
  }

  read() {
    return this._hts221I2c.read();
  }
}

module.exports = Hts221;

