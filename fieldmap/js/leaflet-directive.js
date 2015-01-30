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

    controller: function($scope, $element, $window, $rootScope) {
      var map = L.map("map", {trackResize: true});
      var layerGroup = L.layerGroup();
      var geoJsonLayer;
      var newMarker;
      var geoMarker;
      var blueMarker = L.AwesomeMarkers.icon({
        
        markerColor: 'blue'
      });


      map.setView([0,0], 5);
      L.tileLayer('tiles/{z}/{x}/{y}.png', {
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


      $scope.configureFeature = function (feature, layer) {
        /*return {
          pointToLayer: function(feature, latlng) {
            var marker = L.marker(latlng, blueMarker);
            return marker;
          },
          onEachFeature: function(feature, marker) {*/
            if (feature.properties && feature.properties.text) {
              layer.bindPopup(feature.properties.text);
            }
          /*}
        }*/
      }


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
            draggable: true
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
            onEachFeature: $scope.configureFeature
          });

          layerGroup.addLayer(geoJsonLayer).addTo(map);
          map
        }
      }, true);


      var createMap = function () {
        console.log("Leaflet Directive: creating map");
        $scope.map = new L.map('map').setView([$scope.lat, $scope.lon], 5);
        L.tileLayer('tiles/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            maxZoom: 8
        }).addTo($scope.map);
      }


      $scope.updateMapLocation = function () {
        if ($scope.lat != 0 && $scope.lon !=0) {
          console.log("Leaflet Directive: Changing map view lat: " + $scope.lat + " lon: " + $scope.lon);
          map.setView([$scope.lat, $scope.lon], 6);
          $scope.center = {lat: $scope.lat, lon: $scope.lon};
        }
      }

      createMap();
    } // end of controller

  } // end of return
});
