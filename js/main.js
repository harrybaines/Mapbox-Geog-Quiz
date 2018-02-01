// Add in countries from the geojson file instead of string
var countriesArray = [];
var JSONcountriesObj;
var randCountry;
var answer;
var correct = skipped = prevInd = 0;
var opts = [];

var divOpts = [];
var id = 0;
var map;

var numOptions = 4;

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getRandCountry(fly, shouldRemove) {
    var ind = prevInd;
    var length = countriesArray.length;
    if (length == 0) {
      console.log("No more countries left!");
    }
    else {
      while (ind == prevInd) {
          ind = Math.floor(Math.random() * length);
      }
      randCountry = countriesArray[ind];
      if (fly) {
        flyToCountry(randCountry);
      }
      prevInd = ind;
      if (shouldRemove) {
        countriesArray.splice(ind, 1);
      }
      return randCountry;
    }
}

function checkAnswer(chosen) {
    var wasCorrect = false;
    if (chosen == answer) {
        correct++;
        wasCorrect = true;
        map.setPaintProperty(id.toString(), 'fill-color', "#009933");
    }
    else {
        map.setPaintProperty(id.toString(), 'fill-color', "#ff4d4d");
    }
    return wasCorrect;
}

function skipCountry() {
    skipped++;
    getRandCountry(true, true);
}



function flyToCountry(country) {

    var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + country + ".json?access_token=pk.eyJ1IjoiaGFycnliMDkwNSIsImEiOiJjamNxNHB3aHgyenk4MzNybmVuZmxybWF4In0._nwmtVzlz0bozCPpvjelRQ&country=&types=country";
    $.getJSON(url, function(data) {
        console.log("Trying to find: " + country)
        var coords = data.features[0].geometry.coordinates;
        map.flyTo({
            center: coords
        });
        <!--new mapboxgl.Marker(el).setLngLat(coords).addTo(map);-->

        var results = []
        var polygonType;

        for (var i=0 ; i < JSONcountriesObj.features.length ; i++) {
            if (JSONcountriesObj.features[i].properties.name == country) {
                polygonType = JSONcountriesObj.features[i].geometry.type;
                results.push(JSONcountriesObj.features[i].geometry.coordinates[0]);
            }
        }
        id += 1;

        map.addLayer({
            'id': id.toString(),
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': polygonType, // Add support for multi-polygons
                        'coordinates': results
                    }
                }
            },
            'layout': {},
            'paint': {
                'fill-color': '#E4CC37',
                'fill-opacity': 0.8
            }
        });
    });

    return country;

}

function finishGame() {
    console.log("You got " + correct + " correct and skipped " + skipped + " times");
    document.getElementById("start-btn").style.visibility = "visible";
}

// test
function generateOpts() {
  opts = []
  answer = getRandCountry(true, true);
  opts.push(randCountry);
  for (var i = 0; i < numOptions-1; i++) {
    opts.push(getRandCountry(false, false));
  }

  opts = shuffleArray(opts);
  for (var i = 0; i < numOptions; i++) {
    divOpts[i].innerHTML = opts[i];
  }

  return opts;
}

function startGame() {
    generateOpts();
}
window.onload = function() {
  mapboxgl.accessToken = 'pk.eyJ1IjoiaGFycnliMDkwNSIsImEiOiJjamNxazhjbTUyZWVtMzNvOXlhY3BkaG55In0.ZR3_5V8eOEdyEL5tEJSucA';
  var el = document.createElement('div');
  el.className = 'marker';
  el.style.backgroundImage = 'url(marker.png)';
  el.style.width = 30 + 'px';
  el.style.height = 30 + 'px';

  map = new mapboxgl.Map({
     container: 'map',
     style: 'mapbox://styles/harryb0905/cjcs2esfh6ola2rnpaavxp4ld',
     zoom: 3
  });

  var startBtn = document.getElementById("start-btn");

  var optContainer = document.getElementById("optionContainer");

  for (var i = 0; i < numOptions; i++) {
    var div = document.createElement("div");
    div.className = "optionButton";
    optContainer.appendChild(div);
    divOpts.push(div);
  }
  $('div.optionButton').click(function() {
    var chosen = $(this).text();
    if (checkAnswer(chosen) == true) {
      $('#input-container').notify(
        "Correct!", {
          position: 'top',
          style: 'notifystyle',
          className: 'customgreen'
        }
      );
    }
    else {
      $('#input-container').notify(
        "Incorrect, the answer was: " + answer, {
          position: 'top',
          style: 'notifystyle',
          className: 'customred'
        }
      );
    }
    generateOpts();
  });


  $.getJSON("countries/countries.geo.json", function(data) {

      JSONcountriesObj = data;
      for (var key in data.features) {
          countriesArray.push(data.features[key].properties.name);
      }

  });

  console.log(countriesArray);

  var id = 0;

  map.on('load', function() {

      map.addSource("countries", {
          "type": "geojson",
          "data": "countries/countries.geo.json"
      });

      $.getJSON("countries/countries.geo.json", function(data) {

          console.log(data);
      });

      <!--map.addLayer({-->
          <!--"id": "state-fills",-->
          <!--"type": "fill",-->
          <!--"source": "countries",-->
          <!--"layout": {},-->
          <!--"paint": {-->
              <!--"fill-color": "#627BC1",-->
              <!--"fill-opacity": 0.5-->
          <!--}-->
      <!--});-->

      <!--map.addLayer({-->
          <!--"id": "state-borders",-->
          <!--"type": "line",-->
          <!--"source": "countries",-->
          <!--"layout": {},-->
          <!--"paint": {-->
              <!--"line-color": "#627BC1",-->
              <!--"line-width": 2-->
          <!--}-->
      <!--});-->

      <!--map.addLayer({-->
          <!--"id": "state-fills-hover",-->
          <!--"type": "fill",-->
          <!--"source": "countries",-->
          <!--"layout": {},-->
          <!--"paint": {-->
              <!--"fill-color": "#627BC1",-->
              <!--"fill-opacity": 1-->
          <!--},-->
          <!--"filter": ["==", "name", ""]-->
      <!--});-->

      <!--// When the user moves their mouse over the states-fill layer, we'll update the filter in-->
      <!--// the state-fills-hover layer to only show the matching state, thus making a hover effect.-->
      <!--map.on("mousemove", "state-fills", function(e) {-->
          <!--map.setFilter("state-fills-hover", ["==", "name", e.features[0].properties.name]);-->
      <!--});-->

      <!--// Reset the state-fills-hover layer's filter when the mouse leaves the layer.-->
      <!--map.on("mouseleave", "state-fills", function() {-->
          <!--map.setFilter("state-fills-hover", ["==", "name", ""]);-->
      <!--});-->

  });

  $.notify.addStyle('notifystyle', {
    html: "<div><span data-notify-text/></div>",
    classes: {
      base: {
        "white-space": "nowrap",
        "padding": "5px",
        "font-family": "Verdana",
        "color": "white"
      },
      customgreen: {
        "background-color": "#009933"
      },
      customred: {
        "background-color": "#ff4d4d"
      }
    }
  });
}
