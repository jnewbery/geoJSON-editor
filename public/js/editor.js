var allOverlays = new Array(),
    kvp = document.location.search.substr(1).split('&');
    map = null;

function initialize() {
  var mapOptions = {mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: new google.maps.LatLng(30, 1),
                    zoom: 2},
      center,
      zoom;

  center = getURLParam('ll');
  if (center != 'null') {
    mapOptions["center"] = new google.maps.LatLng(Number(center.split(',')[0]),Number(center.split(',')[1]));
  };
  zoom = getURLParam('z');
  if (zoom != 'null') {
    mapOptions["zoom"] = Number(zoom);
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  var drawingManager = new google.maps.drawing.DrawingManager({
    //drawingMode: google.maps.drawing.OverlayType.POLYLINE,
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

  google.maps.event.addListener(map, 'center_changed', function() {
    var c = map.center.pb + ',' + map.center.qb;
    setURLParam("ll",c);

  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
    setURLParam("z",map.getZoom());
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
  var output,
      geJSON,
      coordinates = new Array();
  
  for (var i = 0; i < overlays.length; i++) {
    var polyline = new Array();
    var vertices = overlays[i].getPath();
    for (var j = 0; j < vertices.length; j++) {
      var xy = vertices.getAt(j);
      var lngLat = new Array(xy.lng(), xy.lat());
      polyline.push(lngLat);
    }

  coordinates.push(polyline);
  }

  output = document.getElementById('geoJSON');
  geoJSON = { 'type': 'MultiLineString', 'coordinates' : coordinates };
  output.value = JSON.stringify(geoJSON, null, '\t');
}

function loadGeoJSON() {
  var geoJSON,
      overlay,
      textarea = document.getElementById('geoJSON');

  try {
    geoJSON = JSON.parse(textarea.value);
  } 
  catch(e) {
    alert('json parse failed: \n' + e);
    return;
  }

  if (geoJSON.type != 'MultiLineString') {
    alert('Your json does not appear to be a MultiLineString type!');
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
    var lineCoords = new Array();
    for (j in geoJSON.coordinates[i]) {
      var coords = geoJSON.coordinates[i][j];
      lineCoords.push(new google.maps.LatLng(coords[1], coords[0])); 
    }

    overlay = new google.maps.Polyline({ path: lineCoords, editable: true });
    addMapOverlay(overlay);
  }
}

function clearGeoJSON() {
  // Remove all existing overlays
  for (i in allOverlays) {
    allOverlays[i].setMap(null);
  }
  allOverlays.length = 0;

  document.getElementById('geoJSON').value ='';
}

function setURLParam(key, value)
{
  var i, x;
  key = encodeURI(key);
  value = encodeURI(value);
  if ((kvp.length == 1) && (kvp[0] == "")) {
    kvp[0] = [key,value].join('=');
  }
  else {
    for (i = 0; i < kvp.length; i++) {
      x = kvp[i].split('=');
      if (x[0]==key) {
        x[1] = value;
        kvp[i] = x.join('=');
        break;
      }
    }

    if (i == kvp.length) {
      kvp[kvp.length] = [key,value].join('=');
    }
  }
}

function getURLParam(key) {
    return decodeURI(
        (RegExp(key + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function copyLink()
{
  prompt("Copy the link below", document.location.origin + "/index.html?" + kvp.join('&'));
}

google.maps.event.addDomListener(window, 'load', initialize);