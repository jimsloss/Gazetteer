<?php

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	$executionStartTime = microtime(true);
	
	$url = file_get_contents("../js/countryBorders.geo.json");
	
	$decode = json_decode($url, true)['features'];

	$border = [];
 	
	$countries = [];
 	foreach ($decode as $x) {
		$countries[$x['properties']['iso_a2']] = $x['properties']['name'];
 	}
	asort($countries);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

	$output['data'] = $countries;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
