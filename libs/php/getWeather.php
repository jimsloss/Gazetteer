<?php

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$lat = $_REQUEST['lat'];
	$lon = $_REQUEST['lon'];
	$key = $OPENWEATHERMAP_KEY;
	$vcKey = $VISUALCROSSING_KEY;

	$url = "https://api.openweathermap.org/data/2.5/weather?lat=" . $lat . "&lon=" . $lon . "&appid=" . $key;
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$weatherInfo = [];

	$today['description'] = $decode['weather'][0]['description'];
	$today['wind'] = $decode['wind']['speed'];
	$today['humidity'] = $decode['main']['humidity'];
	$today['icon'] = $decode['weather'][0]['icon'];
	
	// weather forecasting   -  docs:  https://www.visualcrossing.com/weather-query-builder/#
		
	$forecastAddress = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
	$forecastUrl = $forecastAddress . $lat ."%2C" . $lon . "?unitGroup=uk&elements=datetime%2Ctempmax%2Ctempmin%2Cdescription%2Cicon%2Caccdegreedays&include=days&key=" .$vcKey . "&contentType=json";

	$forecast_ch = curl_init();
	curl_setopt($forecast_ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($forecast_ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($forecast_ch, CURLOPT_URL,$forecastUrl);
		
	$forecast_result=curl_exec($forecast_ch);
		
	curl_close($forecast_ch);
		
	$forecast = json_decode($forecast_result,true)['days'];
				   
	$today['tempMax'] = $forecast[0]['tempmax'];
	$today['tempMin'] = $forecast[0]['tempmin'];
	$weatherInfo['today'] =$today;
									
	$tomorrow['max'] = $forecast[1]['tempmax'];
	$tomorrow['min'] = $forecast[1]['tempmin'];
	$tomorrow['icon'] = $forecast[1]['icon'];
	$tomorrow['description'] = $forecast[1]['description'];
	$weatherInfo['tomorrow'] =$tomorrow;

	$nextday['max'] = $forecast[2]['tempmax'];
	$nextday['min'] = $forecast[2]['tempmin'];
	$nextday['icon'] = $forecast[2]['icon'];
	$nextday['description'] = $forecast[2]['description'];
	$weatherInfo['nextday'] =$nextday;	
			
	// end weather forecasting
	 
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $weatherInfo;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
