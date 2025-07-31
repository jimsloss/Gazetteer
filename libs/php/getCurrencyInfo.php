<?php

	include 'config.php';

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$key = $OPENEXCHANGERATES_KEY;
	$activeCurrency = $_REQUEST['currency'];
	

	$currenciesUrl = "https://openexchangerates.org/api/currencies.json?app_id=".$key;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$currenciesUrl);

	$currencyResult=curl_exec($ch);

	curl_close($ch);

	$currencyDecode = json_decode($currencyResult,true);
	asort($currencyDecode);

	$currencyInfo = [];

	$currencyInfo["active"] = $currencyDecode[$activeCurrency];

// ##### rates

	$ratesUrl = "https://openexchangerates.org/api/latest.json?app_id=".$key;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $ratesUrl);

	$ratesResult=curl_exec($ch);

	curl_close($ch);

	$ratesDecode = json_decode($ratesResult,true)['rates'];
	ksort($ratesDecode);

//#####

	

	foreach ($currencyDecode as $key => $val) {  // code - currency
		if (in_array($key, array_keys($ratesDecode))) {
			$currencyInfo['rates'][$val] = $ratesDecode[$key];
		}				
	}


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $currencyInfo;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
