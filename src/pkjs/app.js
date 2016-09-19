// Import the Clay package
var Clay = require('pebble-clay');
var customClay = require('./custom-clay');
// Load our Clay configuration file
var clayConfig = require('./config');
// The current configuration values (with default values)
var configuration = {
  "ServerIP":"http://192.168.1.30",
  "ServerPort":8080
};

console.log(JSON.stringify(clayConfig));
readConfigurationFromLocalStorage();
// Initialize Clay
new Clay(clayConfig, customClay, {userData : configuration});

/**
 * Read the configuration from the Webview local storage.
 */
function readConfigurationFromLocalStorage(){
  console.log("Reading configuration from local storage");
  for (var attrib in configuration)
  {
    delete configuration[attrib];
  }
  for (var i = 0; i < localStorage.length; i++)
  {
    var key = localStorage.key(i);
    console.log("Reading value for " + key);
    var value = localStorage.getItem(key);
    configuration[key] = value;
  }
  for (var key2 in configuration)
  {
    console.log("Config[" + key2 + "]=" + configuration[key2]);
  }
}

/**
 * Detect when the application is ready and send information to the watch app.
 */
Pebble.addEventListener('ready', function(e) {
  console.log("Hello friends");
  Pebble.sendAppMessage({'APP_READY': true});
});

/**
 * Receive a message from the watch.
 * Probably a command to send.
 */
Pebble.addEventListener('appmessage', function(dict) {
  console.log("Sending command to : " + dict.payload['SendCommandTo']);
  if(dict.payload['SendCommandTo'] !== undefined) {
    var itemName = configuration["ItemName[" + dict.payload['SendCommandTo'] + "]"];
    console.log("Sending command to " + itemName);
    sendCommand(itemName, "TOGGLE",dict.payload['SendCommandTo'] );
    //toggleLockitronState(dict.payload['LOCK_UUID'], dict.payload['ACCESS_TOKEN']);
  }
});

/**
 * Save the configuration coming from configuration web view.
 */
Pebble.addEventListener('webviewclosed', function(event) {
  if (event.response)
  {
    console.log("WebView closed");
    while(localStorage.length> 0)
    {
      var key = localStorage.key(0);
      localStorage.removeItem(key);
    }
    for (var attrib in configuration)
    {
      delete configuration[attrib];
    }

    console.log("After clear length =" + localStorage.length);
    var readConfiguration = JSON.parse(decodeURIComponent(event.response));
    console.log("Received configuration : ");
    console.log(JSON.stringify(readConfiguration));
    for(var value in readConfiguration)
    {
      localStorage.setItem(value, readConfiguration[value].value);
      configuration[value] = readConfiguration[value].value;
    }
    //readConfigurationFromLocalStorage();
  }
});

function sendCommand(itemName, action, index) {
  var url = configuration.ServerIP + ":" + configuration.ServerPort + "/rest/items/" + itemName;
  var data = action; // {'state': 'toggle'};
  console.log("Toggling...");
  sendResultToPebble("Command Sent to " + url, index);
  xhrWrapper(url, 'POST', data, function(req) {
    console.log("Request result : " + req.status);
    if(req.status == 200) {
      sendResultToPebble("Done", index);
    } else {
      sendResultToPebble("Failed", index);
    }
  });

}

function sendResultToPebble(value, index) {
  Pebble.sendAppMessage({
    'CommandResult': value,
    'SendCommandTo':index
  });
}

function xhrWrapper(url, type, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function (event) {
    if (event.readyState == 4) {
      callback(event);
    }
  };
  xhr.onload = function () {
    callback(xhr);
  };
  xhr.open(type, url);
  if(data) {
   // xhr.setRequestHeader('Content-Type', 'application/text');
    xhr.send(data);
  } else {
    xhr.send();
  }
}
