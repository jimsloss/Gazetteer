<?php

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	$executionStartTime = microtime(true);

	$countryCode = $_REQUEST['countryCode'];
	
		$citiesUrl = "http://api.geonames.org/searchJSON?formatted=true&country=" . $countryCode . "&maxRows=80&featureClass=P&lang=en&username=jimsloss&style=full";

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_URL,$citiesUrl);
		
		$citiesResult=curl_exec($ch);

		curl_close($ch);

		$citiesDecode = json_decode($citiesResult,true)['geonames'];

	$cityInfo = [];
	foreach($citiesDecode as $city){
		$thisCity = [];
		$thisCity['name'] = $city['name'];
		$thisCity['lat'] = $city['lat'];
		$thisCity['lon'] = $city['lng'];
		$cityInfo[] = $thisCity;
	}
	sort($cityInfo);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $cityInfo;
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
