<?php

	include 'config.php';
 
	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
	
	$query = str_replace(" ", "-", $_REQUEST['query']);
           
	$url = "http://api.geonames.org/wikipediaSearchJSON?q=" . $query . "&maxRows=10&username=jimsloss";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true)['geonames'];

	$entries = [];
	
	foreach ($decode as $x) {
		$entry = [];
		$entry['title'] = $x['title'];
		$entry['thumb'] = $x['thumbnailImg'];
		$entry['summary'] = $x['summary'];
		$entry['link'] = $x['wikipediaUrl'];
		$entries[] = $entry;
	}
	
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	
	$output['data'] = $entries;
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
