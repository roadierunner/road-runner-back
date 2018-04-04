/*! --------------------------------------------------------------
# main.js
#
# Description: Main uncompressed js file for Road Runner.
# Author: Daniel Guzman.
--------------------------------------------------------------*/

$(function($) {    
    'use strict';

    // For changing body class on scroll
    $(window).on("scroll resize", function() {
        if ($(window).scrollTop() >= 75) {
            $("body").addClass("body-scrolled");
        }
        else {
            return $("body").removeClass("body-scrolled");
        }
    });

    var roadTypeArray = [
        'Streets', 'Primary Street', 'Freeways', 'Ramps', 'Trails', 'Primary', 'Secundary',
        '4x4 Trails', 'Ferry crossing', 'Walkway', 'Pedestrian', 'Exit', 'Stairway', '4x4 Trails',
        'Private road', 'Railroads', 'Runway/Taxiway', 'Parking lot road', 'Service road'
    ];

    var today = Date.today().toString('MMMM dS, yyyy');
    var time = new Date().toString('HH:mm');
    $('#last_update').html('<span class="fa fa-refresh"></span> Last Update: ' + today + ' - ' + time);

    var minutes_to_update = 1;

    var alertsType = [];
    var WEATHERHAZARD_SubType = [];

    var traffic = {};
    var show_alerts = true;
    var specific_alert = "NO_TYPE";
    var subtype_alert = "NO_SUBTYPE";
    var markers = [];
    var polylines = [];

    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.577634, lng: -75.598487},
        // scrollwheel: false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.LEFT_TOP
        },
        zoom: 10
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);    

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());        
    });    
    google.maps.event.addListenerOnce(map, 'idle', function(){
        // Add the input only the first time the map is loaded
        $('#pac-input').show();
    });

    var markers_places = [];
    // [START region_getplaces]
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers_places.
        markers_places.forEach(function(marker) {
            marker.setMap(null);
        });
        markers_places = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers_places.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
    // [END region_getplaces]



    var fetchTrafficEventById=function(id){


        NProgress.start();
        // Initial call to the API
        $.ajax({
            crossDomain: false,
            dataType: 'json',
            type: "GET",
            url: 'api/traffic-logs/'+id
        }).done(function (data) {
            traffic =JSON.parse(data.feed);
            updateMap();
            NProgress.done();
        });

    };


    var fetchAllTraficEvents=function(){

        $('.eventcontrol').remove();

        $('#last_update').html('');

        NProgress.start();
        // Initial call to the API
        $.ajax({
            crossDomain: false,
            dataType: 'json',
            type: "GET",
            url: 'api/traffic-logs'
        }).done(function (response) {

            $('#event-control-container').append('<div class="eventcontrol"></div>');

            $('.eventcontrol').EventControl({
                hammertime: true,
                onhover: function(item, element, event, inout) {
                    if (inout == 'out') {
                        $('#event-control-text').html('Use the mouse to select an event');
                    } else {
                        var text=moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss');
                        $('#event-control-text').html(text)
                    }
                },
                oncreate: function(item, element) {
                    element.css('color', '#1abc9c');

                },
                onclick: function(item, element, event) {
                   fetchTrafficEventById(item.id);
                },
                data:response

            });

            var latestFeed=response[response.length-1];
            var latestFeedDate = moment(latestFeed.timestamp);
            $('#last_update').html('<span class="fa fa-refresh"></span> Last Update: ' + latestFeedDate.format('MMMM Do, YYYY -  h:mm:ss a'));

            NProgress.done();
        });

    }




    //Resizing the map once click on nav-toogle
    $('#menu_toggle').click(function(){        
        google.maps.event.trigger(map, 'resize');
    })

    // Updating the traffic jams
    $('#traffic_jams').click(function(){        
        $('#title').html('Traffic Jams <small></small>');
        specific_alert = "NO_TYPE";
        showAlerts(false);
        updateMap();
    });

    // Updating the traffic alerts
    $('#traffic_alerts').click(function(){        
        $('#title').html('Traffic Alerts <small>General alerts</small>');
        specific_alert = "NO_TYPE";
        showAlerts(true);
        updateMap();
    });

    // Updating the traffic alert list on View
    function updateAlertsList(){
        $( "#traffic_alerts_list" ).html("");
        $.each(traffic.alerts, function( index, item ) {
            if ($.inArray(item.type, alertsType) < 0) {
                alertsType.push(item.type);                
            }
            if (item.type == 'WEATHERHAZARD'){
                if ($.inArray(item.subtype, WEATHERHAZARD_SubType) < 0) {
                    WEATHERHAZARD_SubType.push(item.subtype);                
                }        
            }
        });

        $.each(alertsType, function( index, item ) {            
            if (item == 'WEATHERHAZARD'){
                $( "#traffic_alerts_list" ).append( "<li data-to-show='"+ item +"'><a>" + item + "</a><ul id='traffic_alerts_weatherhazard_list' class='nav child_menu' style='display:block'></ul></li>" );
            }else{
                $( "#traffic_alerts_list" ).append( "<li data-to-show='"+ item +"'><a>" + item + "</a></li>" );
            }
        });
        $('#traffic_alerts_list li').on( 'click', function () {
            specific_alert = $(this).attr('data-to-show');
            $('#title').html('Traffic Alerts <small>' + specific_alert + '</small>');            
            subtype_alert = "NO_SUBTYPE";
            showAlerts(true);
            updateMap();
        });

        $.each(WEATHERHAZARD_SubType, function( index, item ) {
            if (item.indexOf("HAZARD_ON_ROAD_") < 0 && item.indexOf("HAZARD_ON_SHOULDER_") < 0 && item.indexOf("HAZARD_WEATHER_") < 0){
                if (item.trim() == ""){
                    $( "#traffic_alerts_weatherhazard_list" ).append( "<li data-to-show='"+ item +"'><a>NO_SUBTYPE</a></li>" );
                }else{
                    $( "#traffic_alerts_weatherhazard_list" ).append( "<li data-to-show='"+ item +"'><a>" + item.substring(0, 20) + "</a></li>" );
                }
                
            }else{
                if (item.indexOf("HAZARD_ON_ROAD_") >= 0){
                    var pos = "HAZARD_ON_ROAD_".length;
                    var li_text = item.substring(pos,item.length);
                    $( "#traffic_alerts_weatherhazard_list" ).append( "<li data-to-show='"+ item +"'><a>" + li_text + "</a></li>" );
                }
                if (item.indexOf("HAZARD_ON_SHOULDER_") >= 0){
                    var pos = "HAZARD_ON_SHOULDER_".length;
                    var li_text = item.substring(pos,item.length);
                    $( "#traffic_alerts_weatherhazard_list" ).append( "<li data-to-show='"+ item +"'><a>" + li_text + "</a></li>" );
                }
                if (item.indexOf("HAZARD_WEATHER_") >= 0){
                    var pos = "HAZARD_WEATHER_".length;
                    var li_text = item.substring(pos,item.length);
                    $( "#traffic_alerts_weatherhazard_list" ).append( "<li data-to-show='"+ item +"'><a>" + li_text + "</a></li>" );
                }
            }
            
        });

        $('#traffic_alerts_weatherhazard_list li').on( 'click', function () {
            specific_alert = "WEATHERHAZARD";
            subtype_alert = $(this).attr('data-to-show');
            $('#title').html('Traffic Alerts <small>' + subtype_alert +'</small>');
            showAlerts(true);
            updateMap();
        });
        
    }

    // Updating the Map
    function updateMap(){
        deleteMarkers();
        deletePolylines();
        if (show_alerts){
            //Show alerts
            var marker;
            var infowindow = new google.maps.InfoWindow();
            $.each(traffic.alerts, function( index, item ) {
                if (specific_alert == "NO_TYPE"){
                    //This is where i define the image
                    var image = getIconMarker(item);                
                    
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(item.location.y, item.location.x),
                        map: map,
                        icon: image                    
                    });
                    markers.push(marker);
                    google.maps.event.addListener(marker, 'click', (function (marker, index) {
                        return function () {                                         
                            var content_map = getAlertContent(item);
                            infowindow.setContent(content_map);
                            infowindow.open(map, marker);
                        }
                    })(marker, index)); 

                }else{
                    if (specific_alert == item.type){
                        if (specific_alert == 'WEATHERHAZARD' && subtype_alert != 'NO_SUBTYPE'){
                            if (subtype_alert == item.subtype){
                                //This is where i define the image
                                var image = getIconMarker(item);
                                
                                marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(item.location.y, item.location.x),
                                    map: map,
                                    icon: image                    
                                });
                                markers.push(marker);  
                                google.maps.event.addListener(marker, 'click', (function (marker, index) {
                                    return function () {                                         
                                        var content_map = getAlertContent(item);
                                        infowindow.setContent(content_map);
                                        infowindow.open(map, marker);
                                    }
                                })(marker, index));     
                            }
                        }else{
                            //This is where i define the image
                            var image = getIconMarker(item);
                            
                            marker = new google.maps.Marker({
                                position: new google.maps.LatLng(item.location.y, item.location.x),
                                map: map,
                                icon: image                    
                            });
                            markers.push(marker);  
                            google.maps.event.addListener(marker, 'click', (function (marker, index) {
                                return function () {                                         
                                    var content_map = getAlertContent(item);
                                    infowindow.setContent(content_map);
                                    infowindow.open(map, marker);
                                }
                            })(marker, index)); 
                        }
                    }
                }
            });

        }else{
            //Show jams            
            var marker;
            var infowindow = new google.maps.InfoWindow();
            $.each(traffic.jams, function( index, item ) {                

                var polyline = [];
                $.each(item.line, function(item_index, item_line){                    
                    var line = {
                        lat: item_line.y,
                        lng: item_line.x
                    }
                    polyline.push(line);
                });
                
                var polylinePath = new google.maps.Polyline({
                    path: polyline,
                    geodesic: true,
                    map: map,
                    strokeColor: '#f7860e',
                    strokeOpacity: 2.0,
                    strokeWeight: 8
                });
                polylines.push(polylinePath);

                google.maps.event.addListener(polylinePath, 'click', (function (polylinePath, index) {                    
                    return function () {
                        var center_lat = item.line[0].y, center_lon = item.line[0].x;
                        var date_alert = Date.today().toString('MMMM dS, yyyy');
                        var time_alert = new Date(item.pubMillis).toString('HH:mm');
                        var image = './images/icons/bluepin_logo_traffic.png';
                        var content = '<div class="col-md-12">'+
                                        '<h2><img src="'+ image +'"> <small>JAM</small></h2>'+
                                        '<div class="clearfix"></div>'+
                                        '<div class="table-responsive">'+
                                            '<table class="table">'+
                                                '<tbody>'+
                                                    '<tr>'+
                                                        '<th>Level:</th>'+
                                                        '<td>'+ item.level +'</td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                        '<th>Street:</th>'+
                                                        '<td>'+ item.street +'</td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                        '<th>Start:</th>'+
                                                        '<td>'+ item.startNode +'</td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                        '<th>End:</th>'+
                                                        '<td>'+ item.endNode +'</td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                        '<th>Length:</th>'+
                                                        '<td>'+ item.length +' m</td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                        '<th>Road Type:</th>'+
                                                        '<td>'+ roadTypeArray[item.roadType - 1] +'</td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                        '<th>Delay:</th>'+
                                                        '<td>'+ item.delay +'</td>'+
                                                    '</tr>'+                                                    
                                                    '<tr>'+
                                                        '<th>Time:</th>'+
                                                        '<td>'+ date_alert + ' - '+ time_alert +'</td>'+
                                                    '</tr>'+
                                                '</tbody>'+
                                            '</table>'+
                                        '</div>'+
                                      '</div>';
                        infowindow.setContent(content);
                        infowindow.setPosition(new google.maps.LatLng(center_lat, center_lon));
                        infowindow.open(map, polylinePath);
                    }
                })(polylinePath, index));

                
            });
        }
        var start_date = Date.today(traffic.startTimeMillis).toString('MMMM dS, yyyy');
        var start_time = new Date(traffic.startTimeMillis).toString('HH:mm');
        var end_date = Date.today(traffic.endTimeMillis).toString('MMMM dS, yyyy');
        var end_time = new Date(traffic.endTimeMillis).toString('HH:mm');
        $('#data_time').html('Start Time: '+start_date + ' - ' + start_time + ' / ' + 'End Time: '+end_date + ' - ' + end_time);

        updateAlertsList();
        google.maps.event.trigger(map, 'resize');
    }

    function getAlertContent(item){
        var content = item.type;
        var image = getIconMarker(item);
        var date_alert = Date.today().toString('MMMM dS, yyyy');
        var time_alert = new Date(item.pubMillis).toString('HH:mm');        
        switch(item.type){            
            case 'JAM':{
                content = '<div class="col-md-12">'+
                            '<h2><img src="'+ image.url +'"> <small>'+ item.type +'</small></h2>'+
                            '<div class="clearfix"></div>'+
                            '<div class="table-responsive">'+
                                '<table class="table">'+
                                    '<tbody>'+
                                        '<tr>'+
                                            '<th>Subtype:</th>'+
                                            '<td>'+ item.subtype +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Report Rating:</th>'+
                                            '<td>'+ item.reportRating +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Confidence:</th>'+
                                            '<td>'+ item.confidence +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Realibility:</th>'+
                                            '<td>'+ item.reliability +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Magvar:</th>'+
                                            '<td>'+ item.magvar +'</td>'+
                                        '</tr>'+                                        
                                        '<tr>'+
                                            '<th>Time:</th>'+
                                            '<td>'+ date_alert + ' - '+ time_alert +'</td>'+
                                        '</tr>'+
                                    '</tbody>'+
                                '</table>'+
                            '</div>'+
                          '</div>';
                break;
            }
            case 'ACCIDENT':{
                content = '<div class="col-md-12">'+
                            '<h2><img src="'+ image.url +'"> <small>'+ item.type +'</small></h2>'+
                            '<div class="clearfix"></div>'+
                            '<div class="table-responsive">'+
                                '<table class="table">'+
                                    '<tbody>'+
                                        '<tr>'+
                                            '<th>Subtype:</th>'+
                                            '<td>'+ item.subtype +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Road Type:</th>'+
                                            '<td>'+ roadTypeArray[item.roadType - 1] +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Street:</th>'+
                                            '<td>'+ item.street +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Report Rating:</th>'+
                                            '<td>'+ item.reportRating +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Confidence:</th>'+
                                            '<td>'+ item.confidence +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Realibility:</th>'+
                                            '<td>'+ item.reliability +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Magvar:</th>'+
                                            '<td>'+ item.magvar +'</td>'+
                                        '</tr>'+                                        
                                        '<tr>'+
                                            '<th>Time:</th>'+
                                            '<td>'+ date_alert + ' - '+ time_alert +'</td>'+
                                        '</tr>'+
                                    '</tbody>'+
                                '</table>'+
                            '</div>'+
                          '</div>';
                break;
            }
            case 'WEATHERHAZARD' || 'HAZARD':{ 
                var item_subtype = item.subtype;
                if (item.subtype.trim() == ""){
                    item_subtype = "NO_SUBTYPE";
                }
                content = '<div class="col-md-12">'+
                            '<h2><img src="'+ image.url +'"> <small>'+ item.type +'</small></h2>'+
                            '<div class="clearfix"></div>'+
                            '<div class="table-responsive">'+
                                '<table class="table">'+
                                    '<tbody>'+
                                        '<tr>'+
                                            '<th>Subtype:</th>'+
                                            '<td>'+ item_subtype +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Realibility:</th>'+
                                            '<td>'+ item.reliability +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Street:</th>'+
                                            '<td>'+ item.street +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Report Rating:</th>'+
                                            '<td>'+ item.reportRating +'</td>'+
                                        '</tr>'+                                        
                                        '<tr>'+
                                            '<th>Confidence:</th>'+
                                            '<td>'+ item.confidence +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Road Type:</th>'+
                                            '<td>'+ roadTypeArray[item.roadType - 1] +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Magvar:</th>'+
                                            '<td>'+ item.magvar +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Time:</th>'+
                                            '<td>'+ date_alert + ' - '+ time_alert +'</td>'+
                                        '</tr>'+
                                    '</tbody>'+
                                '</table>'+
                            '</div>'+
                          '</div>';
                break;
            }
            case 'ROAD_CLOSED':{
                content = '<div class="col-md-12">'+
                            '<h2><img src="'+ image.url +'"> <small>'+ item.type +'</small></h2>'+
                            '<div class="clearfix"></div>'+
                            '<div class="table-responsive">'+
                                '<table class="table">'+
                                    '<tbody>'+
                                        '<tr>'+
                                            '<th>Subtype:</th>'+
                                            '<td>'+ item.subtype +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Realibility:</th>'+
                                            '<td>'+ item.reliability +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Street:</th>'+
                                            '<td>'+ item.street +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Report Rating:</th>'+
                                            '<td>'+ item.reportRating +'</td>'+
                                        '</tr>'+                                        
                                        '<tr>'+
                                            '<th>Confidence:</th>'+
                                            '<td>'+ item.confidence +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Report Description:</th>'+
                                            '<td>'+ item.reportDescription +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Magvar:</th>'+
                                            '<td>'+ item.magvar +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th>Time:</th>'+
                                            '<td>'+ date_alert + ' - '+ time_alert +'</td>'+
                                        '</tr>'+
                                    '</tbody>'+
                                '</table>'+
                            '</div>'+
                          '</div>';
                break;
            }
            default:{
                content = '<div class="col-md-12">'+
                            '<h2><img src="'+ image.url +'"> <small>'+ item.type +'</small></h2>'+
                            '<div class="clearfix"></div>'+
                            '<div class="table-responsive">'+
                                '<table class="table">'+
                                    '<tbody>'+                                        
                                        '<tr>'+
                                            '<th>Time:</th>'+
                                            '<td>'+ date_alert + ' - '+ time_alert +'</td>'+
                                        '</tr>'+
                                    '</tbody>'+
                                '</table>'+
                            '</div>'+
                          '</div>';
                break;
            }
        }
        return content;
    }

    function getIconMarker(item){        
        var image_path = './images/icons/bluepin_logo_mapchat.png';
        switch(item.type){
            case 'ACCIDENT':{
                image_path = './images/icons/bluepin_logo_accident.png';
                break;
            }            
            case 'JAM':{
                image_path = './images/icons/bluepin_logo_traffic.png';
                break;
            }
            case 'WEATHERHAZARD' || 'HAZARD':{ 
                if (item.subtype == 'HAZARD_ON_SHOULDER' || item.subtype == 'HAZARD_ON_SHOULDER_CAR_STOPPED' || item.subtype == 'HAZARD_ON_SHOULDER_ANIMALS' || item.subtype == 'HAZARD_ON_SHOULDER_MISSING_SIGN'){
                    image_path = './images/icons/bluepin_logo_onshoulder.png';
                }else{                    
                    image_path = './images/icons/bluepin_logo_hazard.png';
                }
                break;
            }
            case 'ROAD_CLOSED':{
                image_path = './images/icons/bluepin_logo_construction.png';
                break;
            }
            default:{
                image_path = './images/icons/bluepin_logo_hazard.png';
                break;
            }
        }
        var image = {
            url: image_path,
            // This marker is 72 pixels wide by 64 pixels tall.
            size: new google.maps.Size(72, 64),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at (72/2),64.
            anchor: new google.maps.Point((72/2), 64)
        };

        return image;
    }
    
    function showAlerts(do_i_have_to_show_them){
        show_alerts = do_i_have_to_show_them;
    }

    function deleteMarkers() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }

    function deletePolylines() {
      for (var i = 0; i < polylines.length; i++) {
        polylines[i].setMap(null);
      }
      polylines = [];
    }

    fetchAllTraficEvents();

    fetchTrafficEventById('latest');

    // CLEARABLE INPUT
    function tog(v){return v?'addClass':'removeClass';} 
    $(document).on('input', '.clearable', function(){
        $(this)[tog(this.value)]('x');
    }).on('mousemove', '.x', function( e ){
        $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');
    }).on('touchstart click', '.onX', function( ev ){
        ev.preventDefault();
        $(this).removeClass('x onX').val('').change();
    });



});
