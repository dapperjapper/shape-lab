<!DOCTYPE html>
<html>
<head>
</head>
<body>
<?php include('header.php'); ?>
<div class="hrule"></div>
<?php
	include_once "php/ez_sql.php";
	
/*
	echo '<pre>';
	var_dump($_SERVER);
	var_dump($_GET);
	echo '</pre>';
*/
	
	//Get vars
	$pagenum = $_GET['pagenum'];
	if (!(isset($pagenum))) {
		$pagenum = 1;
	}
	
	$search = $_GET['search'];
	if (!(isset($search))) {
		$search = '';
	}

	$sortby = $_GET['sortby'];
	if (!(isset($sortby))) {
		$sortby = 'date';
	}

	//Generate query
	$query = "SELECT * FROM gallery";
	if ($search!='') {
		$query .= " WHERE name LIKE '%$search%' OR author LIKE '%$search%'";
	}
	$query .= " ORDER BY $sortby DESC";
	
	//Get data
	$data = $db->get_results($query . ";");
	$rows = $db->num_rows;
		
	//This is the number of results displayed per page
	$page_rows = 2;
	
	//This tells us the page number of our last page
	$last = ceil($rows/$page_rows);
	
	//This makes sure the page number isn't below one, or more than our maximum pages
	if ($pagenum < 1) {
		$pagenum = 1;
	} elseif ($pagenum > $last) {
		$pagenum = $last;
	}
	
	//This is the limit statement for our query
	$max = ' LIMIT ' . ($pagenum - 1) * $page_rows . ',' . $page_rows;
	
	//This is the data for this page
	//$data_p = $db->get_results($query . $max . ";");
	$data_p = array_slice($data, ($pagenum - 1) * $page_rows, $page_rows);

	//DISPLAY THE DATA!!!
	foreach ($data_p as $project) {
		echo "<a href=\"editor.html#$project->id\" >";
		if ($project->thumb != NULL) {
			echo "<img src=\"$project->thumb\" />";
		} else {
			echo '<img src="css/default_image-150x150.gif" />';
		}
		echo "</a><br/><strong>$project->name</strong><br/>by $project->author<br/>";
	}
	//echo '<pre>';
	//var_dump($data_p);
	//echo '</pre>';
	
	// First we check if we are on page one. If we are then we don't need a link to the previous page or the first page so we do nothing. If we aren't then we generate links to the first page, and to the previous page.
	if ($pagenum != 1) {
		if ($pagenum > 2) {
			echo "<a href='{$_SERVER['PHP_SELF']}?pagenum=1'><<-First</a> ";
		}
		$previous = $pagenum-1;
		echo "<a href='{$_SERVER['PHP_SELF']}?pagenum=$previous'><-Previous</a> ";
	}
	
	// This shows the user what page they are on, and the total number of pages
	echo " --Page $pagenum of $last-- ";
	
	//This does the same as above, only checking if we are on the last page, and then generating the Next and Last links
	if ($pagenum != $last) {
		$next = $pagenum+1;
		echo "<a href='{$_SERVER['PHP_SELF']}?pagenum=$next'>Next-></a>";
		if ($last-$pagenum > 1) {
			echo "<a href='{$_SERVER['PHP_SELF']}?pagenum=$last'>Last->></a>";
		}
	}
?>
<?php include('footer.php'); ?>
</body>
</html>