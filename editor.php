<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Shape Lab - Editor</title>
<link type="text/css" href="css/smoothness/jquery-ui-1.7.2.custom.css" rel="stylesheet" />
<link type="text/css" href="css/style.css" rel="stylesheet" />
<script type="text/javascript" src="js/jquery-1.3.2.min.js" ></script>
<script type="text/javascript" src="js/jquery-ui-1.7.2.custom.min.js" ></script>
<script type="text/javascript" src="js/contextfree.js" ></script>
<script type="text/javascript" src="js/json.js" ></script>
<script type="text/javascript" src="js/script.js" ></script>
</head>
<body>
<?php include('header.php'); ?>
<div id="canvas" ></div>
<ul id="toolbar" >
	<li><span>File</span>
		<ul>
			<li onClick="newFile();" ><a href="#" >New</a></li>
			<li onClick="saveFile();" ><a href="#" >Save</a></li>
			<li onClick="$('#uploadfile').dialog('open');" ><a href="#" >Upload</a></li>
			<li onClick="$('#openfile').dialog('open');" ><a href="#" >Open</a></li>
			<li onClick="$('#opencffile').dialog('open');" ><a href="#" >Open CF</a></li>
		</ul>
	</li>

	<li><span>Rule</span>
		<ul>
			<ul id="rulelist" >
				<li class="rule selected" ><a href="#" >main</a></li>
			</ul>
			<li onClick="$('#newrule').dialog('open');" ><a href="#" >Add</a></li>
			<li onClick="deleteRule();" ><a href="#" >Delete</a></li>
		</ul>
	</li>

	<li><span>Shape</span>
		<ul>
			<li onClick="addShape();" ><a href="#" >Add</a></li>
			<li onClick="deleteShape();" ><a href="#" >Delete</a></li>
		</ul>
	</li>
	
	<li onClick="render();" ><a href="#" >Render</a></li>
</ul>
<div id="propbar" >
	<button onClick="pushShape('propbar', 'doc'); pushShape('doc', 'canvas');" id="propsavebutton" >Save Changes</button>
	<label for="propshape" >Shape: </label>
	<div onClick="$('#propshape').val('SQUARE');" title="Rectangle" class="ui-state-default ui-corner-all" ><span class="ui-icon ui-icon-rect"/></div>
	<div onClick="$('#propshape').val('CIRCLE');" title="Circle" class="ui-state-default ui-corner-all" ><span class="ui-icon ui-icon-circ"/></div>
	<div onClick="$('#propshape').val('TRIANGLE');" title="Triangle" class="ui-state-default ui-corner-all" ><span class="ui-icon ui-icon-tri"/></div>
	<input id="propshape" value="SQUARE" /><br/>
	<label for="propx" >X: </label>
	<input id="propx" value="0" />
	<label for="propy" >Y: </label>
	<input id="propy" value="0"	/><br/>
	<label for="propsize" >Size: </label>
	<input id="propsize" value="1"	/>
	<div onClick="toggleSizeLock();" id="sizelock" title="Resize height and width together" class="ui-state-default ui-corner-all" ><span class="ui-icon ui-icon-locked"/></div>
	<input id="propsize2" disabled	/><br/>
	<label for="proprot" >Rotation: </label>
	<input id="proprot" value="0"	/>
	<canvas onmousedown="propRotStartDrag(event);" id="proprot-draggable" width="30" height="30" ></canvas><br/>
	<label>Color: </label>
	<a href="#" onClick="$('#propcolorselector').dialog('open');" >Choose...</a><br/>
	<label for="propz" >Z: </label>
	<input id="propz" value="0"	/>
</div>
<div id="propcolorselector" title="Color Selector" class="dialog" >
	<label for="prophue" >Hue: </label>
	<input id="prophue" value="0"	/><br/>
	<label for="propbrightness" >Brightness: </label>
	<input id="propbrightness" value="0"	/><br/>
	<label for="propsat" >Saturation: </label>
	<input id="propsat" value="0"	/>
</div>
<div id="newrule" title="New Rule" class="dialog" >
	<label for="newrulename" >Name: </label>
	<input id="newrulename"	/><br/>
	<label for="newruleweight" >Weight: </label>
	<input id="newruleweight" value="1"	/><br/>
	<button onClick="addRule($('#newrulename').val(), parseFloat($('#newruleweight').val())); $('#newrule').dialog('close');" >Create</button>
</div>
<div id="openfile" title="Open File" class="dialog" >
	<textarea id="openfiletext" >Paste your document here.</textarea><br/>
	<button onClick="openFile(JSON.parse($('#openfiletext').val())); $('#openfile').dialog('close');" >Open</button>
</div>
<div id="opencffile" title="Open CF File" class="dialog" >
	<textarea id="opencffiletext" >Paste your contextfree code here.</textarea><br/>
	<button onClick="openCFFile($('#opencffiletext').val()); $('#openfile').dialog('close');" >Open</button>
</div>
<div id="savefile" title="Save File" class="dialog" >
	<p>Here is your file. Paste it somewhere safe. ;)</p>
	<p id="savefiledata" >Error. Data not loaded.</p>
</div>
<div id="uploadfile" title="Upload File to Gallery" class="dialog" >
	<label for="uploadname" >Name: </label>
	<input id="uploadname"	/><br/>
	<label for="uploadauthor" >Your name: </label>
	<input id="uploadauthor" /><br/>
	<button onClick="uploadFile($('#uploadname').val(), $('#uploadauthor').val()); $('#uploadfile').dialog('close');" >Upload to Gallery</button>
</div>
<div id="uploadfileprogress" title="Uploading..." class="dialog" ></div>
<?php include('footer.php'); ?>
</body>
</html>