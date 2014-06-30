var suggestionBoxparent,myBoxidno = 0, trials = 0;
function boxMutation_init() {
	var suggestionBoxparent = document.querySelector('.fbNubGroup');
	if( (typeof suggestionBoxparent != 'undefined') && suggestionBoxparent != null) {
		var holder = suggestionBoxparent.querySelector('.fbNubGroup');
		//console.log("Suggestion box selected as :" + holder.getAttribute('id'));
		 
		var existingBoxes = holder.childNodes;
		if(existingBoxes.length > 0)
		{
			console.log("Found existing chatboxes, adding suggestion boxes to those...");
			for( var i=0; i < existingBoxes.length; ++i)
			{
				myBoxidno=myBoxidno+1;				
				existingBoxes[i].setAttribute('id','mybox-' + myBoxidno);
				addsuggestionBox(existingBoxes[i],myBoxidno);
			}
		}
		
		var suggestionBoxobserver = new MutationObserver(function(mutations) {
			console.log("Observed suggestion box mutations...");
			mutations.forEach(function(mutation) {
				//console.log(mutation.type);
				if(mutation.addedNodes.length > 0 )
				{
					console.log("Node added. ");
					//console.log(mutation.addedNodes);
					myBoxidno=myBoxidno+1;				
					mutation.addedNodes[0].setAttribute('id','mybox-' + myBoxidno);
					addsuggestionBox(mutation.addedNodes[0],myBoxidno);
				}
				else if(mutation.removedNodes.length > 0)
				{
					console.log("Node removed. ");
					//console.log(mutation.removedNodes);
					removeSuggestionsList(mutation.removedNodes[0].getAttribute('id').substr('mybox-'.length));
				}
		  });    
		});

		var boxconfig = { attributes: false, childList: true, characterData: false};
		
		console.log("Initiating suggestion box mutation observer...");
		suggestionBoxobserver.observe(holder, boxconfig);
		
		chrome.runtime.sendMessage({mutation_observer_loaded: "yes"}, function(response) {
			console.log("Page action icon loaded? "+response.page_action_icon_loaded);
		});
	}
	else if(trials < 3) {
		trials = trials + 1;
		console.warn("Cannot find suggestionBoxparent.\nReloading suggestion box mutation observer (Trial no. " + trials + " )...");
		boxMutation_init();
	}
	else {
		console.error("Failed to load suggestion box mutation observer after 3 trials");
		chrome.runtime.sendMessage({mutation_observer_loaded: "no"}, function(response) {
			console.error("Page action icon loaded? "+response.page_action_icon_loaded);
		});
	}
}
$(document).ready(function() {
	addGlobalStyleTag();
	getCustomDict();
	console.log(custom_words);
	boxMutation_init();
});