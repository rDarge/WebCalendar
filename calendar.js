/**
 * Ryan Darge
 * Calendar/Event Planner
 * 2013
 **/

 var month_events = 0;
 var editingEvent = -1;
 var today = 0;

 var event_Descriptions = new Array();
 var event_StartTimes = new Array();
 var event_EndTimes = new Array();

function twoDigits(input)
{
	return (input <= 9) ? "0" + input : input;
}

function convertDateToForm(date)
{
	return date.getFullYear()+"-"+twoDigits(date.getMonth()+1)+"-"+twoDigits(date.getDate())+
			"T"+twoDigits(date.getHours())+":"+twoDigits(date.getMinutes())+":00";
}

function convertFormToDate(date)
{
	return new Date(date.replace("T", " "));
}

function loadXML(filename){                
    xmlhttp = 0;
    //Update the XML File
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET",filename,false);
    xmlhttp.send();
    return xmlhttp.responseXML; 
}

function editEvent(e, event_index){
	//Get event information
	description = event_Descriptions[event_index];
	start = new Date(event_StartTimes[event_index]);
	end = new Date(event_EndTimes[event_index]);

	$("#description").val(description);
	$("#startTime").val(convertDateToForm(start));
	$("#endTime").val(convertDateToForm(end));
	editingEvent = event_index;

	if (!e) var event = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();

}


function newEvent(e, date){

	if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();

	//Get event information
	description = "New Event";
	startingTime = new Date();
	startingTime.setDate(date);
	startingTime.setHours(11);
	startingTime.setMinutes(0);
	endingTime = new Date(startingTime.setHours(startingTime.getHours()*1+1));

	$("#description").val(description);
	$("#startTime").val(convertDateToForm(startingTime));
	$("#endTime").val(convertDateToForm(endingTime));
	editingEvent = e;
}


function eventEditorApply()
{

	//Get event details
	description = $("#description").val();
	startingTime = new Date(convertFormToDate($("#startTime").val()));
	endingTime = new Date(convertFormToDate($("#endTime").val()));

	//Remove existing event
	if(editingEvent >= 0)
		$("#event_"+editingEvent).remove();
	else
		editingEvent = event_Descriptions.length;


	event_Descriptions[editingEvent] = description;
	event_StartTimes[editingEvent] = startingTime;
	event_EndTimes[editingEvent] = endingTime;

	//Create new event on calendar if necessary
	if(startingTime.getMonth() == today.getMonth())
	{
		day = "#day_" + startingTime.getDate();
		//Build Description for Calendar
		description = twoDigits(startingTime.getHours()) + ":" +
					  twoDigits(startingTime.getMinutes()) + " - " +
				 	  description + " (" +
				 	  ((endingTime-startingTime)/60000) + ")";
		$(day).append('<div class="event_month" id="event_'+editingEvent+'" onclick="editEvent(event, '+editingEvent+')">'+ description +'</div>');

		$("#event_"+editingEvent).text(description);
	}

	upcomingEvents();

}

function eventEditorUpdate()
{
	if(editingEvent < 0)
	{
		startingTime = new Date($("#startTime").val());
		endingTime = new Date(startingTime.setHours(startingTime.getHours()*1+1));
		$("#endTime").val(convertDateToForm(endingTime));
	}
}

function eventEditorClear()
{
	editingEvent = -1
	$("#description").val("");
	$("#startTime").val("");
	$("#endTime").val("");
}

function eventEditorDelete()
{
	if(editingEvent >= 0)
	{
		$("#event_"+editingEvent).remove();
		event_Descriptions[editingEvent] = "REMOVED";
		event_StartTimes[editingEvent] = "REMOVED";
		event_EndTimes[editingEvent] = "REMOVED";
	}
	eventEditorClear();
	upcomingEvents();
}

function displayCalendarMonth(date){
	var month = date.getMonth()*1+1;
	var startingDay = -(new Date(date.getYear() + "-" + month + "-01").getDay())-1;
	var numberOfDays = (new Date(date.getYear(), month, 0).getDate()*1)+1;



	//Draw the calendar
	for(row = 0; row < 5; row++){
		$('#calendar').append('<div id="row_'+row+'" class="row_monthFormat"></div>');
		for(col = 0; col < 7; col++){
			day = (col+row*7);
			if(startingDay + day > 0 && startingDay+day < numberOfDays)
				$('#row_'+row).append('<div id="day_'+(day+startingDay)+'" onclick="newEvent(event, '+(day+startingDay)+')" class="day_monthFormat">'+(startingDay+(col+row*7))+'</div>');
			else
				$('#row_'+row).append('<div id="day_'+(day+startingDay)+'" class="day_monthFormat"></div>');
		}
	}

	//Add existing events
	xml_events = list_of_events.getElementsByTagName("event");
	for (e = 0; e < xml_events.length; e++){

		event_Descriptions[e] = xml_events[e].getElementsByTagName("description")[0].childNodes[0].nodeValue;
		event_StartTimes[e] = new Date(xml_events[e].getElementsByTagName("start")[0].childNodes[0].nodeValue);
			//event_StartTimes[e].setMonth(event_StartTimes[e].getMonth+1);
		event_EndTimes[e] = new Date(xml_events[e].getElementsByTagName("end")[0].childNodes[0].nodeValue);
			//event_EndTimes[e].setMonth(event_StartTimes[e].getMonth+1);

		//Get current event
		startingTime = new Date(event_StartTimes[e]);
		endingTime = new Date(event_EndTimes[e]);
		if (startingTime.getMonth()==month-1){
			day = "#day_" + startingTime.getDate();

			//Build Description for Calendar
			description = twoDigits(startingTime.getHours()) + ":" +
						  twoDigits(startingTime.getMinutes()) + " - " +
					 	  event_Descriptions[e] + " (" +
					 	  ((endingTime-startingTime)/60000) + ")";
			$(day).append('<div class="event_month" id="event_'+e+'" onclick="editEvent(event, '+e+')">'+ description +'</div>');	
		}
    }
}

function upcomingEvents(){	
	$("#calendarUpcoming").empty();
	$("#calendarUpcoming").append('<div id="eventEditor_title">Upcoming Events</div>');
	for(e = 0; e < event_Descriptions.length; e++){
		event_date = new Date(event_StartTimes[e]);
		if(event_date > today)
		{
			startingTime = new Date(event_StartTimes[e]);
			endingTime = new Date(event_EndTimes[e]);
			event_description = description = twoDigits(startingTime.getMonth()) + "/" +
						twoDigits(startingTime.getDate())+ " @ " + 
						twoDigits(startingTime.getHours()) + ":" +
						twoDigits(startingTime.getMinutes()) + " - " +
					 	event_Descriptions[e];
			$("#calendarUpcoming").append('<div class="upcomingEvent">'+ event_description + '</div>');
		}

	}
}

$(window).load(function(){    

    list_of_events = loadXML("Events.xml");

    today = new Date();

    displayCalendarMonth(today);
    upcomingEvents();
});




//Set up date picker
$(function() {
    $( "#datePicker" ).datepicker();
});