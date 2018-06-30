var Service, Characteristic;

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
 
  // For platform plugin to be considered as dynamic platform plugin,
  // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
  homebridge.registerAccessory("homebridge-timer-switch", "TimerSwitch", TimerSwitchAccessory);
}

function TimerSwitchAccessory(log, config) {
  this.log = log;

  this.name = config["name"];
  this.updateInterval = config["update_interval"];
  this.on = config["init_state"];
}

function getLuxCallback(luxVal) {
  console.log(luxVal);
}

//function puts(error, stdout, stderr) { sys.puts(stdout) }

TimerSwitchAccessory.prototype = {
  
  jsonRequest: function(url, callback) {
      request({
          url: url,
          json: true
      }, function (error, response, body) {
          callback(error, response, body)
      })    
  },

  getLux: function (callback) {
    var url = "http://192.168.0.94:8080/sensors.json?sense=light"
    console.log ("getting CurrentLux");
    
    this.jsonRequest(url, function(error, response, body) {
        if (error) {
            console.log ('HTTP function failed: %s', error);
            callback(error);
        } else {
            console.log ('HTTP function succeeded - %s', body.light.data[body.light.data.length - 1][1][0]);
            callback(null, body.light.data[body.light.data.length - 1][1][0]);
        }
    })
  },
  
  updateState: function () { 
    
    if (this.on == true) {
        this.on = false;
    } else {
        this.on = true;
    }

    this.homebridgeService.setCharacteristic(Characteristic.On, this.on);
  },

  getServices: function() {

    // you can OPTIONALLY create an information service if you wish to override
    // the default values for things like serial number, model, etc.
    this.informationService = new Service.AccessoryInformation();

    this.informationService
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, "Homebridge")
      .setCharacteristic(Characteristic.Model, "Timer Switch")
      .setCharacteristic(Characteristic.SerialNumber, "WZ-18");
    
    this.homebridgeService = new Service.Switch(this.name);
    this.homebridgeService.getCharacteristic(Characteristic.On)
    this.homebridgeService.getCharacteristic(Characteristic.StatusActive).setValue(true);
    
    //this.lightService.getCharacteristic(Characteristic.CurrentAmbientLightLevel)        .on('get', this.getLux.bind(this));
    
    if (this.updateInterval > 0) {
      this.timer = setInterval(this.updateState.bind(this), this.updateInterval);
    }
    
    return [this.informationService, this.homebridgeService];
  }
};
