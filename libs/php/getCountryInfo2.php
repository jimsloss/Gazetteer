<?php

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	$executionStartTime = microtime(true);

	$opencageKey = $OPENCAGE_KEY;
	$country = str_replace(" ", "_", $_REQUEST['country']);

	$url = "https://api.opencagedata.com/geocode/v1/json?q=".$country."&key=".$opencageKey;
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true)['results'][0];

	$countryInfo = [];


	foreach ($decode as $key => $val) {
		if($key === "annotations"){
			$countryInfo["diallingCode"] = $decode[$key]['callingcode'];
			$countryInfo["timeZone"] = $decode[$key]['timezone']['name'];
			$countryInfo["wikidata"] = $decode[$key]['wikidata'];
			$countryInfo["currencySymbol"] = $decode[$key]['currency']['symbol'];
		 }
	}


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $countryInfo;
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>
