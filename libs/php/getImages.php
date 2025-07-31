<?php

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$key = $PIXABAY_KEY;
	$query = str_replace(" ", "+", $_REQUEST['country']);
		
	$url = "https://pixabay.com/api/?key=".$key."&q=".$query;
	
	// documentation:  https://pixabay.com/api/docs/
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true)["hits"];


	$images = [];

	$counter  = 0;

	 foreach ($decode as $x) {
		if( $x['imageWidth'] > $x['imageHeight'] ){
			if($counter < 5){
				$image = [];
				$image['id'] = $x['id'];
				 $image['image'] = $x['largeImageURL'];
				$image['width'] = $x['imageWidth'];
				$image['height'] = $x['imageHeight'];
				$image['size'] = $x['imageSize'];
				$images[] = $image;
				$counter ++;
			}else{
				break;
			}
		}		
	 }
	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	
	$output['data'] = $images;
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
