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

//function puts(error, stdout, stderr) { sys.puts(stdout) }

TimerSwitchAccessory.prototype = {
   
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
    
    if (this.updateInterval > 0) {
      this.timer = setInterval(this.updateState.bind(this), this.updateInterval);
    }
    
    return [this.informationService, this.homebridgeService];
  }
};
