<?php
	include_once "ez_sql.php";
	
	$db->query('INSERT INTO gallery (name, author, data) VALUES ("' . $_POST['name'] . '", "' . $_POST['author'] . '", "' . $_POST['data'] . '")');
	echo $db->insert_id;
?>