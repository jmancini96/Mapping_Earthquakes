// create three tile layers based on Leatlet by mapbox styles API 
let street = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: API_Key});

let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    accessToken: API_Key});

let light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    accessToken: API_Key});

// map layer with center, zoom, and default style 
let map = L.map("mapid", {
    center:[39.5,-98.5],
    zoom: 3,
    layers:[street] 
});

// base layer that holds all 3 maps
let baseMaps = {
    "Streets": street,
    "Satellite": satelliteStreets,
    "Light": light
};

// overlays layer groups 
let plates = new L.layerGroup();
let allEarthquakes = new L.layerGroup();
let majorEarthquakes = new L.layerGroup();

// define an object of overlays
let overlays ={
    "Tectonic Plates": plates,
    "Earthquakes": allEarthquakes,
    "Major Earthquakes": majorEarthquakes
};

// add layer groups on map instantiation
plates.addTo(map);
allEarthquakes.addTo(map);
majorEarthquakes.addTo(map);

// layers control
L.control.layers(baseMaps, overlays).addTo(map);

// grabbing, parsing and adding earthquake GeoJSON data(FeatureCollection) on overlays as a geoJSON layer
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then((data) =>{
    L.geoJSON(data,{
        //set the style for each circleMarker, pass the magnitude into two separate functions to calculate the color and radius.
        style: function (feature) {
            return {
                opacity: 1,
                fillOpacity: 1,
                color: "#000000",
                stroke: true,
                weight: 0.5,
                fillColor: getColor(feature.properties.mag), 
                radius: getRadius(feature.properties.mag)
            }
        },
        //turn each feature into a circleMarker on the map using pointToLayer
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng)
                    .bindPopup("<h2> Earthquake Magnitude: " +feature.properties.mag+
                                "</h2><hr><h3> Location: "+ feature.properties.place +"</h3>")
        }
    }).addTo(allEarthquakes);  
});

// This function determines the fillcolor of circleMarkers based on magtitude
function getColor(magnitude) {
    if (magnitude > 5) {
        return "#ea2c2c";
      }
      if (magnitude > 4) {
        return "#ea822c";
      }
      if (magnitude > 3) {
        return "#ee9c00";
      }
      if (magnitude > 2) {
        return "#eecc00";
      }
      if (magnitude > 1) {
        return "#d4ee00";
      }
      return "#98ee00";
};

// This function determines the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
function getRadius(magnitude) {
    if (magnitude === 0) {return 1}
    return magnitude *4;
};

// create a legend control object
let legend = L.control({
    position: "bottomright"
});

// add details on legend layer
legend.onAdd = function () {
    
    // create a new HTML tag
    let div = L.DomUtil.create("div", "info legend");  // first tag, second are classes
    
    // create two arrays ready to legend 
    const magnitudes = [0,1,2,3,4,5];
    const colorBox = [];
    
    // Loop through intervals of magnitudes to generate a label with a colored square for each interval.
    for (var i=0; i<magnitudes.length; i++) {
        // write content into html
        div.innerHTML += "<i style='background: "+getColor(magnitudes[i] +1)+"'</i>" +
                    magnitudes[i] + (magnitudes[i+1] ? "-" +magnitudes[i+1] +"<br>" : "+");
    };
    return div;
};

// add legend on map
legend.addTo(map);

// Grabbing, parsing and add tectonic Plates GeoJSON data(FeatureCollection) on map object as geoJSON layer
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then((data) =>{
    L.geoJSON(data,{
        style: {
                opacity: 1,
                color: "#e85151",  
                weight: 2.7
        },
        // a popup info for each tactonic boundary
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3> Tectonic Plate Boundary: " +feature.properties.Name+
                                "</h3><hr><h4> PlateA: "+ feature.properties.PlateA +
                                " &#124; PlateB: " +feature.properties.PlateB +"</h4>")
        }
    }).addTo(plates);  
});

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function(data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        }            
    };
    function getColor(magnitude) {
        if (magnitude > 5) {
            return "#ea2c2c";
        }
        if (magnitude > 6) {
            return "000000";
        }
        return "2c#ea82";
    };
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    };
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(majorEarthquakes);
});