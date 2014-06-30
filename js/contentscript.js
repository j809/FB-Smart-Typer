var wordsetcount = 0;
var custom_words = [];
chrome.extension.onMessage.addListener( function( message, sender, sendResponse ) {
	words.splice(0,92642);
	if( message.length > 0 ) {
		custom_words = message;
		words = words.concat(custom_words);
	}
	else {
		custom_words = [];
	}
	console.log(custom_words);
	sendResponse({updated: "Yes"});
});
function getCustomDict() {
	console.log("Fetching custom dictionary...");
	chrome.runtime.sendMessage({get_custom_dict: "yes"}, function(response) {
		if( response.length > 0 )
			custom_words = response;	
		else
			custom_words = [];
		console.log("Fetched custom dictionary successfully...\nIts content is:");
		console.log(custom_words);
		console.log("Merging with main dictionary...");
		words = words.concat(custom_words);
	});
}
function split( val ) {
	return val.split( / \s*/ );
}
function extractLast(term) {
	return split( term ).pop();
}
function addGlobalStyleTag() {
	var style = $(document).find('body');
	$(style).prepend('<style id="myListStyle">.ui-menu{width:253px;display:table;height:30px;margin-top:1px;border:1px solid #bdc7d8;-webkit-box-shadow: 0 1px 1px rgba(0,0,0,0.3);font:inherit;}.ui-menu .ui-menu{width:253px;display:table;}.ui-menu .ui-menu-item {margin:1px;min-width:82px;text-align:center;display:table-cell;}.ui-menu .ui-menu-item a { display: block;width:100%;height:20px;text-align:center;}.ui-corner-all,.ui-corner-top,.ui-corner-left,.ui-corner-tl {border-top-left-radius: 0px;}.ui-corner-all,.ui-corner-top,.ui-corner-right,.ui-corner-tr {border-top-right-radius: 0px;}.ui-corner-all,.ui-corner-bottom,.ui-corner-left,.ui-corner-bl {border-bottom-left-radius: 0px;}.ui-corner-all,.ui-corner-bottom,.ui-corner-right,.ui-corner-br {border-bottom-right-radius: 0px;}.boxMargin{margin-top:1px;}.menuItemBox{background-color:white;height:30px;width:258px;border:1px solid #bdc7d8;-webkit-box-shadow: 0 1px 1px rgba(0,0,0,0.3);color:#bdc7d8;text-align:center;vertical-align:middle;display:table-cell;}.addWord{background-color:white;height:30px;width:258px;border:1px solid #bdc7d8;-webkit-box-shadow: 0 1px 1px rgba(0,0,0,0.3);}.addWordtext{cursor:pointer;color:#fc0;text-align:center;display:table-cell;vertical-align:middle;height:30px;width:258px;background-color:#fffcb5;-webkit-animation-name: blinker;-webkit-animation-duration: 1.5s;-webkit-animation-timing-function: linear;-webkit-animation-iteration-count: 3;}@-webkit-keyframes blinker{0%{opacity:1.0;}50%{opacity:0.2;}100%{opacity:1.0;}}.myhighlight{background:rgba(255,255,255,0);border-bottom:1px solid black;color:#4a7dff}</style>');
}
function updateBoxid(id) {
	console.log("Updating list ID for myBox-"+id);
	$("[id^=ui-id-]").attr('id','myBoxList-'+id);
	console.log("Updated list ID successfully!");
}
function removeSuggestionsList(id) {
	console.log("Removing list for myBoxList-"+id);
	$('#myBoxList-'+id).remove();
	console.log("Removed list successfully!");
}
function highlightText(text, $node) {
	var searchText = $.trim(text).toLowerCase(), currentNode = $node.get(0).firstChild, matchIndex, newTextNode, newSpanNode;
	if(currentNode != null) {
		while ((matchIndex = currentNode.data.toLowerCase().indexOf(searchText)) >= 0) {
			newTextNode = currentNode.splitText(matchIndex);
			currentNode = newTextNode.splitText(searchText.length);
			newSpanNode = document.createElement("span");
			newSpanNode.className = "myhighlight";
			currentNode.parentNode.insertBefore(newSpanNode, currentNode);
			newSpanNode.appendChild(newTextNode);
		}
	}
}
function appendEllipses(word) {
	if(wordsetcount > 1)
		if(word.length > 12)
			return word.substring(0,9)+"."+"."+".";
		else
			return word;
	else	
		return word;
}
function customItemrenderer(ul, item) {
	var $a = $("<a></a>").text(appendEllipses(item.label));
	highlightText(extractLast(this.term), $a);
	
	return $("<li></li>").append($a).appendTo(ul);
}
function addsuggestionBox(parent,idno) {
	console.log(custom_words);
	var container = $(parent).find(".fbNubFlyout.fbDockChatTabFlyout.uiContextualLayerParent");
	
	var menuparent = $(container).find('.fbNubFlyoutOuter');
	
	$(container).css('-webkit-transform','translateY(-30px)');
	
	$('<div class="boxMargin"><div class="menuItemBox">Nothing to suggest</div></div>').appendTo($(container));
	var boxStatus = $(container).find(".menuItemBox");
	$('<div class="addWord"><div class="addWordtext">Click here to add this word<div></div>').insertAfter(boxStatus);	
	var addBox = $(container).find(".addWord");
	addBox.css('-webkit-transform','translateY(-32px)');	
	$(addBox).click(function(){
		words = words.concat(extractLast($(mybox).val()));
		chrome.runtime.sendMessage({ operation : "store", word : extractLast($(mybox).val()) }, function(response) {
		  console.log("Stored word to local storage? " + response.is_word_stored);
		});
		$(addBox).hide();
	});
	$(addBox).hide();
	
	var holder = $(parent).find(".fbNubFlyoutFooter").find("._552h");
	$(holder).css("overflow","hidden");

	var mybox = $(holder).children('textarea');
	
	if(typeof mybox != 'undefined')  
	{
		var myboxcover = $(mybox).clone();
		$(myboxcover).attr('id','myboxcover-'+idno);
		$(myboxcover).attr('disabled','disabled');
		$(myboxcover).css({
			"position":"absolute",
			"top":"7px",
			"left":"5px",
			"min-height":"16px",
			"max-width":"203px",
			"background":"white",
			"color":"#bdc7d8",
			"z-index":"0",
		});
		$(myboxcover).insertAfter($(mybox));
		
		$(mybox).css({
			"position":"relative",
			"background":"transparent",
			"z-index":"11"
		});
		
		var lastHeight = $(mybox).css('height');
		$(mybox).on('input',function() {
			if ($(mybox).css('height') != lastHeight) {
				console.log("Height changed");
				$(myboxcover).css('height',$(mybox).css('height'));
				lastHeight = $(mybox).css('height');
			}
		});
		
		console.log("Loading autocomplete...");
		
		var setOriginalListSource,results,wordforTABevent,first_time=true,word_counter=0,active_word=1;
		
		$( mybox ).bind( "keydown", function( event ) {
			if ( event.keyCode == $.ui.keyCode.TAB ) {
				var focused = $(parent).siblings(".focusedTab");
				if( typeof $(focused).attr('id') != 'undefined' && $(focused).attr('id') != $(parent).attr('id') ) {
					var terms = split( $( mybox ).val() );
					terms.pop();
					terms.push( wordforTABevent );
					terms.push( "" );
					$( mybox ).val(terms.join( " " )).focus();
					$( mybox ).val( $(mybox).val().substring(0,$(mybox).val().length-1) );
					$( mybox ).val( $(mybox).val() + " " );
				}
				word_counter=0;
				active_word=1;
				first_time=true;
				event.preventDefault();
			}
			else if( event.keyCode == $.ui.keyCode.DOWN && $(this).data("ui-autocomplete").menu.active && word_counter < results.length && active_word <= wordsetcount+1 ) {
				active_word = active_word+1;
				if(first_time == false && active_word == wordsetcount+1 ) {
					//console.log("Forward");
					if( typeof results[word_counter+5] != 'undefined' ) {
						$(mybox).autocomplete("option","source",[results[word_counter+3],results[word_counter+4],results[word_counter+5]]);
						word_counter = word_counter+3;
					}
					else if( typeof results[word_counter+4] != 'undefined' ) {
						$(mybox).autocomplete("option","source",[results[word_counter+3],results[word_counter+4]]);
						word_counter = word_counter+2;
					}
					else if( typeof results[word_counter+3] != 'undefined' ){
						$(mybox).autocomplete("option","source",[results[word_counter+3]]);
						word_counter = word_counter+1;
					}
					//console.log((word_counter+3)+" "+(word_counter+4)+" "+(word_counter+5));
					$(mybox).autocomplete("search",extractLast($(mybox).val()));
					//console.log("New word count: "+word_counter);
					active_word = 1;
				}
				//console.log(active_word);
			}
			else if( event.keyCode == $.ui.keyCode.UP && $(this).data("ui-autocomplete").menu.active && word_counter > 0 && active_word >= 1 ) {
				active_word = active_word-1;
				if(first_time == false && active_word == 0) {
					//console.log("Back");
					if( typeof results[word_counter-3] != 'undefined' ) {
						$(mybox).autocomplete("option","source",[results[word_counter-3],results[word_counter-2],results[word_counter-1]]);
						word_counter = word_counter-3;
					}
					//console.log((word_counter-3)+" "+(word_counter-2)+" "+(word_counter-1));
					$(mybox).autocomplete("search",extractLast($(mybox).val()));
					//console.log("New word count: "+word_counter);
					active_word = 3;
				}
				//console.log(active_word);				
			}
			else if( active_word < 1)
				active_word = 1;
			else if( event.keyCode == ( $.ui.keyCode.SPACE || $.ui.keyCode.ENTER || $.ui.keyCode.NUMPAD_ENTER ) ) {
				$(mybox).autocomplete("close");
			}
		}).autocomplete({
			minLength: 0,
			delay: 0,
			source: setOriginalListSource = function ( request, response ) {
						var lastword = extractLast(request.term);
						var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( lastword ), "i" );
						results = $.grep(words ,function( item ){
							 return matcher.test( item );
						});
						
						results = results.sort( function(a, b) {
							if (a.toLowerCase() < b.toLowerCase()) return -1;
							if (a.toLowerCase() > b.toLowerCase()) return 1;
							return 0;
						});
						
						first_time = false;
						var wordset = results.slice(0,3);
						wordsetcount = wordset.length;
						
						$(addBox).toggle($.inArray(request.term, results) < 0);
						
						response(wordset);
					},
			search: function() {
						//console.log("Search fired");
						var term = extractLast( this.value );
						if ( term.length < 2 ) {				
							$( mybox ).autocomplete("close");
							$(addBox).hide();							
							return false;
						}
					},
			focus:  function( event,ui ) {
						if ( typeof results[word_counter+active_word-1] != 'undefined' ) {
							var value = results[word_counter+active_word-1];
							var boxval = $(mybox).val();			
							var lastspaceIndex = boxval.lastIndexOf(' ');
							//console.log(boxval.length - lastspaceIndex);
							$(myboxcover).val(boxval + value.substring(boxval.length - lastspaceIndex - 1, value.length));
						}
						return false;
					},
			select: function( event, ui ) {
						var terms = split( this.value );
						terms.pop();
						terms.push( ui.item.value );
						terms.push( "" );
						this.value = terms.join( " " );
						return false;
					},
			open:	function() {
					    var firstvalue = results[word_counter];
						var boxval = $(mybox).val();			
						var lastspaceIndex = boxval.lastIndexOf(' ');
					    $(myboxcover).val(boxval + firstvalue.substring(boxval.length - lastspaceIndex - 1, firstvalue.length));
						$(this).autocomplete("widget").insertAfter($(menuparent)).css("position","static");
					},
			close:  function() {
						wordforTABevent = results[word_counter+active_word-1];
						first_time = true;
						active_word = 1;
						word_counter = 0;						
						$(myboxcover).val('');
						if(wordsetcount!=0)
							$(addBox).hide();
						$(this).autocomplete("option","source",setOriginalListSource);
					}
			}).data("ui-autocomplete")._renderItem = customItemrenderer;
		console.log("Autocomplete loaded...");
		chrome.runtime.sendMessage({DOM_updated: "yes"}, function(response) {
		  console.log("Page action icon loaded? "+response.page_action_icon_loaded);
		});
		updateBoxid(idno);
	}
	else {
		console.error("Autocomplete failed!");
		chrome.runtime.sendMessage({DOM_updated: "no"}, function(response) {
		  console.log("Page action icon loaded? "+response.page_action_icon_loaded);
		});
	}
}
console.log(custom_words);