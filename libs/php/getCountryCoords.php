<?php

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	$executionStartTime = microtime(true);

	$opencageKey = $OPENCAGE_KEY;
	$country = $_REQUEST['country'];

	if($country === "Dem. Rep. Korea"){
		$country = "North Korea";
	}

	$country = str_replace(" ", "_", $country);
	

	$url = "https://api.opencagedata.com/geocode/v1/json?q=".$country."&key=".$opencageKey;
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true)['results'][0];

	$coords = [];

	foreach ($decode as $key => $val) {
		if($key === "geometry"){
			$coords["lat"] = $decode[$key]['lat'];
			$coords["lon"] = $decode[$key]['lng'];
		 }
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $coords;
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>
