/*function createCanvas(){
	var c = document.createElement( "canvas" );
	c.id = "canvas";
	c.width = "1000";
	c.height = "1000";

	document.getElementById("canvasHolder").appendChild( c );
}

function removeCanvas(){
	var c = document.getElementById("canvas");
	if( c ){
		document.getElementById("canvasHolder").removeChild( c );
	}
}

function render( el ){
	removeCanvas();
	createCanvas();

	var t = new Tokenizer();
	var tokens = t.tokenize( el.id );

	var c = new Compiler();
	var compiled = c.compile( tokens );

	// compiled like:
	// { startshape: 'rule1',
	//	 rule1: [
	//		 { weight: 0.1,
	//			 draw: [
	//				 { shape: 'rule1',
	//					 r: 1,
	//					 s: 0.9,
	//					 b: 0.1
	//				 },
	//				 { shape: 'CIRCLE' }
	//			 ]
	//		 }
	//	 ]
	// }
	Renderer.render( compiled, "canvas" );
}*/

//VARIABLES//
var canvasToDocRatio = 0.0035;
var doc;
var shapeDefaults = {shape: 'SQUARE', x: 0, y: 0, z: 0, s: 1, r: 0, h: 0, b: 0, sat: 0};
var selectedRule;
var selectedShapeId;
var toSelectShapeIds;

//FILE MANAGMENT FUNCTIONS//
function saveFile() {
	$('#savefiledata').text(JSON.stringify(doc));
	$('#savefile').dialog('open');
}

function uploadFile(name, author) {
	if (name=='' || author=='') {
		alert('You must fill in all fields!');
		return null;
	}
	$('#uploadfileprogress').html('<div style="text-align: center;" ><img src="css/ajax-loader.gif" /></div>');
	$('#uploadfileprogress').dialog('open');
	$.post('php/savefile.php', {'name': name, 'author': author, 'data': JSON.stringify(doc)}, function(data) {
		savedId = parseInt(data);
		if (savedId) {
			savedUrl = location.protocol + '//' + location.host + location.pathname + '#' + savedId;
			$('#uploadfileprogress').html('Upload successful! You can view it at the gallery or share this url: ' + savedUrl);
		} else {
			$('#uploadfileprogress').html('There was a problem! Here is the error: ' + data);
		}
	});
}

function openFile(data) {
	doc = data;
	refreshRuleSelector();
}

function newFile() {
	if (confirm("Creating a new file will erase your current one. Have you saved?")) {
		//We want to reload the page, removing the hash in the url.
		location.href = location.pathname;
	}
}

//DRAWCANVAS FUNCTIONS//
function createDrawCanvas() {
	canvas = document.getElementById('canvas');
	//pushShape('propbar', 'doc');
	selectShape(null);
	$(canvas).empty();
	$(canvas).append('<canvas id="drawcanvas" width="' + canvas.clientWidth + '" height="' + canvas.clientHeight + '" onmousedown="pushRule(\'doc\', \'canvas\');" ></canvas>');
}

function render() {
	createDrawCanvas();
	
	canvas = document.getElementById('drawcanvas');
	ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	Renderer.render(doc, "drawcanvas");
}

//PUSH FUNCTIONS//

//get the rule from the source, and put the shapes in the destination
function pushRule(from, to, rule) {
	//both from and to can be one of: doc, canvas
	rule = rule || selectedRule;
	canvas = $('#canvas');
	canvas.empty();
	for (var i in selectedRule.draw) {
		canvas.append(canvasShapeHTML(shapeDefaults, i));
		pushShape('doc', 'canvas', i);
	}
}

//get the shape from the source, and put the values in the destination
function pushShape(from, to, shapeId, shapeRule) {
	//shapeRule argument isn't really useful...
	//both from and to can be one of: doc, propbar, or canvas
	var fromShape = {};
	shapeId = shapeId || selectedShapeId;
	shapeRule = selectedRule;

	//get the fromShape from the source
	if (from == "propbar") {
		cleanupPropbar();
	
		fromShape.shape = $('#propshape').val();
		fromShape.x = parseFloat($('#propx').val());
		fromShape.y = parseFloat($('#propy').val());
		if ($('#sizelock span').hasClass('ui-icon-locked')) {
			fromShape.s = parseFloat($('#propsize').val());
		} else {
			fromShape.s = [parseFloat($('#propsize').val()), parseFloat($('#propsize2').val())];
		}
		fromShape.r = parseFloat($('#proprot').val());
		fromShape.h = parseFloat($('#prophue').val());
		fromShape.b = parseFloat($('#propbrightness').val());
		fromShape.sat = parseFloat($('#propsat').val());
		fromShape.z = parseFloat($('#propz').val());
	} else if (from == "canvas") {
		var fromShapeCanvas = $('#shape' + shapeId);
		var fromCanvas = $('#canvas');
	
		fromShape.x = ((fromShapeCanvas.position().left) - (fromCanvas.width()/2) + (fromShapeCanvas.width()/2)) * canvasToDocRatio;
		fromShape.y = -((fromShapeCanvas.position().top) - (fromCanvas.height()/2) + (fromShapeCanvas.height()/2)) * canvasToDocRatio;
		if (fromShapeCanvas.width() == fromShapeCanvas.height()) {
			fromShape.s = fromShapeCanvas.width() * canvasToDocRatio;
		} else {
			fromShape.s = [(fromShapeCanvas.width() * canvasToDocRatio), (fromShapeCanvas.height() * canvasToDocRatio)];
		}
		
		var leftTri = fromShapeCanvas.children('.triangle-left');
		var rightTri = fromShapeCanvas.children('.triangle-right');
		if (leftTri.length > 0 && rightTri.length > 0) {
			realignTriangle(fromShapeCanvas, fromShape);
			fromShape.shape = 'TRIANGLE';
			//Context Free handles triangle positions and sizes differently
			if (sizeLocked(fromShape)) {
				fromShape.y -= 0.2113*fromShape.s;
			} else {
				fromShape.y -= 0.2113*fromShape.s[1];
			}
		}
	} else if (from == "doc") {	
		fromShape = shapeRule.draw[shapeId];
	}
	
	//put the fromShape in the destination
	if (to == "propbar") {
		fromShape = $.extend({}, shapeDefaults, fromShape);
		
		$('#propshape').val(fromShape.shape);
		$('#propx').val(fromShape.x);
		$('#propy').val(fromShape.y);
		if (sizeLocked(fromShape)) {
			$('#propsize').val(fromShape.s);
			$('#sizelock span').removeClass('ui-icon-unlocked').addClass('ui-icon-locked');
			$('#propsize2').val(fromShape.s);
			$('#propsize2').attr('disabled', 'true');
		} else {
			$('#propsize').val(fromShape.s[0]);
			$('#sizelock span').removeClass('ui-icon-locked').addClass('ui-icon-unlocked');
			$('#propsize2').val(fromShape.s[1]);
			$('#propsize2').removeAttr('disabled');
		}
		$('#proprot').val(fromShape.r);
		propRotRedraw(-fromShape.r);
		$('#prophue').val(fromShape.h);
		$('#propbrightness').val(fromShape.b);
		$('#propsat').val(fromShape.sat);
		$('#propz').val(fromShape.z);
	} else if (to == "canvas") {
		fromShape = $.extend({}, shapeDefaults, fromShape);
		$('#shape' + shapeId).replaceWith(canvasShapeHTML(fromShape, shapeId));
		var toCanvas = $('#canvas');
		var toShape = $('#shape' + shapeId);
		
		if (sizeLocked(fromShape)) {
			toShape.css('width', fromShape.s / canvasToDocRatio);
			toShape.css('height', fromShape.s / canvasToDocRatio);
		} else {
			toShape.css('width', fromShape.s[0] / canvasToDocRatio);
			toShape.css('height', fromShape.s[1] / canvasToDocRatio);
		}
		toShape.css('left', (fromShape.x / canvasToDocRatio) + (toCanvas.width()/2) - (toShape.width()/2));
		toShape.css('top', (-fromShape.y / canvasToDocRatio) + (toCanvas.height()/2) - (toShape.height()/2));
		//resizable stops working w/ this for some reason
		//toShape.css('zIndex', fromShape.z);
		
		toHue = fromShape.h/360;
		var toColor = hslToRgb(toHue, fromShape.sat, fromShape.b);
		
		if (fromShape.shape == 'TRIANGLE') {
			realignTriangle(toShape, fromShape);
			
			//Context Free handles triangle positions and sizes differently
			toShape.css('top', parseFloat(toShape.css('top'))-(0.2113*(parseFloat(toShape.css('height'))*canvasToDocRatio)/canvasToDocRatio));
			toShape.children('.triangle-left').css('border-right-color', "rgb(" + Math.round(toColor[0]) + ", " + Math.round(toColor[1]) + ", " + Math.round(toColor[2]) + ")");
			toShape.children('.triangle-right').css('border-left-color', "rgb(" + Math.round(toColor[0]) + ", " + Math.round(toColor[1]) + ", " + Math.round(toColor[2]) + ")");
		} else {
			toShape.css('background-color', "rgb(" + Math.round(toColor[0]) + ", " + Math.round(toColor[1]) + ", " + Math.round(toColor[2]) + ")");
		}
		reconfigureShapes();
	} else if (to == "doc") {
		var toShape = shapeRule.draw[shapeId];
		
		$.extend(toShape, fromShape);
	}
}

//MISC FUNCTIONS//

//call whenever a canvas shape that could be a triangle changes size
function realignTriangle(shape, fromShape) {
	var leftTri = shape.children('.triangle-left');
	var rightTri = shape.children('.triangle-right');

	if (leftTri.length < 0 || rightTri.length < 0) {
		return null;
	}

	if (sizeLocked(fromShape)) {
		leftTri.css('border-right-width', (fromShape.s / 2 / canvasToDocRatio) + 'px');
		rightTri.css('border-left-width', (fromShape.s / 2 / canvasToDocRatio) + 'px');
		leftTri.css('border-top-width', (fromShape.s / canvasToDocRatio) + 'px');
		rightTri.css('border-top-width', (fromShape.s / canvasToDocRatio) + 'px');
		rightTri.css('margin-left', (fromShape.s / 2 / canvasToDocRatio - 1) + 'px');
	} else {
		leftTri.css('border-right-width', (fromShape.s[0] / 2 / canvasToDocRatio) + 'px');
		rightTri.css('border-left-width', (fromShape.s[0] / 2 / canvasToDocRatio) + 'px');
		leftTri.css('border-top-width', (fromShape.s[1] / canvasToDocRatio) + 'px');
		rightTri.css('border-top-width', (fromShape.s[1] / canvasToDocRatio) + 'px');
		rightTri.css('margin-left', (fromShape.s[0] / 2 / canvasToDocRatio - 1) + 'px');
	}
}

//color conversions thanks to http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

function cleanupPropbar() {
	$('#propx').val(parseFloat($('#propx').val()) || 0);
	$('#propy').val(parseFloat($('#propy').val()) || 0);
	$('#propsize').val(parseFloat($('#propsize').val()) || 1);
	if ($('#sizelock span').hasClass('ui-icon-locked')) {
		$('#sizelock span').removeClass('ui-icon-unlocked').addClass('ui-icon-locked');
		$('#propsize2').val($('#propsize').val());
		$('#propsize2').attr('disabled', 'true');
	} else {
		$('#sizelock span').removeClass('ui-icon-locked').addClass('ui-icon-unlocked');
		$('#propsize2').val(parseFloat($('#propsize2').val()) || 1);
		$('#propsize2').removeAttr('disabled');
	}
	$('#proprot').val(parseFloat($('#proprot').val()) || 0);
	propRotRedraw(-parseFloat($('#proprot').val()));
	$('#prophue').val(parseFloat($('#prophue').val()) || 0);
	$('#propbrightness').val(parseFloat($('#propbrightness').val()) || 0);
	$('#propsat').val(parseFloat($('#propsat').val()) || 0);
	$('#propz').val(parseFloat($('#propz').val()) || 0);
}

function selectShape(id) {
	pushShape('propbar', 'doc');
	$('#canvas .shape').each(function() {
		$(this).removeClass('ui-selected');
		$(this).removeClass('ui-selecting');
	});
	if (typeof(id) == 'number') {
		//they selected one
		$('#shape' + id).addClass('ui-selected');
		selectedShapeId = id;
		setPropbarEditable(true);
		pushShape('doc', 'propbar');
	} else if (id == null || id == undefined) {
		//they wish to deselect
		setPropbarEditable(false);
		selectedShapeId = null;
	} else if (typeof(id) == 'object') {
		//they selected multiple
		if (id.length == 0) {
			selectShape(null);
		} else if (id.length == 1) {
			selectShape(id[0]);
		} else {
			setPropbarEditable(false);
			selectedShapeId = id;
			$.each(id, function(id) {
				$('#shape' + this).addClass('ui-selected');
			});
		}
	}
}

function addShape() {
	var newShape = $.extend({}, shapeDefaults);
	selectedRule.draw.push(newShape);
	pushRule('doc', 'canvas');
}

function deleteShape(id) {
	if (id == undefined) {
		id = selectedShapeId;
	}
	
	//make deleting work with arrays of ids
	if (typeof(id) == 'object') {
		for (var i = 0; i < id.length; i++) {
			deleteShape(id[i]);
			for (var x = 0; x < id.length; x++) {
	  		//shift down array items who were moved by the deleting
				if (id[x] > id[i]) {
					id[x]--;
				}
	  	}
		}
	} else {
		selectedRule.draw.splice(id, 1);
		pushRule('doc', 'canvas');
	}
}

function selectRule(name, id) {
	if (name == undefined && id == undefined) {
		name = $('#rulelist li.rule:first-child').data('rulename');
		id = $('#rulelist li.rule:first-child').data('ruleid');
	}
	selectedRule = doc[name][id];
	$('#rulelist li.rule').removeClass('selected');
	$('#rulelist li.rule[rulename=' + name + '][ruleid=' + id + ']').addClass('selected');
	pushRule('doc', 'canvas');
}

function addRule(name, weight) {
	if (doc[name]) {
		id = doc[name].length;
		doc[name].push({weight: weight, draw: [$.extend({}, shapeDefaults)]});
	} else {
		doc[name] = [{weight: weight, draw: [$.extend({}, shapeDefaults)]}];
		id = 0;
	}
	$('#rulelist').append('<li class="rule justcreated" ><a href="#" >' + name + ' ' + weight + '</a></li>');
	$('#rulelist li.rule.justcreated').click(function () {
		selectRule(name, id);
	}).data('ruleid', id).data('rulename', name).removeClass('justcreated');
	selectRule(name, id);
}

function deleteRule(name, id) {
	if (name == undefined && id == undefined) {
		name = $('#rulelist li.rule.selected').data('rulename');
		id = $('#rulelist li.rule.selected').data('ruleid');
	}
	doc[name].splice(id, 1);
	$('#rulelist li.rule[rulename=' + name + '][ruleid=' + id + ']').remove();
	selectRule();
}

function refreshRuleSelector() {
	$('#rulelist').empty();
	$.each(doc, function(name) {
		if (name != 'startshape') {
			$.each(doc[name], function(id) {
				//is there an easier way to find a element just appended?
				$('#rulelist').append('<li class="rule justcreated" ><a href="#" >' + name + ' ' + doc[name][id].weight + '</a></li>');
				$('#rulelist li.rule.justcreated').click(function () {
					selectRule(name, id);
				}).data('ruleid', id).data('rulename', name).removeClass('justcreated');
			});
		}
	});
	selectRule();
}

function setPropbarEditable(value) {
	if (value) {
		$('#propbar').fadeIn('slow');
	} else {
		$('#propbar').fadeOut('slow');
	}
}

function canvasShapeHTML(shape, id) {
	shape = $.extend({}, shapeDefaults, shape);
	
	if (shape.shape == 'SQUARE' || shape.shape == 'CIRCLE') {
		return '<div class="shape ' + shape.shape + '" id="shape' + id + '" ></div>';
	} else if (shape.shape == 'TRIANGLE') {
		return '<div class="shape TRIANGLE" id="shape' + id + '" ><div class="triangle-left" ></div><div class="triangle-right" ></div></div>';
	} else {
		return '<div class="shape rule" id="shape' + id + '" >' + shape.shape + '</div>';
	}
}

//call whenever you add a shape
function reconfigureShapes() {
	$('#canvas').selectable({
		filter: ".shape",
		start: function() {
			toSelectShapeIds = [];
		},
		selected: function(event, ui) {
			toSelectShapeIds.push(parseInt(ui.selected.id.substr(5)));
		},
		stop: function(event, ui) {
			selectShape(toSelectShapeIds);
		}
	});
	$('.shape').draggable({
		distance: 0,
		start: function(event, ui) {
			ui.helper.addClass('ui-selecting');
		},
		stop: function(event, ui) {
			selectShape(parseInt(event.target.id.substr(5)));
			pushShape('canvas', 'doc');
			pushShape('doc', 'propbar');
		}
	});
	$('.shape').resizable({
		start: function(event, ui) {
			ui.helper.addClass('ui-selecting');
		},
		stop: function(event, ui) {
			selectShape(parseInt(event.target.id.substr(5)));
			pushShape('canvas', 'doc');
			pushShape('doc', 'propbar');
		}
	});
}

function sizeLocked(shape) {
	return (shape.s == undefined || shape.s[0] == undefined || shape.s[1] == undefined) || typeof(shape.s) != 'object';
}

//PROPBAR FUNCTIONS//

function toggleSizeLock() {
	if ($('#sizelock span').hasClass('ui-icon-locked')) {
		$('#sizelock span').addClass('ui-icon-unlocked').removeClass('ui-icon-locked');
		$('#propsize2').removeAttr('disabled');
	} else {
		$('#sizelock span').addClass('ui-icon-locked').removeClass('ui-icon-unlocked');
		$('#propsize2').val($('#propsize').val());
		$('#propsize2').attr('disabled', 'true');
	}
}

function propRotStartDrag(event) {
	var canvas = document.getElementById("proprot-draggable");
	canvas.startDragX = event.clientX;
	canvas.startDragY = event.clientY;
	window.onmousemove = function(event) {
		var canvas = document.getElementById("proprot-draggable");
		var angle = Math.atan2(event.clientY-canvas.startDragY, event.clientX-canvas.startDragX);
		propRotRedraw(angle*(180/Math.PI));
		//for some reason the angle is backwards in context free.
		document.getElementById("proprot").value = -Math.round(angle*(180/Math.PI));
	}
	window.onmouseup = function() {window.onmousemove = null; window.onmouseup = null;};
}

function propRotRedraw(angle) {
	var canvas = document.getElementById("proprot-draggable");
	var ctx = canvas.getContext('2d');
	angle *= Math.PI/180;
	
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'black';
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.beginPath();
	ctx.arc(canvas.width/2, canvas.height/2, (canvas.width/2)-1, 0, Math.PI*2, true);
	ctx.fill();
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(canvas.width/2, canvas.height/2);
	ctx.lineTo((Math.cos(angle)*(canvas.width/2))+canvas.width/2, (Math.sin(angle)*(canvas.height/2))+canvas.height/2);
	ctx.stroke();

	ctx.strokeStyle = 'gray';
	ctx.beginPath();
	ctx.moveTo(canvas.width/2, canvas.height/2);
	ctx.lineTo((Math.cos(0)*(canvas.width/2))+canvas.width/2, (Math.sin(0)*(canvas.height/2))+canvas.height/2);
	ctx.stroke();
}

//ONLOAD//

$(function(){
	//load the file
	$.getJSON('php/getfile.php', {file: window.location.hash.substr(1)}, function(json) {
		doc = json;
		refreshRuleSelector();
	});
	
	//make the property bar draggable
	$('#propbar').resizable({
		handles: 'n',
		minHeight: 34
	});

	//hover states on the toolbar and sidebar buttons
	$('.text-button').hover(
		function() { $(this).children("div").addClass('ui-state-hover'); },
		function() { $(this).children("div").removeClass('ui-state-hover'); }
	);

	//hover states on other buttons
	$('.ui-state-default').hover(
		function() { $(this).addClass('ui-state-hover'); },
		function() { $(this).removeClass('ui-state-hover'); }
	);

	//setup dialogs
	$('.dialog').dialog({autoOpen: false, resizable: false});
	
	window.onresize = function() {
		pushRule('doc', 'canvas');
	};
	
	window.onkeydown = function(event) {
		if (event.keyCode == 8) {
			deleteShape();
		}
	}
});