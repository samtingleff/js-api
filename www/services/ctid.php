<?php

	function randomAlphanumeric($length) {
		$characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		$string = '';
		for ($i = 0; $i < $length; $i++) {
			$string .= $characters[rand(0, strlen($characters) - 1)];
		}
		return $string;
	}

	$ctid = array();
	$ctid["id"] = randomAlphanumeric(16);
	$ctid["secret"] = randomAlphanumeric(8);
	$ctid["preference"] = 1;
	$ctid["created"] = time();
	$ctid["modified"] = time();
	echo json_encode($ctid);
	
	

?>