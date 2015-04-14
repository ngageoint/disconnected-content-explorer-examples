'use strict';

var parismetromap = angular.module("parismetromap", []);

parismetromap.controller('AppCtrl', function AppCtrl($rootScope, $scope, $http) {
  var generateUuid = function() {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  };

  $scope.locations = [];
  $scope.newLocation = {};
  $scope.showControls = false;
  $scope.lat = 48.853888;
  $scope.lon = 2.345581;
  $scope.deleteButtonVisible = false;
  $scope.layerManagerVisible = false;
  $scope.didGeolocate = false;
  $scope.showInfo = false;
  $scope.activeLocation = {};
  $scope.statusText = "";


  // load the points from local storage
  var loadPoints = function() {
    if (localStorageSupported() && localStorage["dice.parismetromap.locations"]) {
      $scope.locations = JSON.parse(localStorage["dice.parismetromap.locations"]);
      if (!$scope.locations) {
        $scope.locations = {
          "type": "FeatureCollection",
          "features": []
        };
      }
      else {
        // clean up bad data
        var count = $scope.locations.features.length;
        while (count--) {
          var feature = $scope.locations.features[count];
          if (!feature.geometry) {
            $scope.locations.features.splice(count, 1);
          }
          else {
            if (!feature.properties) {
              feature.properties = {};
            }
            if (!feature.properties.id) {
              feature.properties.id = generateUuid();
            }
            if (!feature.properties.text) {
              feature.properties.text = 'Point of interest';
            }
          }
        }
        storeUserPoints();
      }
      console.log("Controller: loaded points: ", $scope.locations);
    } else {
      $scope.locations = { "type": "FeatureCollection",
        "features": []};
    }
  };


  var storeUserPoints = function() {
    localStorage.setItem("dice.parismetromap.locations", JSON.stringify($scope.locations));
  };


  // handle writing the point to local storage
  $scope.saveLocation = function() {
    console.log("Controller: saving location: ", $scope.newLocation);

    if (!localStorageSupported()) {
      return false;
    }

    if (!$scope.newLocation.properties.text) {
      $scope.newLocation.properties.text = 'Point of interest';
    }
    $scope.locations.features.push($scope.newLocation);

    storeUserPoints();

    $scope.showControls = false;
    $scope.newLocation = {};

    return true;
  };


  $scope.cancel = function() {
    $scope.showControls = false;
    $scope.newLocation = {};
  };


  $scope.createNewLocation = function() {
    console.log("Controller: creating new newLocation");
    $scope.newLocation = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [$scope.center.lng, $scope.center.lat]
      },
      "properties": {
        "id": generateUuid(),
        "text": ""
      }
    };
  };


  // removes a point from $scope.locations and saves the resulting array to local storage
  $scope.deleteLocation = function() {
    var index = -1;

    for (var i = 0; i < $scope.locations.features.length; i++) {
      var test = $scope.locations.features[i].properties.id || $scope.locations.features[i].properties.text;
      if (test == $scope.activeLocation.feature.properties.id || test == $scope.activeLocation.feature.properties.text) {
        index = i;
      }
    }

    if (index > -1) {
      $scope.locations.features.splice(index, 1);
    }

    localStorage.setItem("dice.parismetromap.locations", JSON.stringify($scope.locations));
    $scope.deleteButtonVisible = false;
  };


  // Check to see if you can use HTML local storage
  var localStorageSupported = function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  };


  // Geolocation stuff
  $scope.getLocation = function() {
    console.log("Controller: in getLocaion");
    connectWebViewJavascriptBridge(function(bridge) {
      bridge.callHandler('getLocation', {}, function(response) {
        if (typeof response == "string") {
          console.log("converting string to json object");
          response = JSON.parse(response);
        }
        console.log("Received callback from geolocation: " + response);
        console.log("Type of response: " + typeof response);
        if (response && String(response.success).toLowerCase() == 'true') {
          setCoordinates(response);
          $scope.didGeolocate = true;
        } else { // no GPS? center on France
          console.log("No navigator, setting coordinates to defaults... " + response.message);
          $scope.lat = 48.853888;
          $scope.lon = 2.345581;
        }
      })
    })
  };


  var setCoordinates = function(position) {
    console.log("Controller: Attempting to set coortinates lat: " + position.lat + " lon: " + position.lon);
    console.log("set coordinates: ", $scope);
    $scope.$apply(function () {
      $scope.lat = position.lat;
      $scope.lon = position.lon;
    });
  };


  // Javascript Bridge
  $scope.exportPoints = function() {
    console.log("fixin' to export");
    $scope.statusText = "Exporting GeoJSON";
    connectWebViewJavascriptBridge(function(bridge) {
      bridge.callHandler('saveToFile', $scope.locations, function(response) {
        console.log("Received callback from data export: " + response);
        if (typeof response == "string") {
          console.log("converting string to json object");
          response = JSON.parse(response);
        }
        $scope.statusText = response.message;
        $scope.$apply();
      })
    })
  };


  var connectWebViewJavascriptBridge = function(callback) {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge);
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', function() {
        callback(WebViewJavascriptBridge);
      }, false)
    }
  };


  var initBridge = function() {
    connectWebViewJavascriptBridge(function(bridge) {
      bridge.init(function(message, responseCallback) {
        console.log('JS got a message', message)
      })
    })
  };


  $scope.dismissNotification = function() {
    $scope.statusText = "";
  };


  $scope.toggleInfo = function() {
    $scope.showInfo = !$scope.showInfo;
  };

  loadPoints();
  initBridge();
});
