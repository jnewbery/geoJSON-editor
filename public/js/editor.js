var allOverlays = new Array();
var map = null;

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(30, 1),
    zoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYLINE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYLINE
      ]
    },
    polylineOptions: {
      editable: true,
      zIndex: 1
    }
  });
  
  drawingManager.setMap(map);
  
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
    addMapOverlay(event.overlay);
  });
}

function addMapOverlay(overlay) {
  allOverlays.push(overlay);
  overlay.setMap(map);
  
  google.maps.event.addListener(overlay.getPath(), 'insert_at', function() {
    dumpGeoJSON(allOverlays);
  });

  google.maps.event.addListener(overlay.getPath(), 'remove_at', function() {
    dumpGeoJSON(allOverlays);
  });

  google.maps.event.addListener(overlay.getPath(), 'set_at', function() {
    dumpGeoJSON(allOverlays);
  });

  dumpGeoJSON(allOverlays);
}
      
function dumpGeoJSON(overlays) {
  var coordinates = new Array();
  
  for (var i = 0; i < overlays.length; i++) {
    var polyline = new Array();
    var vertices = overlays[i].getPath();
    for (var j = 0; j < vertices.length; j++) {
      var xy = vertices.getAt(j);
      var lngLat = new Array(xy.lng(), xy.lat());
      polyline.push(lngLat);
    }

    coordinates.push(new Array(polyline));
  }

  var output = document.getElementById('geoJSON');
  var geoJSON = { 'type': 'MultiPolygon', 'coordinates' : coordinates };
  output.value = JSON.stringify(geoJSON, null, '\t');
}

function loadGeoJSON() {
  var textarea = document.getElementById('geoJSON');
  var geoJSON;

  try {
    geoJSON = JSON.parse(textarea.value);
  } 
  catch(e) {
    alert('json parse failed: \n' + e);
    return;
  }

  if (geoJSON.type != 'MultiPolygon') {
    alert('Your json does not appear to be a MultiPolygon type!');
    return;
  }
  
  if (!geoJSON.coordinates) {
    alert('Your json appear to lack a coordinates attribute!');
    return;
  }
  
  // Remove all existing overlays
  for (i in allOverlays) {
    allOverlays[i].setMap(null);
  }
  allOverlays.length = 0;
    
  for (i in geoJSON.coordinates) {
    var polyCoords = new Array();
    for (j in geoJSON.coordinates[i][0]) {
      var coords = geoJSON.coordinates[i][0][j];
      polyCoords.push(new google.maps.LatLng(coords[1], coords[0])); 
    }

    var overlay = new google.maps.Polygon({ paths: polyCoords, editable: true });
    addMapOverlay(overlay);
    }
  }

google.maps.event.addDomListener(window, 'load', initialize);