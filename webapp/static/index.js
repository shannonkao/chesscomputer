var rootImageURL = "/static/images";
var startPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
var moveString = "";
var moves = [];
var currMove = 0;
var currCell = '';
var turn = 'w';

var eatenPieces = [];
var from;

var numToChar = {
	1 : 'a',
	2 : 'b',
	3 : 'c',
	4 : 'd',
	5 : 'e',
	6 : 'f',
	7 : 'g',
	8 : 'h'
}
var charToNum = {
	'a' : 1,
	'b' : 2,
	'c' : 3,
	'd' : 4,
	'e' : 5,
	'f' : 6,
	'g' : 7,
	'h' : 8
}

var pieces = {};


//e2e4 d2d4 g8f6 g1f3 e7e6 e2e3 f8e7 b1c3 e8g8 f1e2 d7d5 e1g1 b8c6 c1d2 c8d7 f3e5 c6e5 d4e5 f6e4 c3e4 d5e4
colLabels = ["a","b","c","d","e","f","g","h"];
rowLabels = ["8", "7", "6", "5", "4", "3", "2", "1"];

function initPieces(){
	for(var row = 0; row < 8; row++){
		for(var col = 0; col < 8; col++){
			pieces[colLabels[col]+rowLabels[row]] = "0";
		}
	}
};

function switchPlayer() {
	if (turn == 'w') {
		$('#turn').html("BLACK");
		turn = 'b';
	} else {
		$('#turn').html("WHITE");
		turn = 'w'
	}
}

$( document ).ready(function() {
	$("#moves").hide();
	initPieces();
	black = false;
	for(var row = 0; row < 8; row++){
		$("#board table").append("<tr></tr>");
		for(var col = 0; col < 8; col++){
			var c;
			if(black){
				c = "black";
			} else {
				c = "white";
			}
			$("#board table tr:last").append("<td class='"+c+"' id='"+colLabels[col]+rowLabels[row]+"'></td>");
			black = !black;

			if(col == 7){
				black = !black;
			}
		}
	}

	//displayPosition( startPos );
	displayPosition( "r2q2k1/2p1brpp/p1n2n2/1P2p3/4p1b1/1BP5/1P1PQPPP/RNB1K2R w" );
	initOnOffForm();



	function initOnOffForm(){
		var pieceTypes = {
			"white" : [
				{name: "King" ,selector:  "K"},
				{name: "Queen",selector: "Q"},
				{name: "Bishops",selector: "B"},
				{name: "Rooks",selector: "R"},
				{name: "Knights",selector: "N"},
				{name: "Pawns",selector: "P"}
				],
			"black" : [
				{name:"King" ,selector: "k"},
				{name:"Queen" ,selector: "q"},
				{name:"Bishops" ,selector: "b"},
				{name:"Rooks" ,selector: "r"},
				{name:"Knights" ,selector: "n"},
				{name:"Pawns" ,selector: "p"}
				]
		}

		for(var i = 0; i < pieceTypes["white"].length; i++){
			$("#whiteOnOff").append("<p><button class='solo' id='solo_"+pieceTypes["white"][i].selector+"'>s</button><input type='checkbox' checked value='"+pieceTypes["white"][i].selector+"'></input>"+pieceTypes["white"][i].name+"</p>")
		}
		for(var i = 0; i < pieceTypes["black"].length; i++){
			$("#blackOnOff").append("<p><button class='solo' id='solo_"+pieceTypes["black"][i].selector+"'>s</button><input type='checkbox' checked value='"+pieceTypes["black"][i].selector+"'></input>"+pieceTypes["black"][i].name+"</p>")
		}

		$("#showControl input").change(function(){
				event.preventDefault();
				var side = $(this).attr('value');
				// becoming checked
				if($(this).is(":checked")){
					if(side == "white"){
						highlightSquares(getControlledSquares(getWhitePieces()), "whiteControl")
					} else {
						highlightSquares(getControlledSquares(getBlackPieces()), "blackControl");
					}
					// $(".blackControl.whiteControl").css("background","green");

				} else{ // becoming unchecked
					if(side == "white"){
						$("td").removeClass("whiteControl");
					} else{
						$("td").removeClass("blackControl");
					}
				}
		});

		$("#maddenMode").submit(function(){
			event.preventDefault();
			resetDrawing();

		});
		$("#maddenMode input:checkbox").change(function(){
			event.preventDefault();

			$("canvas").toggle();
		});

		$('.solo').click(function(){
			$(".pieceImg").hide();
			var pieceString = $(this).attr('id').split("_")[1];
			// this is only necessary because each pawn has id "P" or "p"
			// duplicate IDs! This is bad! (same issue below in #onOff input)
			for(key in pieces){
				if(pieces[key] == pieceString ){
					$("#"+key + " img").show();
				}
			}

			$("#onOff input").attr('checked', false);
			$("#onOff input[value="+pieceString+"]").prop('checked', true);


			event.preventDefault();
		});

		$("#showAll").click(function(){
			event.preventDefault();
			$("#onOff input").prop('checked', true);
			for(key in pieces){
				$("#"+key + " img").show();
			}
			
		});

		$("#onOff input").change(function(){
			var c = $(this);
			var pieceString = c.attr('value');

			if(c.is(":checked")){
				for(key in pieces){
					if(pieces[key] == pieceString ){
						$("#"+key + " img").show();
					}
				}
			} else {
					for(key in pieces){
						if(pieces[key] == pieceString ){
							$("#"+key + " img").hide();
						}
					}
			}
			event.preventDefault();
		});
	}

	$("#display").click(function() {
		var fenString = $('#f').val();
		displayPosition(fenString);
	});

	$("#start").click(function() {
		if ($('#g').val()) {
			$("#moves").show();
			$("#moveDisplay").empty();
			displayPosition( startPos );
			$('#turn').html("WHITE");
			moveString = $('#g').val();
			moves = moveString.split(" ");
			for (var i=0; i<moves.length; i++) {
				$('#moveDisplay').append("<tr><td>"+moves[i]+"</td></tr>");
			}
			currMove = 0;
			highlightMove(currMove);
			$("#currMove").html(moves[currMove]);
			moveForward(moves[currMove]);
		} else {
			$("#moves").hide();
		}
	});

	$("#prev").click(function() {
		if (currMove>0){
			moveBack(moves[currMove]);
			currMove -= 1;
			highlightMove(currMove);
			$('#currMove').html(moves[currMove]);
			switchPlayer();
		}
	});

	$("#next").click(function() {
		if (currMove<moves.length-1){
			currMove += 1;
			highlightMove(currMove);
			$('#currMove').html(moves[currMove]);
			moveForward(moves[currMove]);
			switchPlayer();
		}
	});
	
	$("#boomerang").click(function() {
		$("#moveDisplay").empty()
		$("#moves").show();
		$("#loading").show();
		$.getJSON( "/boomerang?f=" + getFen(pieces) + "%20" + turn, function( data ) {
			console.log(getFen(pieces));
			console.log(data);
			var boomerangResult = detectBoomerang(data);
			console.log(boomerangResult);
			$.each(data, function( index, element ) {
				
				// if there's a boomerang found for one of the possible
				// moves, highlight the row
				var trTag = "<tr";
				if(boomerangResult.boomerangMoves.indexOf(element.moves[0].move) != -1){
					trTag += " class ='boomerangFound'";
				}
				trTag += ">";

				var bestMove = element.moves[0];
				$('#moveDisplay').append(trTag +"<td class='line'>"+bestMove.move+"</td><td>"+element.searchingDepth+"</td></tr><tr><td><table id='"+bestMove.move+"' class='allMoves'></table></td></tr>");
				$.each(element.moves, function( index, moves ) {
					if (index>0)
						$("#"+bestMove.move).append( "<tr><td>"+moves.move+"</tr></td>" );
				});
			});
			
			$(".allMoves").hide();

			$(".line").click(function() {
				$(".allMoves").hide();
				$(".line").removeClass('selected');
				$( this ).addClass('selected');
				
				var move = $(this).text();
				//moveForward(move);
				$("#board td").css("outline", "none");
				$("#"+move.slice(0,2)).css("outline", "4px solid blue");
				$("#"+move.slice(2,4)).css("outline", "4px solid red");
				$("#"+move).show();
			});
			$(".allMoves td").click(function() {
				$("#board td").css("outline", "none");
				var move = $(this).text();
				$("#"+move.slice(0,2)).css("outline", "4px solid blue");
				$("#"+move.slice(2,4)).css("outline", "4px solid red");
			});
			$("#loading").hide();
		});
	});
	
	$("#switchTurn").click(function() {
		switchPlayer();
	});
	// letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
	for(var i = 0; i < 8; i++){
		$("#colSelect").append("<option value='"+colLabels[i]+"'>"+colLabels[i]+"</option>");
		$("#rowSelect").append("<option value='"+i+"'>"+(i+1)+"</option>");
	}

	$("#highlight").submit(function(){
		$("#board td").css("outline", "none");

		col = colLabels.indexOf($("#colSelect").val());
		row = rowLabels[$("#rowSelect").val()];
		//console.log(col+"_"+row);
		$("#"+col+row).css("outline", "4px solid red");
		$("#clear-highlight").show();
		return false;
	});

	$("#clear-highlight").click(function(){
		$("#board td").css("outline", "none");
		$(this).hide();
		return false;
	});
	
	$(".pieceImg").draggable({
		revert: true,
		revertDuration:0,
		appendTo: 'body',
		stack: '.pieceImg',
		start: dragStart,
		start: dragStart,
		stop: dragStop
	});
	
	//console.log(getFen(pieces));
	
});

function highlightMove( move ) {
	$("#moveDisplay").find('tr').css({'background':'none'});
	var move = $("#moveDisplay").find('tr').eq( move );
	move.css({'background':'yellow'});
}

function dragStart( event, ui ) {
	from = ui.helper.parent().attr('id');
	ui.helper.css({'z-index': 100});
}
		
function dragStop( event, ui ) {
	var cInc = Math.round(ui.position.left/65);
	var rInc = Math.round(ui.position.top/65);
	var toCol = charToNum[from[0]] + cInc;
	var toRow = parseInt(from[1]) - rInc;
	
	var to = numToChar[toCol]+toRow.toString();
	
	if ( $("#"+to).length <= 0 ) {
		eatenPieces.push($("#"+from).children(0).attr('id'));
		$("#"+from).html('');
		pieces[from] = "0";
		updateScore();
	} else if (from != to) {
		var piece = ui.helper.attr('id');
		if ((piece == piece.toUpperCase() && turn=='w')||(piece != piece.toUpperCase() && turn=='b')) {	
			switchPlayer();
		}
		
		move = from+to;
		moveForward(move);
		
		$("#currMove").html(move);
		
		recalculateControl();
	}
	
	ui.helper.css({'z-index': 2});
}

function recalculateControl() {
	$("#showControl input").each( function() {
		if($( this ).is(":checked")){
			var side = $( this ).attr('value');
			if(side == "white"){
				$("td").removeClass("whiteControl");
				highlightSquares(getControlledSquares(getWhitePieces()), "whiteControl")
			} else {
				$("td").removeClass("blackControl");
				highlightSquares(getControlledSquares(getBlackPieces()), "blackControl");
			}
		}
		});
}

function eatenDragStop( event, ui ) {
	var cellSize = $("#board td").height();
	var row = Math.round( (ui.offset.top-$("#board").position().top)/cellSize - 0.5 );
	var col = Math.round( (ui.offset.left-$("#board").position().left)/cellSize - 0.5 );
	if ( row<8 && col<8) {
		var cell = numToChar[col+1]+(8-row);
		ui.helper.removeClass('eaten').addClass('pieceImg');
		$("#"+cell).append(ui.helper);
		
		pieces[cell] = ui.helper.attr('id');
		eatenPieces.splice(eatenPieces.indexOf(ui.helper.attr('id')), 1);
		
		recalculateControl();
		
		$(".pieceImg").draggable({
			revert: true,
			revertDuration:0,
			appendTo: 'body',
			stack: '.pieceImg',
			start: dragStart,
			start: dragStart,
			stop: dragStop
		});
    }
}

function updateScore(){
	var score = calculateScore(pieces);
	$("#blackScore").html(score.black);
	$("#whiteScore").html(score.white);
	
	$("#whiteEaten").empty();
	$("#blackEaten").empty();

	for(var i = 0; i < eatenPieces.length; i++){
		var pName = eatenPieces[i];
		if(pName == pName.toLowerCase()){
			var color = 'white';
			var pCol = 'black';
		} else{
			var color = 'black';
			var pCol = 'white';
		}
		var img = "<img id='"+eatenPieces[i]+"' class='eaten' src='/static/images/"+pCol+"/"+eatenPieces[i]+".png'>";
		$("#"+color+"Eaten").append(img);
	}
	
	$(".eaten").draggable({
		revert: true,
		revertDuration:0,
		appendTo: 'body',
		stack: '.pieceImg',
		stop: eatenDragStop
	});
	
}
		
function moveForward(move){
	$("#board td").css("outline", "none");
	from = move.charAt(0)+move.charAt(1);		
	to = move.charAt(2)+move.charAt(3);

	if ($("#"+to).html()!='')
		eatenPieces.push($("#"+to).children(0).attr('id'));

	piece = $("#"+from).html();
	$("#"+from).html('').css("outline", "4px solid blue");
	$("#"+to).html(piece).css("outline", "4px solid red");
	
	var pcId = $("#"+to).children(0).attr('id');
	pieces[from] = "0";
	pieces[to] = pcId;

	updateScore();

	
	$(".pieceImg").draggable({
		revert: true,
		revertDuration:0,
		appendTo: 'body',
		stack: '.pieceImg',
		start: dragStart,
		stop: dragStop
	});

}

// Not used & replacing eaten pieces no longer works
/*function moveBack(move){
	$("#board td").css("outline", "none");
	from = move.charAt(0)+move.charAt(1);
	to = move.charAt(2)+move.charAt(3);


	piece = $("#"+to).html();
	if (eatenPieces.length>0 && currMove == eatenPieces[eatenPieces.length-1][0])
		$("#"+to).html(eatenPieces.pop()[1]);
	else
		$("#"+to).html('');
	$("#"+from).html(piece);

	var pcId = $("#"+to).children(0).attr('id');
	pieces[from] = "0";
	pieces[to] = pcId;
	
	prevMove = moves[currMove-1];
	prevFrom = numToChar[prevMove.charAt(0)]+"_"+(8-parseInt(prevMove.charAt(1)));
	prevTo = numToChar[prevMove.charAt(2)]+"_"+(8-parseInt(prevMove.charAt(3)));
	$("#"+prevTo).css("outline", "4px solid red");
	$("#"+prevFrom).css("outline", "4px solid blue");
		
	$(".pieceImg").draggable({
		revert: true,
		revertDuration:0,
		appendTo: 'body',
		stack: '.pieceImg',
		start: dragStart,
		stop: dragStop
	});
}*/
		
function displayPosition( fen_position ){
	initPieces();
	$(".pieceImg").hide();
	parts = fen_position.split(" ");
	//updateTurn(parts[1]);

	rows = parts[0].split("/");

	for(var row = 0; row < rows.length; row++){
		if(rows[row] == "8"){ // empty row
			continue;
		} else {
			chars = rows[row].split("");
			// if(cols.length != 8){
			// 	logError("row " + (row+1) + " is the wrong length: " + cols.length);
			// }

			var colNum = 0;
			for(var c = 0; c < chars.length; c++){
				if(chars[c].match(/\d/)){
					numSkips = parseInt(chars[c]);
					colNum += numSkips;
				} else {
					cellId = colLabels[colNum] + rowLabels[row];
					var pieceColor = "black";
					if(chars[c] == chars[c].toUpperCase()){
						pieceColor = "white";
					}

					imageURL = rootImageURL + "/" + pieceColor + "/" + chars[c] + ".png";
					$("#" + cellId).html("<img id='"+chars[c]+"' class='pieceImg' src='" + imageURL + "'/>");

					pieces[cellId] = chars[c];
					colNum++;
				}
			}
		}
	}
}

function getFen( boardArray ) {
	var fen = "";
	for(var j=8; j>0; j--){ // cols
		var empty = 0;
		for(var i=1; i<9; i++){ // rows
			var cell = numToChar[i]+j.toString();
			if(boardArray[cell]!="0"){
				if (empty!=0) {
					fen+=empty;
					empty = 0;
				}
				fen+=boardArray[cell];
			} else {
				empty++;
			}
		}
		if (empty!=0) {
			fen+=empty;
			empty = 0;
		}
		if (j>0)
			fen += "/"
	}
	return fen;
}