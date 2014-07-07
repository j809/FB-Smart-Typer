var isFB = false;
var dictionary = {};
dictionary.words = [];
var storage = chrome.storage.sync;
var custom_words = [];
var box_id=0;
function getFBtabs(callback) {
	chrome.tabs.query({url: "*://www.facebook.com/*"}, function(tabs) {
			callback(tabs);
	});
}
function sendWordstoFBtabs(tabs) {
	for( var i=0; i<tabs.length ; ++i ) {
		console.log(tabs[i].id);
		if( ~tabs[i].url.indexOf('www.facebook.com') ) {
			chrome.tabs.sendMessage(tabs[i].id, custom_words, function(response) {
				console.log("Updated remote wordlist? " + response.updated);
			});
		}
	}
	console.log(custom_words);
};
function onload_getStorage() {
	dictionary = {};
	dictionary.words = [];
	console.log("On start custom dictionary loaded as: ");
	storage.get( 'words', function(items) {
		console.log(items);
		var words = items.words;
		if ( typeof words != 'undefined' ) {
			dictionary.words = words;
			console.log("Creating array: ");
			dictionary.words.forEach(function(item){
				custom_words.push(item.word);
			});
			console.log("List of words: ");
			console.log(custom_words);
		}
	});
}
function setStorage(value) {
	var word = {};
	
	word.word = value;
		
	dictionary.words.push(word);
	custom_words.push(value);
	
	storage.set( dictionary, function() {
		console.log("BS: Stored received word...");
	});
}
function resetStorage() {
	storage.clear(function() {
		console.log('Stored dictionary reset.');
	});
	dictionary = {};
	dictionary.words = [];
	custom_words = [];
}

onload_getStorage();

var getIndexOfObjInArray = function(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if ( ~tab.url.indexOf('www.facebook.com') ) {
    	isFB=true;
		console.log("Facebook is opened in tab with tabId "+tabId+".");
  }
});
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse) {
	if ( typeof message != 'undefined' ) {
		if( isFB && message.get_custom_dict == "yes" ) {
			console.log("Received custom dictionary fetch request...");
			console.log(custom_words);
			sendResponse(custom_words);
		}
		else if( isFB && message.mutation_observer_loaded == "no" ) {
			chrome.pageAction.hide(sender.tab.id);
			console.error("Failed to start mutation observer...");
			sendResponse({page_action_icon_loaded: "No"});
		}
		else if( isFB && message.mutation_observer_loaded == "yes" ) {
			chrome.pageAction.show(sender.tab.id);	
			console.log("Mutation observer loaded...");
			sendResponse({page_action_icon_loaded: "Yes"});
		}
		else if( isFB && message.DOM_updated == "no" ) {
			chrome.pageAction.hide(sender.tab.id);		
			console.error("Failed to update Facebook DOM!");
			sendResponse({page_action_icon_loaded: "No"});
		}
		else if( isFB && message.DOM_updated == "yes" ) {
			chrome.pageAction.show(sender.tab.id);	
			console.log("Facebook DOM updated...");
			sendResponse({page_action_icon_loaded: "Yes"});
		}
		else if( message.operation == "remove" ) {
			var index = getIndexOfObjInArray(dictionary.words, "word", message.word);
			dictionary.words.splice(index, 1);
			index = custom_words.indexOf(message.word);
			if (index>=0) 
				custom_words.splice(index, 1);
			storage.set( dictionary, function() {
				console.log('Word "' + message.word + '" removed successfully');
			});
			sendResponse({is_word_removed: "Yes"});
		}
		else if( message.operation == "store" && message.word.length >= 2) {
			setStorage(message.word);
			sendResponse({is_word_stored: "Yes"});
		}
		else if (!isFB){
			console.log("Facebook is not opened in any tab(s).");
			sendResponse({page_action_icon_loaded: "No"});
		}
		else {
			console.error("Received message... But source is not known");
		}
	}
	else {
		console.error("Received undefined message!");
	}
	return true;
});
chrome.storage.onChanged.addListener(function(changes, namespace) {
	console.log("Observed a change in local storage...");
	for (key in changes) {
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed.',key,namespace);
		if( key == "words" ) {
			console.log("Dictionary now contains:");
			if( typeof storageChange.newValue != 'undefined' ) {
				storageChange.newValue.forEach(function(item) {
					console.log(item);
				});
			}
			else {
				console.log("Empty");
			}
			console.log("Old:");
			if( typeof storageChange.oldValue != 'undefined' ) {
				storageChange.oldValue.forEach(function(item) {
					console.log(item);
				});
			}
			else {
				console.log("Empty");
			}
			getFBtabs(sendWordstoFBtabs);
		}
		else {
			console.log("Word changed from: ");
			console.log(storageChange.oldValue);
			console.log("to:");
			console.log(storageChange.newValue);
		}
	}
});
chrome.runtime.onInstalled.addListener( function(details){
    if(details.reason == "install") {
        console.log("This is a first install!");
		chrome.tabs.create({url: chrome.extension.getURL('help.html')});
    }
	else if(details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});