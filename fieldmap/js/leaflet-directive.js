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

    controller: function($scope, $element, $window, $rootScope, $http, $timeout) {

      var latlngCenterOfGeometry = function(geom) {
        var polygons = null;
        if (geom.type == 'Polygon') {
          polygons = [geom.coordinates];
        }
        else if (geom.type == 'MultiPolygon') {
          polygons = geom.coordinates;
        }
        var bbox = null;
        var polygonsRemaining = polygons.length;
        while (polygonsRemaining--) {
          var polygon = polygons[polygonsRemaining];
          var outerRing = polygon[0];
          var positionsRemaining = outerRing.length
          while (positionsRemaining--) {
            var pos = outerRing[positionsRemaining];
            var latlng = L.latLng(pos[1], pos[0]);
            bbox = bbox ? bbox.extend(latlng) : L.latLngBounds(latlng);
          }
        }
        return bbox.getCenter();
      };

      var map = L.map("map", {trackResize: true});
      var userPoints = L.geoJson($scope.locations, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng,
              {icon: L.AwesomeMarkers.icon(
                {icon:'circle', markerColor: 'cadetblue'}
              )});
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.text) {
            layer.bindPopup(feature.properties.text);
          }
        }
      }).addTo(map);

      var tileLayer;
      var newMarker;
      var geoMarker;
      var mapZoom = { start:map.getZoom(), end:map.getZoom() };
      L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';


      map.setView([0,0], 5);
      tileLayer = L.tileLayer('tiles/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="http://cloudmade.com">CloudMade</a>, Icon Map Created by <a href="http://thenounproject.com/term/map/32153/">Simple Icons</a>',
          maxZoom: 7
      }).addTo(map);


      map.on('popupopen', function(e) {
        $scope.$apply(function () {
          $scope.activeLocation = e.popup._source;
          $scope.deleteButtonVisible = userPoints.hasLayer($scope.activeLocation);
        });
      });


      map.on('popupclose', function(e) {
        if ($scope.deleteButtonVisible) {
          $scope.$apply(function () {
            $scope.deleteButtonVisible = false;
          });
        }
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

      map.on('layeradd', function () {
        if (map.hasLayer(userPoints)) {
          userPoints.bringToFront();
        }
        if (map.hasLayer(geoMarker)) {
          geoMarker.bringToFront();
        }
      });

      map.on('moveend', function () {
        $timeout(function () {
          $scope.center = map.getCenter();
        });
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
          airports.addData(data); //.addTo(map)
        })
        .error(function() {
          console.log('failed to load airport data from ' + airportsUrl);
        });


      var parkBoundaries = L.geoJson(null, {
        "style": {
          "color": "#061",
          "weight": 2
        },
        "onEachFeature": function(feature, layer) {
          layer.bindPopup(feature.properties.UNIT_NAME);
        }
      })
      var parks = L.layerGroup();
      var parkIcon = L.AwesomeMarkers.icon({
        "icon": "leaf", "markerColor": "darkgreen"
      });
      var parksUrl = 'co_parks.geojson';
      $http.get(parksUrl, {"responseType": "json"})
        .success(function(data) {
          parkBoundaries.addData(data);
          var parkMarks = [];
          var remaining = data.features.length;
          while (remaining--) {
            var feature = data.features[remaining];
            var geom = feature.geometry;
            var center = latlngCenterOfGeometry(geom);
            var parkMark = L.marker(center, {"icon": parkIcon})
              .bindPopup(feature.properties.UNIT_NAME);
            parks.addLayer(parkMark);
          }
          //map.addLayer(parks);
          //map.addLayer(parkBoundaries);
        })
        .error(function() {
          console.log('failed to load national parks data from ' + parksUrl);
        });


      var tiles = null;
      var features = {
        "My Points": userPoints,
        "Airports": airports,
        "National Parks": parks,
        "National Park Boundaries": parkBoundaries
      };
      L.control.layers(tiles, features).addTo(map);

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
            draggable: true, icon: L.AwesomeMarkers.icon({icon:'fa-plus',markerColor: 'green'})
          }).on('dragend', function(e) {
            $scope.$apply(function(s) {
              console.log("marker new location: ", newMarker.getLatLng());
              $scope.newLocation.geometry.coordinates = [newMarker.getLatLng().lng, newMarker.getLatLng().lat];
              console.log("drag end: ", $scope.newLocation);
            });
          });
          map.addLayer(newMarker);
        } else if (map.hasLayer(newMarker)) {
          map.removeLayer(newMarker);
        }
      });


      $scope.$watch("locations", function() {
        console.log("Leaflet Directive: locations changed ", $scope.locations);
        if ($scope.locations) {
          if (map.hasLayer(newMarker)) {
            map.removeLayer(newMarker);
          }

          userPoints.clearLayers();
          userPoints.addData($scope.locations);
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
            fillOpacity: 0.5,
          }).addTo(map);
        }
      }
    } // end of controller
  } // end of return
});
