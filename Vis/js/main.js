
/* selectected activities fro time spent */
var selectedActivitiesTs = [];

var keyword_li = document.getElementById("keyword_li");
var query_li = document.getElementById("query_li");
var file_li =document.getElementById("file_li");

window.onload = init_index_html;

keyword_li.addEventListener("click" , function(){
	keyword_li.setAttribute("class" , "active");
	query_li.classList.remove("active");
	file_li.classList.remove("active")

	document.getElementById("div-dropdown-keyword").
		setAttribute("style" ,"display:block");
	document.getElementById("div-dropdown-query").
		setAttribute("style" ,"display:none");
    document.getElementById("div-dropdown-file").
    setAttribute("style" ,"display:none");
});


query_li.addEventListener("click" , function(){
    query_li.setAttribute("class" , "active");
    keyword_li.classList.remove("active");
    file_li.classList.remove("active")

    document.getElementById("div-dropdown-keyword").setAttribute("style" ,"display:none");
    document.getElementById("div-dropdown-query").setAttribute("style" ,"display:block");
    document.getElementById("div-dropdown-file").setAttribute("style" ,"display:none");
});


file_li.addEventListener("click" , function(){
    file_li.setAttribute("class" , "active");
    keyword_li.classList.remove("active");
    query_li.classList.remove("active")

    document.getElementById("div-dropdown-keyword").setAttribute("style" ,"display:none");
    document.getElementById("div-dropdown-query").setAttribute("style" ,"display:none");
    document.getElementById("div-dropdown-file").setAttribute("style" ,"display:block");
});


function add_activity_ts(name)
{
	var colDiv = '<div style="white-space:nowrap;overflow:hidden" class="col-md-9">' + name + '</div>';
	var check = '<div class="col-md-1"><input type="checkbox" checked></div>';
	var bin = '<div class="col-md-1"><span class="fa fa-trash"></span></div>';
	
	var div = '<div class="row selected_activities_list_ts">' + colDiv + check + bin + '</div>';
	$("#div-dropdown-ts").prepend(div);
	
	var lastActivities = $("#div-dropdown-ts").children()[0];
	selectedActivitiesTs.push( lastActivities );
	
	// click on trash
	lastActivities.children[2].children[0].addEventListener("click" , function(event){
		var element = $(event.target); // cast to jquery
		
		for( var i=0 ; i < selectedActivitiesTs.length ; i++ )
			if( element.parent().parent().children()[0].innerHTML == selectedActivitiesTs[i].children[0].innerHTML )
				selectedActivitiesTs.splice(i,1);
			
		element.parent().parent().remove();
	});
	
	// click on checkbox
	lastActivities.children[1].children[0].addEventListener("click" , function(event){
		console.log( get_checked_activities() );
	});	
}


function hasNodeLabel(){
    return $('#show_node_label')[0].checked
}

function hasEdgeLabel(){
    return $('#show_link_label')[0].checked
}

/** Get the click action.
 * return: retrun "neigbors" if  "show neighbors is checked", else return "relative"***/
function getClickAction(){
    return    document.querySelector('input[name="click_action"]:checked').value;
}

function getIndicator(){
    return    document.querySelector('input[name="show_indicator"]:checked').value;
}

function getNodeNumber(){
    return document.getElementById("nodeNumber").value
}


function getFilePath(){
    return document.getElementById("input_file_path").value
}


/* returns all the checked activities among the selected activities */
function get_checked_activities () {
  var checked_activities = []
  for (var i = 0; i < selectedActivitiesTs.length; i++) {
    if (selectedActivitiesTs[i].children[1].children[0].checked) { checked_activities.push(selectedActivitiesTs[i].children[0].innerText) }
  }

  return checked_activities
}

/* creates a pop-up div to zoom on a element */
function zoom_on_element (id) {

}

/* create the activities list for time spent */
function create_list_activities_ts () {
  var dropdownListTs = d3.select('#dropdown-list-ts')
  for (let i = 0; i < activities.length; ++i) {
    dropdownListTs.append('li')
      .append('a')
      .property('href', '#')
      .property('id', i + ' ts')
      .on('click', on_itemClicked_list_activities_ts)
      .text(activities[i])
  }
}

function on_itemClicked_list_activities_ts () {
  let id = d3.select(this).attr('id')
  id = id.split(' ')
  let activity = activities[id[0]]

  add_activity_to_selected_activities(activity)
}

function add_activity_to_selected_activities (activity) {
  var selectLen = selectedActivitiesTs.length

  var isInSelectedActivities = false
  for (var i = 0; i < selectLen; i++) {
    if (activity == selectedActivitiesTs[i].children[0].innerText) {
      isInSelectedActivities = true
      break
    }
  }

  if (!isInSelectedActivities) { add_activity_ts(activity) }
}

/* create the activities list for participation time */
function create_list_activities_pt () {
  var dropdownListPt = d3.select('#dropdown-list-pt')
  for (let i = 0; i < activities.length; ++i) {
    dropdownListPt.append('li')
      .append('a')
      .property('href', '#')
      .property('id', i + ' pt')
      .on('click', on_itemClicked_list_activities_pt)
      .text(activities[i])
  }
}

function on_itemClicked_list_activities_pt () {
  let id = d3.select(this).attr('id')
  id = id.split(' ')
  let activity = activities[id[0]]

  var button = document.getElementById('button_activity_pt')
  var divActivity = '<div style="overflow:hidden" class="col-md-9">' + activity + '</div>'
  var divCaret = '<div class="col-md-3"></span><span class="caret"></span></div>'

  button.innerHTML = '<div class="row">' + divActivity + divCaret + '</div>'

  /* graph participation time / participation rate */

  plotGraphActivity(activity)
  createMap(activity)
}

function init_index_html () {

  document.getElementById('div-dropdown-keyword')
    .setAttribute('style', 'display:none')

    document.getElementById('div-dropdown-query')
        .setAttribute('style', 'display:none')

  var button = document.getElementById('button_activity_pt')

  // var divActivity = '<div style="overflow:hidden" class="col-md-9">' + activity + '</div>'
  // var divCaret = '<div class="col-md-3"></span><span class="caret"></span></div>'
  //
  // button.innerHTML = '<div class="row">' + divActivity + divCaret + '</div>'
}
