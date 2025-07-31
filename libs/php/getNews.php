<?php

	include 'config.php';

	// remove for production
 
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$key = $NEWSDATA_KEY;
	$query = str_replace(" ", "-", $_REQUEST['query']);
	$country = $_REQUEST['country'];

	$url= "https://newsdata.io/api/1/latest?apikey=".$key."&language=en&country=".$country;//."&q=".$query;	
           
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true)['results'];

	$articles = [];

	$elements = array("title", "link", "image_url", "source_name");
	$count = 0;

	foreach ($decode as $x) {
		
		$article = [];
		foreach ($x as $key => $val) {
			if (in_array($key, $elements)) {
				$article[$key] = $val;
			}
		 }
		 $articles[$count] = $article;
		 $count += 1;
		 if($count === 5){break;}
	}
	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	
	$output['data'] = $articles;
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
