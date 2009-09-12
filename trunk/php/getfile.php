<?php
	if ($_GET['file'] == '') {
		$string = '{startshape: "main", main: [{weight: 1, draw: [{shape: "SQUARE"}, {shape: "TRIANGLE", h: 42, s: [0.5, 1], sat: 1, b: 0.5}]}]}';
	} else {
		//echo $_GET['file'];
		//echo stripslashes($_GET['file']);
		//echo urldecode($_GET['file']);
		$string = urldecode(stripslashes($_GET['file']));
		//echo $string;
	}
	//This forces the file to be downloaded:
	$filename = "fractal";
	$ext = "txt";
	$mime_type = (PMA_USR_BROWSER_AGENT == 'IE' || PMA_USR_BROWSER_AGENT == 'OPERA')
	? 'application/octetstream'
	: 'application/octet-stream';
	header('Content-Type: ' . $mime_type);
	if (PMA_USR_BROWSER_AGENT == 'IE')
	{
		header('Content-Disposition: inline; filename="' . $filename . '.' . $ext . '"');
		header("Content-Transfer-Encoding: binary");
		header('Expires: 0');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Pragma: public');
		print $string;
	} else {
		header('Content-Disposition: attachment; filename="' . $filename . '.' . $ext . '"');
		header("Content-Transfer-Encoding: binary");
		header('Expires: 0');
		header('Pragma: no-cache');
		print $string;
	}
?>