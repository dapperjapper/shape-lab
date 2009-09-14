<?php
	include_once "ez_sql.php";
	
	$db->query('INSERT INTO gallery (name, author, data, thumb) VALUES ("' . $_POST['name'] . '", "' . $_POST['author'] . '", "' . $_POST['data'] . '", "' . $_POST['thumb'] . '")');
	echo $db->insert_id;
?>