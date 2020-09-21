import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { MieleHoodPlatform } from './platform';

import request from 'request';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class MieleHoodPlatformAccessory {
  private lightService: Service;
  //private fanService: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private States = {
    LightOn: false,
    FanOn: false,
    FanSpeed: 0,
  }

  constructor(
    private readonly platform: MieleHoodPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Miele')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the Switch service if it exists, otherwise create a new Switch service
    // you can create multiple services for each accessory
    this.lightService = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.lightService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.lightService.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setLightOn.bind(this))                // SET - bind to the `setOn` method below
      .on('get', this.getLightOn.bind(this));               // GET - bind to the `getOn` method below
    /*
    this.fanService = this.accessory.getService(this.platform.Service.Fan) ||
      this.accessory.addService(this.platform.Service.Fan);

    this.fanService.getCharacteristic(this.platform.Characteristic.On)
      .on('get', this.getFanOn.bind(this))
      .on('set', this.setFanOn.bind(this));
*/
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  setLightOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    let httpdata = JSON.stringify({'light':2});

    if (value) {
      httpdata = JSON.stringify({'light':1});
    }

    const config = {
      'method': 'PUT',
      'url': 'https://api.mcs3.miele.com/v1/devices/000152570949/actions',
      'headers': { 
        'Authorization': 'Bearer US_d98a67c6d04715e96f81ad346f39e14d',
        'Content-Type': 'application/json',
      },
      body: httpdata,
    };

    request(config, (err, res, body) => {
      if (err) {
        callback(err);
      }
      // NO PARSING BQ NO BODY!!!
      // implement your own code to turn your device on/off
      this.States.LightOn = value as boolean;
      this.platform.log.debug('Set Light Characteristic On ->', value);
      // you must call the callback function
      callback(null);
    });
  }
  /*
  setFanOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to turn your device on/off
    this.States.FanOn = value as boolean;

    this.platform.log.debug('Set Fan Characteristic On ->', value);

    // you must call the callback function
    callback(null);
  }
*/
  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   * 
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   * 
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */

  getLightOn(callback: CharacteristicGetCallback) {

    const config = {
      'method': 'GET',
      'url': 'https://api.mcs3.miele.com/v1/devices/000152570949/state',
      'headers': { 
        'Authorization': 'Bearer US_d98a67c6d04715e96f81ad346f39e14d',
        'Content-Type': 'application/json',
      },
    };

    request(config, (err, res, body) => {
      if (err) {
        callback(err);
      }
      const response = JSON.parse(body);
      this.platform.log.debug('Light Value -> ', response.light);

      if (response.light == '1') {
        this.States.LightOn = true;
      } else {
        this.States.LightOn = false;
      }

      const isOn = this.States.LightOn;
      this.platform.log.debug('Get Characteristic On ->', isOn);
      // you must call the callback function
      // the first argument should be null if there were no errors
      // the second argument should be the value to return
      callback(null, isOn);
    });
  }
  /*
  getFanOn(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
    const isOn = this.States.FanOn;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, isOn);
  }
*/
  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  /*
  setFanSpeed(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to set the brightness
    this.States.FanSpeed = value as number;

    this.platform.log.debug('Set Characteristic Fan Speed -> ', value);

    // you must call the callback function
    callback(null);
  }
  */

}
