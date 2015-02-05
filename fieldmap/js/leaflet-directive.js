fieldMap.directive('leaflet', function () {
  return {
    restrict: "A",
    scope: {
      lat: '=',
      lon: '=',
      center: '=',
      newLocation: '=',
      locations: '=',
      showControls: '=',
      deleteButtonVisible: '=',
      activeLocation: '='
    },

    controller: function($scope, $element, $window, $rootScope, $http) {
      var map = L.map("map", {trackResize: true});
      var layerGroup = L.layerGroup();
      var tileLayer;
      var geoJsonLayer;
      var newMarker;
      var geoMarker;
      var mapZoom = { start:map.getZoom(), end:map.getZoom() };
      L.AwesomeMarkers.Icon.prototype.options.prefix = 'glyphicon';


      map.setView([0,0], 5);
      tileLayer = L.tileLayer('tiles/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
          maxZoom: 8
      }).addTo(map);


      map.on('popupopen', function(e) {
        $scope.$apply(function () {
          $scope.activeLocation = e.popup._source;
          $scope.deleteButtonVisible = true;
        });
      });


      map.on('popupclose', function(e) {
        $scope.$apply(function () {
          $scope.deleteButtonVisible = false;
        });
      });


      map.on('zoomstart', function (e) {
        mapZoom.start = map.getZoom();
      });


      map.on('zoomend', function(e) {
        mapZoom.end = map.getZoom();
        var diff = mapZoom.start - mapZoom.end;

        if (geoMarker) {
          if (diff > 0) {
            geoMarker.setRadius(geoMarker.getRadius() * 2);
          } else if (diff < 0) {
            geoMarker.setRadius(geoMarker.getRadius() / 2);
          }
        }
      });


      var airportIcon = L.AwesomeMarkers.icon({
        "icon": "plane", "markerColor": "blue"
      });
      var airports = L.geoJson(null, {
        "pointToLayer": function(feature, latlng) {
          return L.marker(latlng, {"icon": airportIcon});
        },
        "onEachFeature": function(feature, layer) {
          layer.bindPopup(feature.properties.name + " (" + feature.id + ")");
        }
      });
      var airportsUrl = 'co_airports.geojson';
      $http.get(airportsUrl, {"responseType": "json"})
        .success(function(data) {
          airports.addData(data);
        })
        .error(function() {
          alert('Failed to load airport data from ' + airportsUrl);
        });

      var parkIcon = L.AwesomeMarkers.icon({
        "icon": "leaf", "markerColor": "darkgreen"
      });
      var parks = L.geoJson(null, {
        "pointToLayer": function(feature, latlng) {
          return L.marker(latlng, {"icon": parkIcon});
        },
        "onEachFeature": function(feature, layer) {
          layer.bindPopup(feature.properties.UNIT_NAME);
        },
        "style": {
          "color": "#061",
          "weight": 2
        }
      });
      var parksUrl = 'co_parks.geojson';
      $http.get(parksUrl, {"responseType": "json"})
        .success(function(data) {
          parks.addData(data);
        })
        .error(function() {
          alert('Failed to load parks data from ' + parksUrl);
        });

      var features = {
        "User Points": layerGroup,
        "Airports": airports,
        "National Parks": parks
      };
      L.control.layers(null, features).addTo(map);


      $scope.configureFeature = function (feature, layer) {
        if (feature.properties && feature.properties.text) {
          layer.bindPopup(feature.properties.text);
        }
      };


      $scope.$watch("lat", function () {
        console.log("Leaflet Directive: Lat changed " + $scope.lat);
        $scope.updateMapLocation();
      });


      $scope.$watch("lon", function() {
        console.log("Leaflet Directive: Lon changed " + $scope.lon);
        $scope.updateMapLocation();
      });


      $scope.$watch("newLocation", function() {
        console.log("Leaflet Directive: newLocation changed: ", $scope.newLocation);
        if ($scope.newLocation.geometry) {
          $scope.showControls = true;
          console.log("Leaflet Directive: newLocation changed with lat:" + $scope.newLocation.geometry.coordinates[0] + " lon: " + $scope.newLocation.geometry.coordinates[1]);
          newMarker = L.marker([$scope.newLocation.geometry.coordinates[1], $scope.newLocation.geometry.coordinates[0]], {
            draggable: true, icon: L.AwesomeMarkers.icon({icon:'glyphicon-plus',markerColor: 'green'})
          }).on('dragend', function(e) {
            $scope.$apply(function(s) {
              console.log("marker new location: ", newMarker.getLatLng());
              $scope.newLocation.geometry.coordinates = [newMarker.getLatLng().lng, newMarker.getLatLng().lat];
              console.log("drag end: ", $scope.newLocation);
            });
          });
          map.addLayer(newMarker);
        }
      });


      $scope.$watch("locations", function() {
        console.log("Leaflet Directive: locations changed ", $scope.locations);
        if ($scope.locations) {
          layerGroup.clearLayers();
          if (map.hasLayer(newMarker)) {
            map.removeLayer(newMarker);
          }

          geoJsonLayer = L.geoJson($scope.locations, {
            pointToLayer: function(feature, latlng) {
              return L.marker(latlng,
                  {icon: L.AwesomeMarkers.icon(
                    {icon:'info-sign', markerColor: 'cadetblue'}
                  )});
            },
            onEachFeature: $scope.configureFeature
          });

          layerGroup.addLayer(geoJsonLayer).addTo(map);
          map
        }
      }, true);


      $scope.updateMapLocation = function () {
        if ($scope.lat != 0 && $scope.lon !=0) {
          console.log("Leaflet Directive: Changing map view lat: " + $scope.lat + " lon: " + $scope.lon);
          map.setView([$scope.lat, $scope.lon], 6);
          $scope.center = {lat: $scope.lat, lon: $scope.lon};

          if (map.hasLayer(geoMarker)) {
            map.removeLayer(geoMarker);
          }

          geoMarker = L.circle([$scope.lat, $scope.lon], 10000,  {
            color: 'blue',
            fillColor: '#22f',
            fillOpacity: 0.5
          }).addTo(map);
        }
      }
    } // end of controller
  } // end of return
});
