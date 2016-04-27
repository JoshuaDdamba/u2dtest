var access_token = "16384709.6ac06b4.49b97800d7fd4ac799a2c889f50f2587",
    access_parameters = {
        access_token: access_token
    };

var appSelector = 'mycph';
var app = document.getElementById(appSelector);
var ajax = {};

// CREATE A FORM
var form = document.createElement('form');
form.name = 'tagsearch';
form.autocomplete ='off';
form.addEventListener('submit', handleFormSubmission);
form.style.margin = "20px 10px";

var left = document.createElement('div');
left.style.position = "absolute";
left.style.width = "400px";
left.style.top = "0";
left.style.bottom = "0";

var content = document.createElement('div');

// CREATE THE SEARCH FIELD
var search = document.createElement('input');
search.type = 'text';
search.className = 'tag';
search.name = 'tag';
search.id = 'tag';

// CREATE THE SUBMIT BUTTON
var submit = document.createElement('input');
submit.type = 'submit';
submit.value = 'fetch tags';

// ADD AN EVENT LISTENER ON SUBMIT SO THAT WE CAN DO SOMETHING WHEN CLICKED;

// ADD ABOVE ELEMENTS INTO THE HEADING
form.appendChild(search);
form.appendChild(submit);

// ADD THE FORM AND THE CONTENT INTO THE APP ELEMENT
left.appendChild(form);
app.appendChild(left);
app.appendChild(content);

var listContainer = document.createElement('div');
listContainer.style.position = "absolute";
listContainer.style.left     = "0";
listContainer.style.top      = "40px";
listContainer.style.bottom   = "0";
listContainer.style.overflow = "auto";

var featureList = document.createElement('div');
featureList.style.position = "absolute";
featureList.style.left     = "0";
featureList.style.top      = "40px";
featureList.style.bottom   = "0";
featureList.style.overflow = "auto";

var mapContainer = document.createElement('div');
mapContainer.style.position = "absolute";
mapContainer.style.right    = "0";
mapContainer.style.left     = "400px";
mapContainer.style.top      = "0px";
mapContainer.style.bottom   = "0px";

app.appendChild(listContainer);
app.appendChild(featureList);
app.appendChild(mapContainer);
var map = L.map(mapContainer).setView([55.707,12.529], 15);
console.log(L);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={access_token}', {
    id: 'ddamba.ofm04n7i',
    access_token: 'pk.eyJ1IjoiZGRhbWJhIiwiYSI6Ik9vX1VPdmcifQ.nEbSOXJ-DWVGhiEY771xvg',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var featureMap = {};
function mapRegions(data) {
  console.log("list of features");
  var geojsonLayer = L.geoJson(data, {
    onEachFeature: function (feature, layer) {
      var featureContainer = document.createElement('div');

      var label = document.createElement('label');

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = false;
      checkbox.id = 'checkbox.'+feature.id;
      checkbox.name = feature.id;


      label.htmlFor = 'checkbox.'+feature.id;
      label.innerHTML = "<span>" + feature.properties.navn + "</span><span>"+ feature.properties.status + "<span>";


      checkbox.onchange = function () {
        var featureName = this.id.substring(9);
        if(this.checked) {
          geojsonLayer.addLayer(featureMap[featureName]);
        } else {
          geojsonLayer.removeLayer(featureMap[featureName]);
        }

      };

      featureContainer.appendChild(checkbox);
      featureContainer.appendChild(label);
      //featureContainer.appendChild(document.createTextNode(feature.properties.navn));
      //featureContainer.id = feature.id;
      /*featureContainer.addEventListener('click', function (e) {
        var layer = featureMap[this.id];
        geojsonLayer.removeLayer(layer);
      });*/
      featureMap[feature.id] = layer;
      featureList.appendChild(featureContainer);
      layer.bindPopup(feature.properties.description);
    }
  })

//  console.log("My MAP:", featureMap);
  for(featureId in featureMap) {
    console.log("FeatureID:", featureId);
    geojsonLayer.removeLayer(featureMap[featureId]);

  }
  geojsonLayer.addTo(map);
}

function getRegions() {
  var xhttp = new XMLHttpRequest();
  var url = "/regions.geojson";
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      mapRegions(JSON.parse(xhttp.responseText));
      //drawRegions(JSON.parse(xhttp.responseText));

    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}
console.log("i should not appear twice");
getRegions();

// ABOVE THIS LINE, THE LOGIC:

// JSONP. See: http://stackoverflow.com/a/22780569/971008
function jsonp(url, callback) {
  var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
  window[callbackName] = function(data) {
    delete window[callbackName];
    document.body.removeChild(script);
    callback(data);
  };

  var script = document.createElement('script');
  script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
  document.body.appendChild(script);
}

function addToMap(media) {

  var icon = L.icon({
    iconUrl: media.images.thumbnail.url,
    iconSize: [70, 70]
  });

  console.log(media.images);

  L.marker([media.location.latitude, media.location.longitude], {icon:icon}).addTo(map)
    .bindPopup('<img width="300px" src="'+media.images.standard_resolution.url+'"/>')
}

function addToList(media) {

  var img = document.createElement('img');
  img.src = media.images.thumbnail.url;

  var link = document.createElement('a');
  link.appendChild(document.createTextNode(media.link));
  link.href = media.link;

  listContainer.appendChild(img);
  listContainer.appendChild(link);
  listContainer.appendChild(document.createElement('br'));
}

function fetchGrams (tag, count, access_parameters) {

  var url = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?callback=?&count=10&access_token=16384709.6ac06b4.49b97800d7fd4ac799a2c889f50f2587';
  jsonp(url, function(response) {

    if(response.data.length) {
      content.innerHTML = "";
      for(var i in response.data) {
        if(response.data[i].location !== null) {
          addToMap(response.data[i]);
        } else {
          addToList(response.data[i]);
        }
      }
    } else {
      content.appendChild(document.createTextNode("no content was found"));
    }
  });
}

function handleFormSubmission(e) {

  var tag = this.tag.value;
  if (e.preventDefault) e.preventDefault();
  console.log("value:" , tag);

  if(tag.length) {
    fetchGrams(tag, 40, access_parameters);
  }

  return false;
}
