<?php

 // ###  THIS HAS STOPPED WORKING AS API LINK WAS TRAIL. NOW CHARGING $39 A MONTH ###

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	$executionStartTime = microtime(true);

	$key = $APININJAS_KEY;	
	
	$country = "United Kingdom";
	
	$url = "https://api.api-ninjas.com/v1/airports?country=" . $country . "&X-Api-Key=".$key;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$airports= [];

	$index = 0;
	foreach ( $decode as $airport){
		$airportInfo = [];
		$airportInfo['name'] = $airport['name'];
		$airportInfo['city'] = $airport['city'];
		$airportInfo['lat'] = round($airport['latitude'], 2); 
		$airportInfo['lon'] = round($airport['longitude'], 2);
		$airports[$index] = $airportInfo;
		$index++;
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $airports;
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 
	

?>
