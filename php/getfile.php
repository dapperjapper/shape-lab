<?php
	if ($_GET['file'] == '') {
		//This is the default starting project:
		echo '{"startshape":"main","main":[{"weight":1,"draw":[{"shape":"main","x":0.43575,"y":0.41300000000000003,"s":[0.4655,0.5075000000000001],"r":0,"h":0,"b":0,"sat":0,"z":0},{"shape":"TRIANGLE","h":42,"s":[0.5215,1.0010000000000001],"sat":1,"b":0.5,"x":0.03325,"y":-0.13626130000000003,"r":0,"z":0},{"shape":"main","x":-0.34650000000000003,"y":0.40425,"z":0,"s":[0.448,0.46900000000000003],"r":0,"h":0,"b":0,"sat":0}]}]}';
	} else {
		include_once "ez_sql.php";
		echo $db->get_var("SELECT data FROM gallery WHERE id = " . $_GET['file'] . ";");
	}
?>