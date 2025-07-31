<?php

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	$executionStartTime = microtime(true);

	$key = $APININJAS_KEY;	
	$timezone = $_REQUEST["timezone"];
	
	$timeUrl = "https://api.api-ninjas.com/v1/worldtime?timezone=".$timezone."&X-Api-Key=".$key;
   
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $timeUrl);

	$result=curl_exec($ch);

	curl_close($ch);

	$timeDecode = json_decode($result,true);

	$dateTime = $timeDecode["day_of_week"] . " " . $timeDecode['day'] . "/" . $timeDecode['month'] 
	 . "/" . $timeDecode["year"] . " " . $timeDecode['hour'] . ":" . $timeDecode['minute'];


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data']["datetime"] = $dateTime;
	$output['data']["hour"] = $timeDecode['hour'];
		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>
