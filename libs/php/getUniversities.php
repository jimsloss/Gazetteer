<?php

// ### still in production


	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	$executionStartTime = microtime(true);

	// $country = $_REQUEST['country'];	
	$country = "turkey";
	
//	$url = "http://universities.hipolabs.com/search?country=" . $country;

  //  $url = "https://countriesnow.space/api/v0.1/countries/population/cities";

	$url = "https://countriesnow.space/api/v0.1/countries/cities?".$country;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

		// "data": [
		// {
		//   "web_pages": [
		//     "https://kyrenia.edu.tr"
		//   ],
		//   "name": "University of Kyrenia",
		//   "alpha_two_code": "TR",
		//   "country": "Turkey",
		//   "state-province": null,
		//   "domains": [
		//     "std.kyrenia.edu.tr",
		//     "kyrenia.edu.tr"
		//   ]
		// },
		// {


	// $uniData= [];

	// $index = 0;
	// foreach ( $decode as $uni){
	// 	$Info = [];
	// 	$info['name'] = $uni['name'];
	// 	$info['website'] = $uni['web_pages'];
		
	// 	$airports[$index] = $airportInfo;
	// 	$index++;
	// }


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode;

		
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>
