<?php
	if ($_GET['file'] == '') {
		echo '{startshape: "main", main: [{weight: 1, draw: [{shape: "SQUARE"}, {shape: "TRIANGLE", h: 42, s: [0.5, 1], sat: 1, b: 0.5}]}]}';
	} else {
		include_once "ez_sql.php";
		echo $db->get_var("SELECT data FROM gallery WHERE id = " . $_GET['file'] . ";");
	}
?>