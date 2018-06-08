
/* An array containing the keywords to search for */
var keywords;

/* the graph in which we want to search */
var graphe;

/* the seleceted visualisation */
var visualisation;

/* the input for the keywords */
var rdf_search_input = document.getElementById("rdf-search-input");
rdf_search_input.addEventListener("keypress" , lauchSearchOnkeypress );

var rdf_search_button = document.getElementById("rdf-search-button");
rdf_search_button.addEventListener("click" , launchSearchClick );

function lauchSearchOnkeypress(event)
{
	if( event.keyCode == 13 )
		launchSearch();
}
function launchSearchClick(){ launchSearch(); }

/* the function that is called when the user press enter or the search button */
function launchSearch()
{
	keywords = retrieveKeywords();
	console.log( keywords );
}

/* retrieves all keywords from the input tag and returns the array */
function retrieveKeywords()
{
	var container = new Array();
	var keywords = rdf_search_input.value;
	var containerTmp = keywords.split(" ");
	
	var length = containerTmp.length;
	for( var i=0 ; i < length  ; i++ )
	{
		if( containerTmp[i] != "" )
			container.push( containerTmp[i] );
	}
	
	return container;
}