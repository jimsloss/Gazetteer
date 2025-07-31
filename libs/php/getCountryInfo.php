<?php

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url='http://api.geonames.org/countryInfoJSON?username=jimsloss';
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$infoDecode = json_decode($result,true)['geonames'];

	$country = $_REQUEST['country'];
	$countryInfo = [];

	foreach ($infoDecode as $x) {
		if($x['countryName'] === $country){
			$countryInfo['capital'] = $x['capital'];
			$countryInfo['population'] = $x['population'];
			$countryInfo['languages'] = str_replace(",", " / ", $x['languages']);

			$countryInfo['area'] = $x['areaInSqKm'];
			$countryInfo['currency'] = $x['currencyCode'];
			$countryInfo['countryCode'] = $x['countryCode'];			
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

