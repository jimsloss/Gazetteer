// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

// http://numeraljs.com/  installed, used for formatting numbers

// https://github.com/datejs/Datejs   installed, used for formatting dates


var map;  
var airports = null;
var cities = null;

var borderLayer;
var mapBorder = "";
var country, countryCode, capital, latitude, longitude; 
var currency, currencyName, currencySymbol;
var timeZone, countryTime, startForecast;

// tile layers

// layer showing the map at nomral street layer view
var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

// layer showing the satellite viiew
var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);


// both layers are added to single object, for toggle purposes on the map, to be displayed top right corner
var basemaps = {
  "Streets": streets,
  "Satellite": satellite,
};

// buttons

var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) { 
  $("#infoModal").modal("show");
});

 var weatherBtn = L.easyButton("fa-regular fa-sun fa-xl", function (btn, map) {
  getCountryTime(); 
  getWeather();
  $("#weatherModal").modal("show");
});

var currencyConversionBtn = L.easyButton("fa-eur fa-xl", function (btn, map) {
  getCurrencyInfo();
  $("#currencyExchangeModal").modal("show");
});

var newsBtn = L.easyButton("fa-regular fa-newspaper fa-xl", function (btn, map) {
  getNews();
  $("#newsModal").modal("show");
});

var imagesBtn = L.easyButton("fa-regular fa-images fa-xl", function (btn, map) {
  getImages();
  $("#imagesModal").modal("show");
});

var wikiBtn = L.easyButton("fa-brands fa-wikipedia-w fa-xl", function (btn, map) {
  getWiki();
  $("#wikiModal").modal("show");
});


var airportIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-plane",
  iconColor: "black",
  markerColor: "white",
  shape: "square"
});

var cityIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-city",
  markerColor: "blue",
  shape: "square"
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------


// Step 1: initialise and add controls, 
  // .. including country drop down box, once DOM is ready
    // .. gets user's location and passes this to showPosition function

$(document).ready(function () {

  // display loading message while waiting for location

  document.getElementById("subtext").innerHTML =
  "Loading Location ....";

  //get users location

  if (navigator.geolocation) {
    // pass current position to showPosition
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    document.getElementById("subtext").innerHTML =
    "Geolocation is not supported by this browser.";
  }

  // set up base map with no view yet set

  map = L.map("map", {
    layers: [streets]
  })
   
  // displays button on top right to toggle between streets and satellite layer
  layerControl = L.control.layers(basemaps).addTo(map);
  
  // displays the buttons on left side 

  infoBtn.addTo(map);

  weatherBtn.addTo(map);

  currencyConversionBtn.addTo(map);

  newsBtn.addTo(map);

  imagesBtn.addTo(map);

  wikiBtn.addTo(map);

  // later implementation - run out of time
  //  universitiesBtn.addTo(map);

 // gets list of countries and populates the county drop down box at the top
  $.ajax({
 		url: "libs/php/getCountries.php",   // return: array of    countrycode:countryname
 		type: 'GET',
 		dataType: 'json',	
 		success: function(result) {
      //console.log(JSON.stringify(result["data"]));
 			if (result.status.name == "ok") {
        $.each(result["data"],function(code, name){
          $('#countrySelect').append($('<option>', {value:code, text:name}));
        });
      }
    },
    // if unable to get list, display message
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }

  });

});

// Step 2: Takes the passed in location (position object), and displays location on screen
  // .. uses getCountry.php to get the country name corresponding to (lat, lon)
    
// .. sets global  (country, countryCode, latitude, longitude)
// .. calls central updateDisplay() function

function showPosition(position) {

  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  latitude = lat.toFixed(7);
  longitude = lon.toFixed(7);

  // this works but should be using fitbounds
  map.setView([lat, lon], 7); // higher number is closer view

  // get the country name from lat and lon
  $.ajax({
    url: "libs/php/getCountry.php",
    type: "POST",
    dataType: 'json',		
    data: { 
      lat: latitude,
      lon: longitude,
    },
    success: function(result) {
      //console.log(JSON.stringify(result));    

      if (result.status.name == "ok") {
        // remove loading message
        document.getElementById("subtext").innerHTML = "";
        country = result['data']['countryName'];
        countryCode = result['data']['countryCode'];
        
        // update select box to show user location
        $('#countrySelect').val(countryCode).change();
  
       } 
    },
    // if unable to get country name, display message
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }


  });


}

// Step 3: central updateDdisplay function ran all api calls, this was inefficient
// moved calls to buttons so only displayed when needed

function updateDisplay(){
  getCountryInfo();
  getCountryInfo2();
  getAirports(); 
  getCities();
}


/**
 * Functions called by updateDisplay()
 */

function displayBorder(){
  
  $.ajax({
    url: "libs/php/getBorder.php", 
    type: "POST",
    dataType: 'json',		
    data: { 
      country: country
    },
    success: function(result) {
      if (result.status.name == "ok") {  
        
        // getBorder returns a geoJson object which includes coordinates,
        // stored here in mapBorder

          mapBorder = result['data'];          

        // the border is then aded to the border layer, 
        // which is then added to the map        

          borderLayer = L.geoJson(mapBorder,{
              style:{
                "color": "#ff7800",
                "weight": 3,
                "opacity": 0.65,
              }
            }
          );

          borderLayer.addTo(map);
      
        // zooms the map to the polyline, 
        // which makes sure the full bordered area is displayed
          
          map.fitBounds(borderLayer.getBounds());

       } 

    },
    // if unable to get border, display message
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
      document.getElementById("subtext").innerHTML ="<h3>Failed to get borders.</h3>"; 
  }
   });

   
  
  
}

// updates globals  (countryCode, currency, capital)
// populates the country info modal  (flag image, capital, population, country area, currency, languages)

function getCountryInfo(){
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: "POST",
    dataType: 'json',		
    data: { 
     country: country,
    },
    success: function(result) {
     // console.log(JSON.stringify(result));
      if (result.status.name == "ok") {  
       
        // update globals for use elsewhere
        currency = result['data']['currency'];
        capital = result['data']['capital'];
        countryCode = result['data']['countryCode'];
       
        flagCode = result['data']['countryCode'];
        var flagurl = "https://flagsapi.com/" + flagCode + "/flat/64.png";
        $('img[id="flagPic"]').attr("src", flagurl);
       
        document.getElementById("capital").innerHTML = 
        result['data']['capital']; 
        
        document.getElementById("population").innerHTML = 
        numeral(result['data']['population']).format('000,000,000');
        
        document.getElementById("countryArea").innerHTML = 
        numeral(result['data']['area']).format('000,000,000') + " km&sup2";
        
        document.getElementById("currency").innerHTML = 
        result['data']['currency']; 
        
        document.getElementById("languages").innerHTML = 
        result['data']['languages']; 
       
      } 
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
   });
   
}

// updates global  (timeZone, countryTime)  
// adds remaining information to information modal  (dialling code, timeZone)

function getCountryInfo2(){

  $.ajax({
    url: "./libs/php/getCountryInfo2.php",
    type: 'POST',
    dataType: 'json',		
    data: { 
      country: country
    },
    success: function(result) {
      //console.log(JSON.stringify(result["data"]));
      if (result.status.name == "ok") {

        timeZone = result['data']['timeZone'];  // also used in getCountryTime
       // alert("timeZone set to: " + timeZone);

        // used in currency conversion
        currencySymbol = result['data']['currencySymbol'];
                
        // populate dialling code in info
        document.getElementById("dialling").innerHTML = result['data']['diallingCode']; 

        // populate time zone in info
        document.getElementById("timeZone").innerHTML = timeZone;
        
      } 
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
  }
  
  });

}

// updates globals  (counrtyTime, startForecast) used in the weather modal
// ## needs timeZone, set in getCountryInfo2 ##

function getCountryTime(){
  
  // uses api-ninjas ..  switched from timeapi.io due to delays and problematic
  $.ajax({
    url: "./libs/php/getCountryTime.php",
    type: 'POST',
    dataType: 'json',		
    data: { 
      timezone: timeZone
    },
    success: function(result) {

      //console.log(JSON.stringify(result["data"]));
      if (result.status.name == "ok") {

        // update global countryTime for use in weather modal
        countryTime = result['data']['datetime'];
      } 
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
  
  });


}


// ### getAirports() HAS STOPPED WORKING AS API LINK WAS TRAIL. NOW CHARGING $39 A MONTH ###

// adds layer on top right control
function getAirports(){

  $.ajax({
    url: "libs/php/getAirports.php",
    type: "POST",
    dataType: 'json',		
    data: { 
     country: countryCode
    },
    success: function(result) {
      alert("running success");
      alert(country + " " + countryCode);
      alert(result);

      //  if(typeof result === 'string'){ result = $.parseJSON(result); }
      // console.log(JSON.stringify(result));
      if (result.status.name == "ok") {
          
        if (airports !== null) {
          layerControl.removeLayer(airports);
          airports.clearLayers();
        }
        
       airports = L.markerClusterGroup({
        polygonOptions: {
          fillColor: "red",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.3
        }
      });
       
        
        var index = 0;
        for(element in result['data']){
          var name = result['data'][element].name;
          var lat = result['data'][element].lat;
          var lon = result['data'][element].lon;

          airports.addLayer( 
           L.marker( [lat, lon], { title: name, icon: airportIcon} )
           .bindPopup('<h6>' + name + '</h6>')
          )
          index ++;         
        }
        
        
        layerControl.addOverlay(airports, "Airports");
        airports.addTo(map);
      }        
    },
    error: function(xhr, status, error) {
      // alert(countryCode);
      //  if(typeof result === 'string'){ result = $.parseJSON(result); }
      console.error('Error: ' + error);
    }
   });
 
}

// adds layer on top right control
function getCities(){

  document.getElementById("subtext").innerHTML =
  "Loading Cities, pls wait ....";

  $.ajax({  
    url: "libs/php/getCities.php",
    type: "POST",
    dataType: 'json',		
    data: { 
      countryCode: countryCode, 
    },
    success: function(result) {
      // console.log(JSON.stringify(result));
      if (result.status.name == "ok") {
        document.getElementById("subtext").innerHTML =
        "";
  
        if (cities !== null) {
          layerControl.removeLayer(cities);
          cities.clearLayers();
        }
        
    
        cities = L.markerClusterGroup({
          polygonOptions: {
            fillColor: "green",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.3
          }
        });

        
        var index = 0;
        for(element in result['data']){
          var name = result['data'][element].name;
          var lat = result['data'][element].lat;
          var lon = result['data'][element].lon;

          cities.addLayer( 
           L.marker( [lat, lon], { title: name, icon: cityIcon})
           .bindPopup('<h6>' + name + '</h6>')
          )
          index++;         
        }
        
        layerControl.addOverlay(cities, "Cities");
        cities.addTo(map);
      }        
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
   });
 
}


// ##  these are called by button presses

function getWeather(){
 
  // populated (weatherlocation, weather time, weather temp, feels like,  
    // weather desc,  weather wind, humidity, weathering icon)

  $.ajax({
    
    url: "libs/php/getWeather.php",
    type: "POST",
    dataType: 'json',		
    data: { 
     lat: latitude,
     lon: longitude
    },
    success: function(result) {
      //console.log(JSON.stringify(result['data']));
      if (result.status.name == "ok") {

          // "data": [
          // {
          //   "datetime": "2025-03-15",
          //   "tempmax": 8.5,
          //   "tempmin": -1.2,
          //   "description": "Partly cloudy throughout the day.",
          //   "icon": "partly-cloudy-day",
          //   "accdegreedays": 0
          // },
       
        document.getElementById("weatherTitle").innerHTML = capital + ", " + country; 
       
        // todays weather
        document.getElementById("weatherDate").innerHTML = "Today ";// + Date.parse('today').toString("ddd dS");

        document.getElementById("weatherDesc").innerHTML = (result['data']['today']).description;
        document.getElementById("weatherWind").innerHTML = numeral(result['data']["today"].wind).format(0) + "mph"; 
        document.getElementById("humidity").innerHTML = numeral((result['data']['today']).humidity).format(0) + "%"; 

        var weatherIcon = (result['data']['today']).icon; 
        var weatherPicUrl = "https://openweathermap.org/img/w/" + weatherIcon + ".png";
        $("#weatherImg").attr("src", weatherPicUrl);
  
        document.getElementById("todayMax").innerHTML = numeral((result['data']['today']).tempMax).format(0) +" &degC"; 
        document.getElementById("todayMin").innerHTML = numeral((result['data']['today']).tempMin).format(0) +" &degC"; 

        // tomorrow
        document.getElementById("tomorrowDate").innerHTML = Date.parse("tomorrow").toString("ddd dS");
        document.getElementById("tomorrowMax").innerHTML = numeral(result['data']['tomorrow'].max).format(0) +" &degC";
        document.getElementById("tomorrowMin").innerHTML = numeral(result['data']['tomorrow'].min).format(0) +" &degC";
        document.getElementById("tomorrowDesc").innerHTML = result['data']['tomorrow'].description;

        // next day
        document.getElementById("nextDay").innerHTML = Date.parse("t + 2d").toString("ddd dS");
        document.getElementById("nextDayMax").innerHTML = numeral(result['data']['nextday'].max).format(0) +" &degC";
        document.getElementById("nextDayMin").innerHTML = numeral(result['data']['nextday'].min).format(0) +" &degC";
        document.getElementById("nextDayDesc").innerHTML = result['data']['nextday'].description;
  
       
       } 
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
   });
   

}

function getCurrencyInfo(){

  // adds the (exchange title, country currency, currency dropdown)

  // the drowdown action is dealt with by currencySelect event (bottom of page)
  // it gets the relevant exchange rate and calculates the exchange value

  $.ajax({
    url: "libs/php/getCurrencyInfo.php",
    type: "POST",
    dataType: 'json',		
    data: { 
     currency: currency,
    },
    success: function(result) {
      //console.log(JSON.stringify(result));
      if (result.status.name == "ok") {  

        $.each(result["data"]['rates'],function(currency, rate){
          $('#exchangeRate').append($('<option>', {value:rate, text:currency}));
        });

        document.getElementById("exchange title").innerHTML = result['data']['active'];
       
        document.getElementById("symbol").innerHTML = "Exchange amount: " + currencySymbol;
        } 

        calcResult();

    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
   });
   
}


// ###############

function calcResult() { 
  $('#exchangeResult').val(numeral($('#exchangeAmount').val() * $('#exchangeRate').val()).format("0,0.00"));
}

$('#exchangeAmount').on('keyup', function () { calcResult(); })

$('#exchangeAmount').on('change', function () { calcResult(); })

$('#exchangeRate').on('change', function () { calcResult(); })

$('#currencyExchangeModal').on('show.bs.modal', function () { calcResult(); })

$('#currencyExchangeModal').on('hidden.bs.modal', function () { 
  $('#exchangeAmount').val(1); 
  $('#exchangeRate').prop('selectedIndex',0);
})


// ##############

function getNews(){

 // adds first ten news items found using country name as keyword
 // doesnt seem to work well with all countries

  $.ajax({
   
    url: "libs/php/getNews.php",
    type: "POST",
    dataType: 'json',		
    data: { 
     query: country,
     country: countryCode
    },
    success: function(result) {
      // console.log(JSON.stringify(result));
      if (result.status.name == "ok") {
        
          $('#newsArticles').html('');
           
          var title, link, desc, article;

          for(element in result['data']){
            title = result['data'][element]['title'];
            link = result['data'][element]['link'];
            image = result['data'][element]['image_url'];
            source = result['data'][element]['source_name'];

             article = `
              <div class="row">
								<div class="col">
                  <div><img src=${image} alt= ${country} class = "w-100 img-fluid rounded"></div>
					      </div> 
					      <div class="col">
						      <p> <a href=${link} target="_blank" class = "fw-bold text-black">${title}</a>
                  <p class ="text-secondary">${source}</p> 
					      </div> 
                                         		
						  </div>
              <hr>`;
            
            $('#newsArticles').append(article);
        
          }
      }         
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
   });
   
}

function getImages(){

  $.ajax({
    url: "libs/php/getImages.php",
    type: "POST",
    dataType: 'json',		
    data: { 
     country: country
    },
    success: function(result) {
      //  console.log(JSON.stringify(result));
      if (result.status.name == "ok") {
        
          document.getElementById("imagesTitle").innerHTML = 
          "Some photos from " + country ; 

          for(element in result['data']){
            
            element = parseInt(element);

            var imgtitle = "image" + (element+1) + "footer";

            document.getElementById(imgtitle).innerHTML = 
            "pixabay id: " + result['data'][element]['id']; 

            var imageName = "image" + (element+1);
            var imageurl = result['data'][element]['image'];

            $('img[id=' + imageName+']').attr("src", imageurl);
 
          }
      }         
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
   });
   
}
 
function getWiki(){

  $.ajax({

    url: "libs/php/getWiki.php",
    type: "POST",
    dataType: 'json',		
    data: { 
      query: country
    },
    success: function(result) {

      // console.log(JSON.stringify(result));
      if (result.status.name == "ok") {

        document.getElementById("wikiTitle").innerHTML = "WikiData for '" + country + "';"; 
        
        $('#wikiArticles').html('');
          
        var title, summary, link;
    
        for(element in result['data']){

          title = result['data'][element]['title'];
          thumb = result['data'][element]['thumb'];
          summary = result['data'][element]['summary'];
          link = "https://" + result['data'][element]['link'];   
                
          article = `
            <div class="row">
              <div class ="fw-bold fs-5"> ${title} </div>

              <div class="col">
                <div><img src=${thumb} alt= ${country} class = "w-100 img-fluid rounded"></div>
              </div> 

              <div class="col">
                <p> ${summary}</p> 
                <div class="text-secondary"> <a href=${link} target="_blank">Link To Article</a> </div>               
              </div> 

            </div>
            <hr>
            `;
          
            $('#wikiArticles').append(article);     
            
      



        }  
      }         
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
      $('#wikiArticles').html('No Wikidata Found.');
    }
  });   
}


/**
 * Dropdown events action
 */


// main country selection 
$("#countrySelect").on("change", function() {
  
  var selectedCountry = $(this).find(':selected').text();

  code = $(this).find(':selected').val();

  // need to convert country name to latitude and longitude
  $.ajax({
    url: "./libs/php/getCountryCoords.php",
    type: 'POST',
    dataType: 'json',	
    data: { 
      country: selectedCountry
    },
    success: function(result) {
      
      //console.log(JSON.stringify(result["data"]));
      if (result.status.name == "ok") {
 
        latitude = result['data']['lat'];
        longitude = result['data']['lon'];
        country = selectedCountry;
        countryCode = code;

        // clears existing border displayed
        // the border for the country selected is then added in displayBorder
        
        if(borderLayer){
        map.removeLayer(borderLayer);
      }
        
        map.setView([latitude, longitude], 7);

        displayBorder();
        updateDisplay();        
      
      } 
    },
    error: function(xhr, status, error) {
      console.error('Error: ' + error);
    }
   });

});



// future implemenation - out of time
// gets universities but unable to get their locations to display on map

// function getUniversitiesInfo(country){
//   $.ajax({
//     url: "libs/php/getUniversitiesInfo.php",
//     type: "POST",
//     dataType: 'json',		
//     data: { 
//      country: country,
//     },
//     success: function(result) {
//       //console.log(JSON.stringify(result));
//       if (result.status.name == "ok") {
  
//         // data": {
//         //   "capital": "Berlin",
//         //   "population": "82927922",
//         //   "languages": "de",
//         //   "area": "357021.0",
//         //   "countryCode": "DE",
//         //   "currency": "EUR"
//         // }
  
//         var code = result['data']['countryCode'];
       
//         var flagurl = "https://flagsapi.com/" + code + "/flat/64.png";
//         $('img[id="flagPic"]').attr("src", flagurl);
       
//         document.getElementById("capital").innerHTML = 
//         result['data']['capital']; 
//         document.getElementById("population").innerHTML = 
//         result['data']['population']; 
//         document.getElementById("countryArea").innerHTML = 
//         result['data']['area']; 
//         document.getElementById("currency").innerHTML = 
//         result['data']['currency']; 
//         document.getElementById("languages").innerHTML = 
//         result['data']['languages']; 
//         // add capital name to weather modal as well
//         document.getElementById("weatherLocation").innerHTML =
//         result['data']['capital']; 
//        } 
//     },
//     error: function(xhr, status, error) {
//       console.error('Error: ' + error);
//       alert("Some Country Information not obtained");
//     }
//    });
   
// }



