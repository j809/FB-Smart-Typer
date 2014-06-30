var box_id=0,user_words=[];
$(".message").css("visibility","visible").hide();
var getBackgroundPage = chrome.extension.getBackgroundPage;
function addStoredwordHTML(word) {
	++box_id;
	$(".message").text('Word "' + word + '" saved successfully');
	$('<tr class="box-button-grp"><td><div class="word-boxes" id="word-' + box_id + '">' + word + '</div></td><td><button class="buttons remove" id="but-' + box_id +'">x</button></td></tr>').insertAfter($("#new-word").parent().parent()).hide().fadeIn(500);
}
function removeRemovedwordHTML(wordparent) {
	$(wordparent).remove();
}
function onpageload_getSyncStorage() {
	var words = getBackgroundPage().custom_words;
	words.forEach( function(word){
		addStoredwordHTML(word);
		user_words.push(word);
	});
	console.log(user_words);
}
var getIndexOfObjInArray = function(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}
$("#save").click(function() {
	$(".message").hide();
	var new_word = $("#new-word").text();
	if( new_word.length >= 2 && new_word.indexOf(' ') < 0 && user_words.indexOf(new_word) < 0 ) {
		$("#new-word").text("");
		chrome.runtime.sendMessage({ operation: "store", word :new_word }, function(response) {
		  console.log("Stored word to local storage? " + response.is_word_stored);
		});
		addStoredwordHTML(new_word);
		$(".message").text('Word "' + new_word + '" added successfully');
		$(".message").fadeIn(800);
		setTimeout(function() {
			$(".message").fadeOut(1000);
		},2000);
	}
	else {
		console.log(new_word.indexOf(' '));
		if(new_word.length < 2)
			$(".message").text("Word must have atleast 2 letters");
		else if(new_word.indexOf(' ') >= 0)
			$(".message").text("Word must not have a space");
		else
			$(".message").text('Word "' + new_word + '" is already stored');
		$(".message").css("background-color","#FFB5B5");
		$(".message").css("visibility","visible").hide();
		$(".message").show()
		setTimeout(function(callback) {
			$(".message").fadeOut(500,function(){
				$(".message").css("background-color","rgb(252, 255, 181)");
			});
		},2000);
	}
});
$("#reset").click(function() {
	getBackgroundPage().resetStorage();
	$("div[id^=word]").each(function(){
		var wordparent = $(this).parent().parent();
		removeRemovedwordHTML(wordparent);
	});
	$(".message").text("Dictionary reset successfully");
	$(".message").fadeIn(800);
		setTimeout(function() {
			$(".message").fadeOut(1000);
	},2000);
});
$(".custom-dict-words").on("click",".remove",function(){
	var word = $(this).parent().parent().find('div').text();
	var index = $.inArray(word, user_words);
	if (index>=0) 
		user_words.splice(index, 1);
	chrome.runtime.sendMessage({ operation :"remove", word :word }, function(response) {
		  console.log("Removed word from local storage? " + response.is_word_removed);
	});
	$(this).parent().parent().remove();
	$(".message").text('Word "' + word + '" removed successfully');
	$(".message").fadeIn(800);
		setTimeout(function() {
			$(".message").fadeOut(1000);
	},2000);
});
onpageload_getSyncStorage();