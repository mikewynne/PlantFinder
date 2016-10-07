/************************************************************************************************************

Title:		San Francisco Property Information Map
Author: 	Mike Wynne (mike.wynne@sfgov.org)
		City & County of San Francisco Planning Department
Created:	April 2011
Description:	Searches for an address, parcel, block, place name, Planning Dept project or Dept of Building Inspections 
		permit and then creates reports displaying relevant property information, Planning Dept zoning, Planning 
		Dept projects, Dept of Building Inspections permits, Miscellaneous Permits routed through the Planning 
		Dept by other City departments, Board of Appeals decisions and Planning Dept enforcement complaints.
Technology:	HTML
		Javascript
		Google Maps API v2
		ArcGIS Server Javascript API with Google Maps Extension v1.6
		ArcGIS Server REST API
		.net web services
		Ajax
		IIS 7
		Hosted on Amazon Cloud (Amazon Web Services)
		
**********************************************F**************************************************************/	
	//set the window resize event
	window.onresize = window_resize;
  
	var polyline;
	var dynamicMap = null;
	var dynamicMap2 = null;
	var imageParams = null;
	var findTask = null;
	var findTaskBlock = null;
	var findTaskCase = null;
	var params = null;
	var paramsBlock = null;
	var mapExtension = null;
	var theSearchType = null;
	var theSearchString = null;
	var globaltmpString = null;
	var geometryService;
	var amIMeasuring = false;
	var polygon = null;
	var theSearch = null;
	var gsvc;
	var buffParams;
	var buffOvs = [];
	var identifyOvs = [];
	var theBufferDist= null;
	var imbuffering=false;
	var imidentifying=false;
	var findResults=[];
	var theSearchType = null;
	var theSearchString = null;
	var qtask = null;
	var query = null;
	var clicked = null;
	var theClickedCoord = null;
	var marker = null;
	var overlay= null;
	var latLng = null;
	var theZoningHtml = "";
	var theAssessorHtml = "";
	var theSurveyRatingsHtml = "";
	var theCaseTrackingHtml = "";
	var thePermitsHtml = "";
	var theMiscPermitsHtml = "";
	var theEnforcementHtml = "";
	var theAppealsHtml = "";
	var theBBNsHtml = "";
	var theNeighborhood=""
	var isNeighborhood=false;
	var isDistrict=false;
	var theSFFindElectedHtml = "";
	var theSFFindPlacesHtml = "";
	var theSFFindServicesHtml = "";
	var theSFFindInfoHtml = "";
	var polygonCenter = null;
	var theBlock = null;
	var theLot = null;
	var idResults = null;
	var instructions = null;
	var tabwidth;
	var iPadUser = null;
	var iPhoneUser = null;
	var iPodUser = null;
	var startScale = 12;
	var viewportwidth = null;
	var viewportheight = null;
	var myheight = null;
	var init = true;
	var theYearBuilt="";
	var theMapSize="small";
	var theServerName = window.location.host;
	var theArcGISServerName = "http://"+theServerName+"/arcgis/rest/services/PlantSF/MapServer";
	var theSFFindServerName = "http://"+theServerName+"/arcgis/rest/services/SFFind/MapServer";
	var theSFFindNeighborhoodServerName = "http://"+theServerName+"/arcgis/rest/services/SFFindNeighborhoods/MapServer";

	var thefindResults = null;
	var theNum;
	var theAddressLot = "";
	var themapblklot="";
	var theLinkAddress="";
	var tabNo = 0;
	var lastSearchClick=false;
	var theGeometry = null;
	var polygonBounds = null;
	var theGeometries = null;
	var theReportTitle = null;
	var theXWGSAux =null;
	var theYWGSAux =null;
	var coordProjected=false;
	
	//Set up variables to be used to check if the user is within CCSF network or not and which dept
	var theLoc="Out of City";
	var theLocMaster="Out of City";
	var theURLtmp = 'http://' + theServerName +'/GetHost/GetIP.asmx/GetIP';
	var dept="";
	var sitename="";
	var theOrigType="";
	var theNeighborhoodParam="";
	var theDistrictParam="";
	var thetempAddress="";
	var LastDBIUpdate = "";
	var projHash = {};
	var theRes;
	var theSearchGraphic = null;
	var theGeom;
	var tabsReady=false;
	var tb =  null;
	var lengthParams = null;
	var resizeTimer;
	var withlatlong=false;
	var theBM=null;

//function getPos(el) { 
    // yay readability 
//    for (var lx=0, ly=0; 
//         el != null; 
//         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent); 
//    return {x: lx,y: ly}; 
//} 

    

    function initialize() {
	    	//Runs when page initially loads (from the html <body> onLoad event)
	//Creates the Google map and creates the ArcGIS Server dynamic map service which will be used to add GIS data to the Google Map.  
	//Also creates the find, query and identify tasks within ArcGIS Server.
	    
	//Check whether the user is in the CCSF network
	//If outside, the user will be shown a clearer, more concise version of the data.
	//Some department's want the ability to further filter the data to be more appropriate for their staff, so also check for a 'dept' specified in a URL parameter.
	//This calls an Ajax web service to check the user's IP to determine if in or out of the City network.
	theURLtmp = 'http://' + theServerName +'/GetHost/GetIP.asmx/GetIP'
	dept=gup("dept").toUpperCase();
	sitename=gup("name").toUpperCase();
	theNeighborhoodParam=gup("neighborhood")//.toUpperCase();
	theDistrictParam=gup("district")
	
	
		//set up Property Information Map UI
		//map title set by the getLocation function which will be run next (changes the PIM title based on the location of the user (inside the City network - internal version)
		//document.getElementById('searchExamples').innerHTML ='<table style="padding: 3px;" class="searchExamples" border=0><tr><td><span><i>Search Examples: </i>&nbsp &nbsp<span></td><td> <span>400 Van Ness Ave</span></td><td><span> 0787/001</span></td></tr><tr><td></td><td> <span>Mission and Van Ness &nbsp; &nbsp;</span></td><td><span>2011.0218</span></td></tr><tr><td></td><td><span >Ferry Building</span></td><td></td></tr></table>'
		//document.getElementById('step2a').innerHTML='Review Property Information'
		//document.getElementById('mapTag').innerHTML='Public Access to Useful Property Information & Resources at the Click of a Mouse'
		document.getElementById('searchPaneText').innerHTML=''//'Click tabs below to view property or parcel information'
		
	
	//getLocation(theURLtmp)
	    
	//set up the window to work best with the browser shape and size
	window_resize();
	init=false;
	
	//create the HTML that will be used to populate the reports inside the tabs.  Initially just display a message saying this is where the reports will appear.
	instructions = "<div border=0 style=' margin-left:" + (tabwidth/4) + "px; margin-top:" + (myheight/4) + "px'><table border=0><tr><td class='introText' >This area will remain empty until you search or click on the map.</td></tr></table></div>"
	//instructions = "<div border=0 style=' margin-left:" + (tabwidth/4) + "px; margin-top:" + (myheight/4) + "px'><table border=0><tr><td ><b>We are currently experiencing technical problems.<br>We expect this to be resolved by 10am.</b></td></tr></table></div>"
	document.getElementById('AssessorReport').innerHTML = instructions
	document.getElementById('ZoningReport').innerHTML = instructions
	document.getElementById('SurveyRatingsReport').innerHTML = instructions
	document.getElementById('CaseTrackingReport').innerHTML = instructions
	document.getElementById('PermitsReport').innerHTML = instructions
	document.getElementById('MiscPermitsReport').innerHTML = instructions
	document.getElementById('EnforcementReport').innerHTML = instructions 
	document.getElementById('AppealsReport').innerHTML = instructions 
	document.getElementById('BBNsReport').innerHTML = instructions 
    
	

	//Set up the ArcGIS server dynamic map service
	
	
	var imageParams = new esri.layers.ImageParameters();
	imageParams.layerIds = [9999];
	//imageParams.layerOption = "show"
	imageParams.transparent = true;
	dynamicMap = null;

        //imageParams.format = "jpeg";  //set the image type to PNG24, note default is PNG8.
        //Takes a URL to a non cached map service.
        //dynamicMap = new esri.layers.ArcGISDynamicMapServiceLayer("http://" + theServerName + "/ArcGIS/rest/services/ParcelInfoInternetLayers/MapServer", {"opacity":0.75, "imageParameters":imageParams});
	//alert(theArcGISServerName)
	dynamicMap = new esri.layers.ArcGISDynamicMapServiceLayer(theArcGISServerName, {"opacity":0.75, "imageParameters":imageParams});
	if (sitename=="SFFIND") {
		dynamicMap2 = new esri.layers.ArcGISDynamicMapServiceLayer(theSFFindNeighborhoodServerName, {"opacity":0.75, "imageParameters":imageParams});
		identifyTask2 = new esri.tasks.IdentifyTask(theSFFindNeighborhoodServerName);
	}
	
        dynamicMap.setVisibleLayers([9999]);
	map.addLayer(dynamicMap);

	
	findTask = new esri.tasks.FindTask(theArcGISServerName);
	//Set up the ArcGIS Server Identify Task
	identifyTask = new esri.tasks.IdentifyTask(theArcGISServerName);
	
	//identify proxy page to use if the toJson payload to the geometry service is greater than 2000 characters.
	esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";        
	esri.config.defaults.io.alwaysUseProxy = false;
	gsvc = new esri.tasks.GeometryService("http://" + theServerName +"/arcgis/rest/services/Geometry/GeometryServer");
	
	
	//Set up the buffer parameters for later use
	buffParams = new esri.tasks.BufferParameters();
	buffParams.unit = esri.tasks.GeometryService.UNIT_FOOT
	buffParams.unionResults = true;
	
	
	dojo.connect(map, "onClick", onMapClick)
	locator = new esri.tasks.Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");        
	dojo.connect(locator, "onAddressToLocationsComplete", showGeocodeResults);
	//Creates a variable to hold the ArcGIS Server Find Task's parameters
	//params = new esri.arcgis.gmaps.FindParameters();
	params = new esri.tasks.FindParameters();
	
	zoomInDiv=document.getElementById("maximizeMap")
	
	dojo.connect(gsvc, "onLengthsComplete", outputDistance)
	
	setTimeout(areTabsReady,1250);
	//dojo.connect(map, "onLoad", areTabsReady)

}
   
	function MeasureTool() {
		var r = window.confirm("To measure a distance:\n  - Click on the map to start tracing a line to measure\n  - Click again at any corner\n  - Double click to finish\n\nClick OK to continue or Cancel to stop measuring.")
		if (r) {
			amIMeasuring=true;
			tb = new esri.toolbars.Draw(map);    
			lengthParams = new esri.tasks.LengthsParameters(); 	
			//on draw end add graphic, project it, and get new length      
			dojo.connect(tb, "onDrawEnd", function(geometry) {              
				lengthParams.polylines = [geometry];        
				lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;        
				lengthParams.geodesic = true;               
				gsvc.lengths(lengthParams);        
				var graphic = map.graphics.add(new esri.Graphic(geometry, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]),2)));      
				});      
				//tb.activate(esri.toolbars.Draw.FREEHAND_POLYLINE);    
				tb.activate(esri.toolbars.Draw.POLYLINE);    
		} else {
			amIMeasuring=false;
			if (tb) {
				tb.deactivate();
			}
		}
	}
	var lastResult=""
	function outputDistance(result) {  
		//sometimes calls function twice, if sending the result second time don't open the alert 
		if (result.lengths[0]!=lastResult) {
			theDist = dojo.number.format(result.lengths[0],{places: 1}) + " feet";
			alert(theDist)
		}
		tb.deactivate();
		amIMeasuring=false;
		lastResult=result.lengths[0]
	}
    function areTabsReady() {
	if(!tabsReady) {
		setTimeout(areTabsReady, 50);//wait 50 millisecnds then recheck
		return;
	}
	if (sitename=="SFFIND") {
		if (theNeighborhoodParam!="") {
			isNeighborhood=true; 
			showAddress(theNeighborhoodParam);	
		} else {
			if (theDistrictParam!="") {
				isDistrict=true;

							alert("ready")

			}
		}
	} 
	if (gup("search") != "")  {
			//if there is a search parameter in the URL run a search as if user clicked the search button
			theSearchString = gup("search")
			document.getElementById('addressInput').value = theSearchString
			if (dynamicMap.ready) {
				showAddress(theSearchString)
				//alert("ready")
			} else {
				setTimeout('showAddress(theSearchString);',2000);
				//alert("not ready")
			}
			
	}
	if (gup("tab") !="") {
		//if there is a tab parameter in the URL switch to the tab the user stated.
		showTab('dhtmlgoodies_tabView1',gup("tab"));
	}
	theBM=gup("bookmark").toUpperCase()
    }


 function viewPort() {
	var h = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
	var w = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
	return { width : w , height : h }
 }

    function window_resize() {
	//Runs after the web page is first loaded.  Also run whenever the browser is resized,
	//Deals with setting the size of the divs for the map and the tabs to fill the browser window (tab height needs to be set to a pixel size rather than 100%) 
	//There are different versions of the page for lower resolution browsers and mobile devices (just iPhone and iPad so far).
	    
	viewportwidth = viewPort().width
	viewportheight = viewPort().height
	myheight = viewportheight-200


	if (navigator.userAgent.indexOf('MSIE')>0) { 
	//alert("IE")
		document.getElementById("map_canvas").style.height = "100%" 
	} else {
		theoff = 185
		myheight = (viewportheight - 227)
		if (sitename=="SFFIND") {
			document.getElementById("map_canvas").style.height = myheight -111  + "px"
		} else {
			document.getElementById("map_canvas").style.height = myheight -97  + "px"

		}
	}

	tabwidth=viewportwidth - 494;
	//alert(viewportwidth)
	if (viewportwidth < 1100 ) {
		if (sitename!="SFFIND") {
			document.getElementById("map_canvas").style.width= "392px"
		}
		
		document.getElementById("addressInput").style.width= "230px"
		document.getElementById("addressInput").style.height="26px"
		document.getElementById("addressInput").style.fontSize="16px";
		document.getElementById("mapTitle").style.fontSize="23px";
		document.getElementById("mapTag").style.fontSize="13px";
		document.getElementById("step1").style.fontSize="18px";
		document.getElementById("step1a").style.fontSize="18px";
		document.getElementById("step2").style.fontSize="18px";
		document.getElementById("step2a").style.fontSize="18px";
		document.getElementById("topRow").style.height= "110px";
		document.getElementById("secondRow").style.height="14px";
		document.getElementById("blankRow2").style.height="0px";
		
		
		startScale=11;

		tabwidth=viewportwidth - 430;
		if (navigator.userAgent.indexOf('MSIE')>0) { 
//alert("Small IE")
			document.getElementById("map_canvas").style.height = "100%"
		} else {
			theoff = 145
			if (sitename=="SFFIND") { 
				document.getElementById("map_canvas").style.height = myheight - 100 + "px"
			} else {
				document.getElementById("map_canvas").style.height = myheight - 78  + "px"
			}
		
		}
	} else {
		if (viewportwidth <1155) {
			if (sitename!="SFFIND") {
				document.getElementById("map_canvas").style.width= "440px"
				document.getElementById("addressInput").style.width= "230px"
				document.getElementById("addressInput").style.height="26px"
				document.getElementById("addressInput").style.fontSize="16px";
				document.getElementById("mapTitle").style.fontSize="23px";
				document.getElementById("mapTag").style.fontSize="13px";
				document.getElementById("step1").style.fontSize="18px";
				document.getElementById("step1a").style.fontSize="18px";
				document.getElementById("step2").style.fontSize="18px";
				document.getElementById("step2a").style.fontSize="18px";
				document.getElementById("topRow").style.height= "110px";
				document.getElementById("secondRow").style.height="14px";
				document.getElementById("blankRow2").style.height="0px";
				if (navigator.userAgent.indexOf('MSIE')<0) {
					document.getElementById("map_canvas").style.height = myheight - 78 + "px"
				}
				
			} else {
				
				document.getElementById("mapTitle").style.fontSize="30px";
				document.getElementById("mapTag").style.fontSize="18px";
				document.getElementById("step1").style.fontSize="24px";
				document.getElementById("step1a").style.fontSize="24px";
				document.getElementById("step2").style.fontSize="24px";
				document.getElementById("step2a").style.fontSize="24px";
				document.getElementById("topRow").style.height= "140px";
				document.getElementById("secondRow").style.height="15px";
				document.getElementById("blankRow2").style.height="5px";
				if (navigator.userAgent.indexOf('MSIE')<0) {
					document.getElementById("map_canvas").style.height = myheight - 111 + "px"
				} else {
					
				}
			}

		} else {
			document.getElementById("map_canvas").style.width= "496px"
			if (sitename=="SFFIND") { 
				document.getElementById("addressInput").style.width= "230px"
				if (navigator.userAgent.indexOf('MSIE')<0) {
					document.getElementById("map_canvas").style.height = myheight - 111+ "px"
				}
				
			} else {
				document.getElementById("addressInput").style.width= "335px"
				document.getElementById("addressInput").style.height="34px"
				document.getElementById("addressInput").style.fontSize="25px";
				document.getElementById("mapTitle").style.fontSize="30px";
				document.getElementById("mapTag").style.fontSize="18px";
				document.getElementById("step1").style.fontSize="24px";
				document.getElementById("step1a").style.fontSize="24px";
				document.getElementById("step2").style.fontSize="24px";
				document.getElementById("step2a").style.fontSize="24px";
				document.getElementById("topRow").style.height= "140px";
				document.getElementById("secondRow").style.height="15px";
				document.getElementById("blankRow2").style.height="5px";
			}
		}
	}
	//deal with iphone, ipod and ipad
	if (  (navigator.userAgent.indexOf('iPhone')>0) || (navigator.userAgent.indexOf('iPod')>0) || (navigator.userAgent.indexOf('iPad')>0) || (navigator.userAgent.indexOf('Mobile')>0) ) { 
		myheight = (viewportheight - 205)
		document.getElementById("addressInput").style.width="200px";
		if (sitename=="SFFIND") {
			document.getElementById("map_canvas").style.height = myheight - 147  + "px"
			document.getElementById("map_canvas").style.width="450px"
			document.getElementById("addressInput").style.width= "250px"
			document.getElementById("addressInput").style.height="34px"
			document.getElementById("addressInput").style.fontSize="24px";
			document.getElementById("step1").style.fontSize="24px";
			document.getElementById("step1a").style.fontSize="24px";
			document.getElementById("step2").style.fontSize="24px";
			document.getElementById("step2a").style.fontSize="24px"
			document.getElementById('findButton').style.height= "30px"
			document.getElementById('neighborhoodSelect').style.width= "275px"
			document.getElementById('neighborhoodSelect').style.fontSize="24px"
			
		} else {
			
			document.getElementById("map_canvas").style.height = myheight - 82  + "px"
			document.getElementById("map_canvas").style.width="387px"
		}
	}
	if ((navigator.userAgent.indexOf('iPad')>0 )) { 
		iPadUser = true;
	}
	if ((navigator.userAgent.indexOf('iPhone')>0 )) { 
		 iPhoneUser = true;
	}
	if ((navigator.userAgent.indexOf('iPod')>0 )) { 
		 iPodUser = true;
	}
//alert(document.getElementById("map_canvas").style.height)
//alert(document.getElementById("mapCell").style.height)
	
	//setTimeout('map.resize();',3000);
	//setTimeout('map.reposition();',3000);
	map.resize();
	map.reposition();

	
	//now set the tabs run initTabs if this is the first time the page is loading. run reset tab heights if the browser window size is changed.
	if (init) {

		tabNo=1
				initTabs('dhtmlgoodies_tabView1',Array('Plants'),0,'100%',myheight,Array(false,true,true,true));
		tabsReady=true;

	} else {
		resetTabHeights('dhtmlgoodies_tabView1', myheight)
		//setTimeout(resizeMap(true),500);
	}	
	
	var divHeight = document.getElementById("mapContainer").offsetHeight
	document.getElementById('map_canvas').style.height = divHeight;
	var divWidth = document.getElementById("mapContainer").offsetWidth;
	document.getElementById('map_canvas').style.width = divWidth;
    }
    


function gup( thename ){  
	//Returns paramters from the URL
	thename = thename.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
	var regexS = "[\\?&]"+thename+"=([^&#]*)";  
	var regex = new RegExp( regexS );  
	var results = regex.exec( unescape(window.location.href) );  
	if( results == null )    return "";  else    return results[1];
}

function openPrintVersion() {
	//Opens a new page with a printable version of the reports - at present just basic text with little formating and images/map removed.
	theZoningHtml = theZoningHtml.replace(/class='noprint'/gi,"style='display:none'");
	theZoningHtml = "<html>\n" + "  <head>\n" +  "    <link href='Print.css' type='text/css' rel='stylesheet' media='all' />" + "\n  </head>\n" + "<body>\n" + theZoningHtml + "\n  </body\n</html>"
	OpenWindow=window.open("", "ZoningReport", "height=600, width=800, toolbar=yes, scrollbars=yes, menubar=yes, resizable=yes , status=yes");
	OpenWindow.document.write(theZoningHtml)
	OpenWindow.document.close()
	self.name="main"
}
function onMapClick(evt) { 
	map.infoWindow.hide();
	theSearchType = "mapClick"
	theOrigType="mapClick"
	theSearchString=""
	identifyClick(evt)
}

function searchWithLatLong(tmpLat,tmpLong) {
	var source = new Proj4js.Proj("WGS84");
	var dest = new Proj4js.Proj("EPSG:102113"); 
	var p = new Proj4js.Point(tmpLong,tmpLat);  
	Proj4js.transform(source, dest, p); 
	withlatlong = true;
	var p2 = new esri.geometry.Point(p.x, p.y, new esri.SpatialReference({ wkid: 102113 }));
	onMapClick(p2)
	
	
}
function identifyClick(evt) { 
	//Runs when a user clicks on the map.  Checks whether the user is using the measure tool (currently deactivated), if not get the lat/long and send to the identify task
	if (amIMeasuring) return;
	if (withlatlong) {
	} else {
		evt.y=evt.y+40
	}
	clicked = true;
	theClickedCoord = latLng
	isNeighborhood=false;
	isDistrict=false;
	//alert(withlatlong)
	if (withlatlong) {
		theGeom=evt;
	} else {
		theGeom=evt.mapPoint;
	}
	withlatlong=false;
	var source = new Proj4js.Proj("EPSG:102113"); 
	var dest = new Proj4js.Proj("WGS84");
	var p = new Proj4js.Point(theGeom.x,theGeom.y);   
	Proj4js.transform(source, dest, p); 
	latLng=p
	imbuffering=false
	if (latLng) {
		if (theOrigType=="Address" && theSearchString !="") {
			theLinkAddress = theSearchString
		} else {
			theSearchString = "Latitude: " + roundNumber(p.y,5) + " Longitude: " + roundNumber(p.x,5)
			theLinkAddress = roundNumber(p.y,5)  + " " + roundNumber(p.x,5)
		}
		map.graphics.clear();
		var IDsymbol = new esri.symbol.PictureMarkerSymbol('http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM/images/blue.png', 32, 32).setOffset(0,16);
		var graphic = new esri.Graphic(theGeom, IDsymbol);
		theSearchGraphic = graphic
		map.graphics.add(graphic);
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		document.getElementById('AssessorReport').innerHTML = "<table  border=0 align=middle width=100%><tr><td align=middle width=100%><big><big><br><br><b>Please wait, generating report </b></big></big> <img src='http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM/images/loader_Dots.gif'></td></tr></table>"
	}
	identify(null, theGeom);
}


function identify(overlay, latLng) {
	// One of the key functions.
	// At this point either the user has either clicked on the map OR the user has clicked the search button. If the latter the Find Task has been successfully 
	// run which has returned the geography of the found object (parcel, address, case boundary, etc).  This function will then be used with the found object's 
	// geography (or the lat/long of the map click) to perform an Identify Task against the key GIS layers.  It will use the results of the Identify Task to populate the report tabs.

	var theNum =0
	theAddressLot = "";
	themapblklot="";
	
	// First, work out if the function was fired as a result of an onclick event associated with a buffer, a measure or an click on the map on top of a previous search result.  
	// In these cases exit the function.
	if (imbuffering) { 
		imbuffering=false
		return
	} else {
		identifyOvs = [];
	}
	if (overlay)  return;
        if (amIMeasuring)  return;

	var identifyParameters = new esri.tasks.IdentifyParameters();
	//set the identify tolerance to 3 pixels if the user clicked the map
	//if the user has clicked on the map add a marker and set things up so that they can later drag the marker to a new location
	if (clicked) {
		lastSearchClick=true;
		identifyParameters.tolerance = 1;
		//Deal with clicks outside San Francisco - issue a warning and clear the report	
		if (clicked &&(latLng.x < -13638091 || latLng.x > -13620761 || latLng.y > 4556181 || latLng.y < 4538163)){
			document.getElementById('AssessorReport').innerHTML = instructions 
			alert("You clicked outside San Francisco.\n\nPlease search for properties in San Francisco.")
			return;
		}
		clicked=false;
	} else {
		lastSearchClick=false
		identifyParameters.tolerance = 0;
	}

	//Clear the variables that will hold the HTML used to populate each of the report tabs

	theAssessorHtml = null;

	identifyParameters.geometry = latLng //esri.geometry.webMercatorToGeographic(latLng);
	identifyParameters.returnGeometry = false;
	identifyParameters.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
	//Here we create 2 strings that later will be used to create arrays of the layer IDs to identify against
	var tmpArray = new Array();
	globaltmpString = 'layers = { "' + tmpArray[1] + '": []'
	for ( i=2; i < tmpArray.length; i++) {
		globaltmpString = globaltmpString + ', "' + tmpArray[i] + '": []'
	}
	tmpString = "["
	for (i=0; i< dynamicMap.layerInfos.length; i++) {
		//adds the IDs of the layers to identify against to the text string; all those other than the ones listed below - parcel dimensions, parcels, etc.  The parcel results come from the parcel labels layer.
		switch (dynamicMap.layerInfos[i].name)
		{
			//case "Parcels":
			//	break;
			
			default:
				if (tmpString =="[") { 
					tmpString = tmpString + dynamicMap.layerInfos[i].id;
				} else {
					tmpString = tmpString + ", " + dynamicMap.layerInfos[i].id;
				}
		}	
	}
	tmpString = tmpString + " ]"
	globaltmpString = globaltmpString + "};"
	tmpString = "identifyParameters.layerIds = " + tmpString

	//run the string to set the identify parameters to only look through the layers we listed
	eval(tmpString)
	
	identifyParameters.width  = map.width;        
	identifyParameters.height = map.height;
	identifyParameters.mapExtent = map.extent;

	//set up the function which will run when the Identify Task returns its results, this function will process the results (this is key to filling the report tabs)
	
	identifyTask.execute(identifyParameters, function(response, error) {
		if (hasErrorOccurred(error)) return;
			//fill the idResults array with the results
			idResults = response;
			 //order the results so that they display in correct order in the tabs (orders by case number, address, misc permit number, etc)
			//Chrome bug results in the sort failing in Chrome - Chrome uses a different sort algorithm which is "unstable" 
			 idResults.sort(idresultsort)
			 iPadText=""
			 if (iPadUser || iPhoneUser || iPodUser) {
				if ((navigator.userAgent.indexOf('OS_4') >0) || (navigator.userAgent.indexOf('OS_3') >0) || (navigator.userAgent.indexOf('OS_2') >0)) {
					iPadText="<font class='NoPrint'>Use 2 fingers to scroll down reports.<br><br></font>"
				}
			}
			 printLink = "" //" <a class='NoPrint' style='float:right; font-size: 14px; font-family:Arial, Helvetica, sans-serif; color: #33b5ff; text-decoration: underline;' href='javascript: printReports();'> Printable Version of Reports</a>"
			
			//start to populate the variables with the HTML that will later be used to populate the report tabs
			//the iPadText is instructions for iPhone, iPod and iPad users to help them scroll through the reports.   Other users will not see this text.
				
			theAssessorHtml = printLink + "<a name='BookmarkPropertyTop'/><div class='searchPaneSectionHeader'> " + iPadText +"</div><div class='reportHeader'><span style='color: #0099ff;'>Property Report:  </span><span style='color: #000000;'>" + theSearchString + "</span></div><br>"
				
			updatePropertyHtml();
		}
	);
	
}


 

      



      function addMapServiceLayer(layer, error) {
        // display error message (if any) and return
        if (hasErrorOccurred(error)) return;

        // add layer to the map
        mapExtension.addToMap(layer);
      }



      function hasErrorOccurred(error) {
	//display ArcGIS Server error
        if (error) {
          alert("Error " + error.code + ": " + (error.message || (error.details && error.details.join(" ")) || "Unknown error" ));
          return true;
        }
        return false;
      }

    function findCompleteCallback(findResults) {

	//Function is run when the server returns results from the Find Task.  This should have returned the geography of whatever the user searched for (parcel, case, block, address, etc) 
	//Clear the map and reports, zooms the map to the Find Result then buffer by -0.95 ft.  The buffer task will then kick off the identify task
	thefindResults = findResults
    	//var theRes = findResults.findResults[0];   
	theRes = findResults[0]
	if ((findResults.length==0) || (theRes == 'undefined') || (theRes == null) ) {
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
			if (theSearchType == "Address") {
				showAddress(theSearchString)
			} else {
				if (theSearchType=="Case") {
					//User is looking for a case but we can't find it in the mapped version....now search through the tabular version of the cases and case actions
					params.searchFields = ["CASENO"];
					params.searchText = theSearchString.toUpperCase();
					theSearchType = "Case Unmapped"
					if (theSearchType == "Case Unmapped") {
						params.layerIds=[]
						for (i=0; i< dynamicMap.layerInfos.length -1; i++) {
							if (dynamicMap.layerInfos[i].name == "Planning_Cases_Table_Layer") {
								params.layerIds.push(dynamicMap.layerInfos[i].id);
								params.searchFields = ["CaseNo"];
								params.searchText = theSearchString.toUpperCase();
								theSearchType = "Case Unmapped"
								params.contains = false;
							}
							if (dynamicMap.layerInfos[i].name == "ProjActions") {
								params.layerIds.push(dynamicMap.layerInfos[i].id);
							}
						}
						findTask.execute(params, findCompleteCallback);
					}
				} else {
					alert("Sorry, I can't find '" + theSearchString + "'" + ", please try again.");     
					document.getElementById('AssessorReport').innerHTML = instructions 
				}
			}
	} else {
		if (theSearchType=="Case Unmapped") {
			imidentifying = true;
			unMappedCases();
			return null;
		}
		//Get the bounds of the geometry of the find result.  We will then zoom the map to those bounds.  Get the first geometry object then loop through others if its a multipart polygon.
		theGeometries=theRes.feature.geometry
		theGeometry = theRes.feature.geometry; 
		var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), new dojo.Color([100,100,255,0.5]));        

		//Set up a very basic info window that will open if they click on the result on the map
		//alert(theSearchType)
		if (theSearchType=="Case") {
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic
			var infoTemplate = new esri.InfoTemplate();	
			infoTemplate.setTitle("${CASENO}"); 
			content = "<div overflow='auto' >Buffer by:<table border=0 ><tr></td><td style='width:40px'> <a id='lnkBuffer150' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,190.5);' title= 'Buffer this area by 150ft'> 150ft;</a>&nbsp </td>"
			content += "<td style='width:40px'> <a id='lnkBuffer300' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,381);' title= 'Buffer this area by 300ft'> 300ft;</a>&nbsp</td>  "
			content += "<td style='width:50px'> <a id='lnkBuffer1000' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1270);' title= 'Buffer this area by 1,000ft'> 1000ft;</a>&nbsp</td>"
			content += "<td style='width:70px'> <a id='lnkBuffer1320' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1676.4);' title= 'Buffer this area by 1/4 of a mile'> 1/4 mile</a>&nbsp</td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; clearBuffer();' title= 'Clear Buffer'>Clear buffers</a></td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; removeBlue();' title= 'Clear Buffer'>Remove boundary from map</a></td></tr></table></div>"
			
			infoTemplate.setContent(content)
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(3);
			map.setExtent(zoomExtent); 
			map.infoWindow.resize(235,230);
		};
		if (theSearchType=="Block") {
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic
			var infoTemplate = new esri.InfoTemplate();	
			infoTemplate.setTitle("${BLOCK}"); 
			var infoTemplate = new esri.InfoTemplate();	
			infoTemplate.setTitle("${blklot}"); 
			content = "<div overflow='auto' >Buffer by:<table border=0 ><tr></td><td style='width:40px'> <a id='lnkBuffer150' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,190.5);' title= 'Buffer this area by 150ft'> 150ft;</a>&nbsp </td>"
			content += "<td style='width:40px'> <a id='lnkBuffer300' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,381);' title= 'Buffer this area by 300ft'> 300ft;</a>&nbsp</td>  "
			content += "<td style='width:50px'> <a id='lnkBuffer1000' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1270);' title= 'Buffer this area by 1,000ft'> 1000ft;</a>&nbsp</td>"
			content += "<td style='width:70px'> <a id='lnkBuffer1320' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1676.4);' title= 'Buffer this area by 1/4 of a mile'> 1/4 mile</a>&nbsp</td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; clearBuffer();' title= 'Clear Buffer'>Clear buffers</a></td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; removeBlue();' title= 'Clear Buffer'>Remove boundary from map</a></td></tr></table></div>"
			infoTemplate.setContent(content)
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(3);
			map.setExtent(zoomExtent); 
			map.infoWindow.resize(235,230);

		};

		if (theSearchType=="Parcel") {
			
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic
			var infoTemplate = new esri.InfoTemplate();	
			
			infoTemplate.setTitle("${blklot}"); 
			content = "<div overflow='auto' >Buffer by:<table border=0 ><tr></td><td style='width:40px'> <a id='lnkBuffer150' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,190.5);' title= 'Buffer this area by 150ft'> 150ft;</a>&nbsp </td>"
			content += "<td style='width:40px'> <a id='lnkBuffer300' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,381);' title= 'Buffer this area by 300ft'> 300ft;</a>&nbsp</td>  "
			content += "<td style='width:50px'> <a id='lnkBuffer1000' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1270);' title= 'Buffer this area by 1,000ft'> 1000ft;</a>&nbsp</td>"
			content += "<td style='width:70px'> <a id='lnkBuffer1320' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1676.4);' title= 'Buffer this area by 1/4 of a mile'> 1/4 mile</a>&nbsp</td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; clearBuffer();' title= 'Clear Buffer'>Clear buffers</a></td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; removeBlue();' title= 'Clear Buffer'>Remove boundary from map</a></td></tr></table></div>"
			
			infoTemplate.setContent(content)
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(3);
			map.setExtent(zoomExtent); 
			map.infoWindow.resize(235,230);

		};
		if (theSearchType=="Permit") {
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic
			var infoTemplate = new esri.InfoTemplate();	
			infoTemplate.setTitle("${APPL_NO}"); 
			content = "<div overflow='auto' >Buffer by:<table border=0 ><tr></td><td style='width:40px'> <a id='lnkBuffer150' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,190.5);' title= 'Buffer this area by 150ft'> 150ft;</a>&nbsp </td>"
			content += "<td style='width:40px'> <a id='lnkBuffer300' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,381);' title= 'Buffer this area by 300ft'> 300ft;</a>&nbsp</td>  "
			content += "<td style='width:50px'> <a id='lnkBuffer1000' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1270);' title= 'Buffer this area by 1,000ft'> 1000ft;</a>&nbsp</td>"
			content += "<td style='width:70px'> <a id='lnkBuffer1320' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1676.4);' title= 'Buffer this area by 1/4 of a mile'> 1/4 mile</a>&nbsp</td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; clearBuffer();' title= 'Clear Buffer'>Clear buffers</a></td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; removeBlue();' title= 'Clear Buffer'>Remove boundary from map</a></td></tr></table></div>"
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(3);
			map.setExtent(zoomExtent); 
			map.infoWindow.resize(235,230);
		};
		if (theSearchType=="Address") {
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic    
			
			var infoTemplate = new esri.InfoTemplate();	
			infoTemplate.setTitle("${ADDRESSSIMPLE}"); 
			content = "<div style='BORDER: #b7d8ed 0px solid;' overflow='auto' >Buffer by:<table border=0 ><tr></td><td style='width:40px'> <a id='lnkBuffer150' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,190.5);' title= 'Buffer this area by 150ft'> 150ft;</a>&nbsp </td>"
			content += "<td style='width:40px'> <a id='lnkBuffer300' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,381);' title= 'Buffer this area by 300ft'> 300ft;</a>&nbsp</td>  "
			content += "<td style='width:50px'> <a id='lnkBuffer1000' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1270);' title= 'Buffer this area by 1,000ft'> 1000ft;</a>&nbsp</td>"
			content += "<td style='width:70px'> <a id='lnkBuffer1320' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1676.4);' title= 'Buffer this area by 1/4 of a mile'> 1/4 mile</a>&nbsp</td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; clearBuffer();' title= 'Clear Buffer'>Clear buffers</a></td></tr>"
			content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; removeBlue();' title= 'Clear Buffer'>Remove boundary from map</a></td></tr></table></div>"
			
			
			infoTemplate.setContent(content)
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(3);
			map.setExtent(zoomExtent); 
			map.infoWindow.resize(235,230);
			

		};
		if (theSearchType=="Neighborhood") {
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic
			var infoTemplate = new esri.InfoTemplate();	
			infoTemplate.setTitle("SFFind"); 
			content = "<table><tr><td><b>Neighborhood: </b></td></tr><tr><td> ${name} </td></tr></table><br><a href='javascript:removeBlue()'>Remove Boundary from Map</a><br><br>"
			infoTemplate.setContent(content)
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(1.5);
			map.setExtent(zoomExtent); 
			map.infoWindow.resize(210,230);
		};
		if (theSearchType=="District") {
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic
			var infoTemplate = new esri.InfoTemplate();	
			infoTemplate.setTitle("SFFind"); 
			content="<table><tr><td><b>Supervisor District ${supervisor}</td></tr><tr><td> ${supname} </td></tr></table><br><a href='javascript:removeBlue()'>Remove Boundary from Map</a><br><br>"
			infoTemplate.setContent(content)
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(1.5);
			map.setExtent(zoomExtent); 	
			map.infoWindow.resize(210,230);
			//map.infoWindow.resize(230,200);
		};

	imidentifying = true;
	
	//Buffer the find result by 0.95ft.  Without doing this the Identify Task will return results for any neighboring feature that shares a boundary with the result 
	//  (e.g. if searched for a parcel will return info for all neighboring parcels).
	//Theoretically could have buffered by a smaller amount but 0.95ft also deals with most digitizing errors (where boundaries should have been snapped together but were not. Anything
	//  larger than 0.95ft risks elimiating the smaller legislative setbacks
	if (isNeighborhood || isDistrict) {
		bufferCurrentOverlays(theRes,-15);
	} else {
		bufferCurrentOverlays(theRes,-0.95);
	}
	

	document.getElementById('ImBusy').style.visibility = 'hidden'; 

	}
    }
   function addCommas(nStr) {
    //function to add convert a number to a currency format
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
   }

   
   function isLayerVisible(theLayerName) {
	//Checks whether a specified layer is turned on (visible on the map) or not - returns true or false.
	   var LayerVis = new Array();
	   LayerVis = dynamicMap.visibleLayers;

		for (i=0; i< dynamicMap.layerInfos.length; i++) {
			if (dynamicMap.layerInfos[i].name == theLayerName)  {
			var tmpLayerList = "+" + LayerVis.join("+") + "+"
			var tmpLayer = "+" + dynamicMap.layerInfos[i].id + "+"

				if  (tmpLayerList.indexOf(tmpLayer) =="-1") {
					return false;
				} else {
					return true;
				}
			}
		}

    }
    function ToggleOnOff(theLayerList, OnOff) {
	    //alert("in toggleOnOff")
	//Switches layers on/off (adds/removes them from the map)
	//alert(theLayerList + "\n"+OnOff)
	// Show the 'busy' icon
	var theX= document.body.clientWidth * 0.2 - 32
	var theY= 0 - (document.body.clientHeight * 0.45)   
	document.getElementById('ImBusy').style.left = theX 
	document.getElementById('ImBusy').style.top = theY 
	document.getElementById('ImBusy').style.visibility = 'visible'; 
	var LayerVis = new Array();

	//LayerVis = dynamicMap.getVisibleLayers();
	LayerVis = dynamicMap.visibleLayers;

	//Get an array of the currently visible layers from which to add or remove.  The array will then be sent back to ArcGIS Server
	var NewLayerVis = new Array();
	NewLayerVis = dynamicMap.visibleLayers;
	for (k=0;k< theLayerList.length;k++) {
		if (theLayerList instanceof Array) {
			theLayer=theLayerList[k]
		} else {
			theLayer = theLayerList
		}
		if (OnOff==false) {
			//switching the layer off
			var NewLayerVis = new Array();
			//deal with either a layer ID number or the name of the layer
			if (IsNumeric(theLayer)) {
				for (i=0; i < LayerVis.length; i++) {
					if (LayerVis[i] != theLayer) {
						//add all layers other than the one we are switching off
						NewLayerVis.push(LayerVis[i]);
					}
				}
			} else {
				for (i=0; i< dynamicMap.layerInfos.length; i++) {
					if (dynamicMap.layerInfos[i].name == theLayer) {
						myID = dynamicMap.layerInfos[i].id;
					}
				}
				for (i=0; i < LayerVis.length; i++) {
					if (LayerVis[i] != myID) {
						//add all layers other than the one we are switching off
						NewLayerVis.push(LayerVis[i]);
					}
				}
			}
		} else { 
			//switching the layer on
			if (IsNumeric(theLayer)) {
				LayerVis.push(theLayer);
			} else {
				for (i=0; i< dynamicMap.layerInfos.length; i++) {
					if (dynamicMap.layerInfos[i].name == theLayer) {
						NewLayerVis.push(dynamicMap.layerInfos[i].id);
					}
				}
			}
		}
		if (theLayerList instanceof Array) {
		} else {
		//exit the loop if its not an array
			break;
		}
	}
	//Send the array of layer IDs that should be visible back to ArcGIS Server
	dynamicMap.setVisibleLayers(NewLayerVis);
	document.getElementById('ImBusy').style.visibility = 'hidden'; 

	if (theLayer=="Schools 1000ft Buffer") {
		//If turning the Parcels on/ff also switch on/off the parcel labels
		if (OnOff) {
			ToggleOnOff("Public School",true)
			ToggleOnOff("Private School",true)
		} else {
			ToggleOnOff("Public School", false)
			ToggleOnOff("Private School", false)
		}
	}
	if (theLayer=="Parcels") {
		//If turning the Parcels on/ff also switch on/off the parcel labels
		if (OnOff) {
			ToggleOnOff("Parcel Labels",true)
		} else {
			ToggleOnOff("Parcel Labels", false)
		}
	}
	if (theLayer=="Zoning - NCDs") {
		//If turning the NCDs on/ff also switch on/off the NCD buffers
		if (OnOff) {
			ToggleOnOff("Within 0.25 miles of",true)
		} else {
			ToggleOnOff("Within 0.25 miles of", false)
		}
	}
	
	if (theLayer=="Zoning - Special Sign Districts") {
		//If turning the SSD's on/ff also switch on/off the Scenic Street SSD's
		if (OnOff) {
			ToggleOnOff("Zoning - SSD Scenic Streets",true)
		} else {
			ToggleOnOff("Zoning - SSD Scenic Streets", false)
		}
		
	}
	if (theLayer=="Transit Routes") {
		//If turning the Parcels on/ff also switch on/off the parcel labels
		if (OnOff) {
			ToggleOnOff("Transit Stops",true)
		} else {
			ToggleOnOff("Transit Stops", false)
		}
	}
	if (theLayer=="City Owned Land") {
		//If turning the Parcels on/ff also switch on/off the parcel labels
		if (OnOff) {
			ToggleOnOff("City Facilities",true)
		} else {
			ToggleOnOff("City Facilities", false)
		}
	}
	//document.getElementById('ImBusy').style.visibility = 'hidden'; 
    }
    

   function is_string(input){    
	return typeof(input)=='string';  
   }
    var addressMarker;
   function showAddress(address) {
	   //alert(document.getElementById("mapContainer").offsetHeight)
	
	   address = address.replace("e.g. ","");
	   theLinkAddress = address
	   theReportTitle = address
	//  This is one of the key functions.  
	//  Takes the contents of the search box, identifies if the text is an address, parcel, block, case or permit and then sends it to ArcGIS Server to search through the appropriate GIS layer.
	//  When gets a response from ArcGIS Server it will then run the findCompleteCallback() function to process the results and compile the reports by comparing the geography of the search will the key GIS layers.
	//  If nothing is found in the GIS layers the function then sends the search string to Google to geocode it.  It will then call identifyClick() which will run as if the user clicked on the map.
	   	   
	//standardize the address string.  Later it will add " San Francisco, CA" to the address string.  This section removes anything similar that the user may have added.
	var re1 = /, SF/gi;
	var re2 = /, San Francisco/gi;
	var re3 = /, California/gi;
	var re4 = /, CA/gi;
	
        address = address.replace(re1, '')
	address = address.replace(re2, '')
	address = address.replace(re3, '')
	address = address.replace(re4, '')

	//Clear any previous report and add Add "please wait" to each of the reports tabs.   
 	//remove anything that may be on the map (previous searches, etc)
	clearMap();
	// Display the 'busy' icon
	var theX= document.body.clientWidth * 0.2 - 32
	var theY= 0 - (document.body.clientHeight * 0.45)   
	document.getElementById('ImBusy').style.left = theX 
	document.getElementById('ImBusy').style.top = theY 
	document.getElementById('ImBusy').style.visibility = 'visible'; 

	//remove special characters from the search text
	address = address.replace(/^\s*/, "").replace(/\s*$/, "");

	//address = address.replace("-","");
	theDashLoc = address.indexOf("-")
	if ( theDashLoc > 0) {
		if (IsNumeric(address.substring(theDashLoc-1,theDashLoc))) {
			address = address.replace("-","");
		}
	}

	if (!isNeighborhood){
		address = address.replace("/","");
	}
	address = address.replace("\\","");
	address = address.replace("%20"," ");

	//searh defaults - search for whatever is in the search box and search as if wildcard before and after the search text
	theSearchString = address
	params.contains=true;

	//Now attempt to find out what they are searching for (block, parcel, case, permit, address, neighborhood, etc).
	if (isNeighborhood==true) {

	} else {
	if (isDistrict==true) {
		

	} else {
	if ((parseInt(address.length)==4) && IsNumeric(address) || ((parseInt(address.length)==5) &! IsNumeric(address.substr(0,5) )) ) {
		//Searching for a BLOCK
		//alert("block")
		theSearchType = "Block"
		theSearchString = address
		//mapExtension.removeFromMap(gOverlays);
		
		//set up the layer and field to search through then execute the find task
		for (i=0; i< dynamicMap.layerInfos.length -1; i++) {
			if (dynamicMap.layerInfos[i].name == "Blocks") {
				params.layerIds = [dynamicMap.layerInfos[i].id];
				params.searchFields = ["BLOCK_NUM"];
				params.outSpatialReference = {"wkid":102113};
				params.returnGeometry = true;
				params.contains = false;
				params.searchText = address.toUpperCase();
				theSearchType = "Block"
				theOrigType="Block"
				
				findTask.execute(params, findCompleteCallback);
				break;
			}
		}
		theSearch="block="+ address;
	} else {
	if ( (address.substr(4,1)!=".") && (parseInt(address.length) > 6) && (parseInt(address.length) < 10) && (IsNumeric(address.substr(0,4) ) )  && (IsNumeric(address.substr(5,2) ) ) )  {
		//Searching for a PARCEL
		
		//mapExtension.removeFromMap(gOverlays);
		for (i=0; i< dynamicMap.layerInfos.length -1; i++) {
			if (dynamicMap.layerInfos[i].name == "Parcels") {
				params.layerIds = [dynamicMap.layerInfos[i].id];
				params.searchFields = ["BLKLOT"];
				params.searchText = address.toUpperCase();
				params.outSpatialReference = {"wkid":102113};
				params.returnGeometry = true;
				params.contains = false;
				theSearchType = "Parcel"
				theOrigType="Parcel"
				//document.getElementById('ImBusy').style.visibility = 'visible'; 
				//alert("about to send to FindTask")
				findTask.execute(params, findCompleteCallback);
				break;
			}
		}
		theSearch="parcel="+ address;

	} else {
		//if ((parseInt(address.length) == 9 || parseInt(address.length) == 8 || parseInt(address.length) == 10) && (address.substr(4,1)==".")) {
		//if (( parseInt(address.length) == 9 && address.substr(4,1)=="." ( || parseInt(address.length) == 8 || (parseInt(address.length) == 7 || parseInt(address.length) == 10) && ((address.substr(4,1)==".") || (address.substr(3,1)==".")) )) {
		//if ((parseInt(address.length) == 9 || parseInt(address.length) == 8 || (parseInt(address.length) == 7 || parseInt(address.length) == 10) && ((address.substr(4,1)==".") || (address.substr(3,1)==".")) )) {		
		if ((parseInt(address.length) == 9 || parseInt(address.length) == 8 || parseInt(address.length) == 7 || parseInt(address.length) == 10) && (address.substr(4,1)=="." || (address.substr(3,1)==".")) ) {		

		//Searching for a CASE
			//if they've added the suffix (e.g. 2011.0218Q), remove it from the search text
			if (address.length==10) {
				address= address.substring(0,9)
			}
			//if they've added the suffix to an older case no (e.g. 1981.334V), remove it from the search text
			if (address.length==9) {
				if (IsNumeric(address.substr(8,1))) {
				} else {
					address= address.substring(0,8)
				}
			}
			address=address.toUpperCase();
			//set up the layer and field to search through then execute the find task
			for (i=0; i< dynamicMap.layerInfos.length -1; i++) {
				if (dynamicMap.layerInfos[i].name == "Planning Cases") {
					params.layerIds = [dynamicMap.layerInfos[i].id];
					params.searchFields = ["CASENO"];
					params.searchText = address;
					params.outSpatialReference = {"wkid":102113};
					params.returnGeometry = true;
					theSearchType = "Case"
					
					theOrigType="Case"
					params.contains=false;
					//Execute the search - sending the search parameters to ArcGIS Server and firing findCompleteCallback when get a response from the ArcGIS Server
					//alert("about to send to find task")
					findTask.execute(params, findCompleteCallback);
					break;
				}
			}
			theSearch="case="+ address;
			theSearchType = "Case";
		//findTask.execute(params, findCompleteCallback);
		} else {	
			//Searching for DBI Building Permit (only works for those recorded since 2000, earlier records had same app num format as blocklot so can't distinguish this from a parcel.
			if ((address.substr(2,1)!=".") &&(parseInt(address.length) > 9) && (IsNumeric(address.substr(0,7))) ) {
				//alert("permit")
				//e.g. 201105025170 
				//mapExtension.removeFromMap(gOverlays);
				//set up the layer and field to search through then execute the find task
				for (i=0; i< dynamicMap.layerInfos.length -1; i++) {
					if (dynamicMap.layerInfos[i].name == "DBI - Building Permits") {
						params.layerIds = [dynamicMap.layerInfos[i].id];
						params.searchFields = ["APPL_NO"];
						params.outSpatialReference = {"wkid":102113};
						params.returnGeometry = true;
						params.searchText = address;
						theSearchType = "Permit"
						theOrigType="Permit"
						params.contains=false;
						//Execute the search - sending the search parameters to ArcGIS Server and firing findCompleteCallback when get a response from the ArcGIS Server
						findTask.execute(params, findCompleteCallback);
						break;
					}
				}
				theSearch="permit="+ address;
			} else {
				//Searching for an address
				//alert(theSearchType)
				if (theSearchType!="Address") {
					//mapExtension.removeFromMap(gOverlays);
					//alert("Address")
					for (i=0; i< dynamicMap.layerInfos.length -1; i++) {
						if (dynamicMap.layerInfos[i].name == "Master Address Database") {
							params.layerIds = [dynamicMap.layerInfos[i].id];
							params.searchFields = ["AddressSimple"];
							params.outSpatialReference = {"wkid":102113};
							params.returnGeometry = true;
							params.contains=false;
							address = address.toUpperCase();
							//standardize the address string to match with MAD format
							address = address.replace("      "," ");
							address = address.replace("     "," ");
							address = address.replace("    "," ");
							address = address.replace("   "," ");
							address = address.replace("  "," ");
							address = address.replace(" 1ST"," 01ST");
							address = address.replace(" FIRST STREET"," 01ST");
							address = address.replace(" FIRST ST"," 01ST");
							address = address.replace(" 2ND"," 02ND");
							address = address.replace(" SECOND"," 02ND");
							address = address.replace(" 3RD"," 03RD");
							address = address.replace(" THIRD"," 03RD");
							address = address.replace(" 4TH"," 04TH");
							address = address.replace(" FOURTH"," 04TH");
							address = address.replace(" 5TH"," 05TH");
							address = address.replace(" FIFTH"," 05TH");
							address = address.replace(" 6TH"," 06TH");
							address = address.replace(" SIXTH"," 06TH");
							address = address.replace(" 7TH"," 07TH");
							address = address.replace(" SEVENTH"," 07TH");
							address = address.replace(" 8TH"," 08TH");
							address = address.replace(" EIGHTH"," 08TH");
							address = address.replace(" 9TH"," 09TH");
							address = address.replace(" NINETH"," 09TH");
							address = address.replace(" TENTH"," 10TH");
							address = address.replace(" ELEVENTH"," 11TH");
							address = address.replace(" TWELTH"," 12TH");
							address = address.replace(" THIRTEENTH"," 13TH");
							address = address.replace(" FOURTEENTH"," 14TH");
							address = address.replace(" FIFTHTEENTH"," 15TH");
							address = address.replace(" SIXTEENTH"," 16TH");
							address = address.replace(" SEVENTEENTH"," 17TH");
							address = address.replace(" EIGHTEENTH"," 18TH");
							address = address.replace(" NINETEENTH"," 19TH");
							address = address.replace(" TWENTIETH"," 20TH");
							address = address.replace(" TWENTY-FIRST"," 21ST");
							address = address.replace(" TWENTYFIRST"," 21ST");
							address = address.replace(" TWENTY-SECOND"," 22ND");
							address = address.replace(" TWENTYSECOND"," 22ND");
							address = address.replace(" TWENTY-THIRD"," 23RD");
							address = address.replace(" TWENTYTHIRD"," 23RD");
							address = address.replace(" TWENTY-FOURTH"," 24TH");
							address = address.replace(" TWENTYFOURTH"," 24TH");
							address = address.replace(" TWENTY-FIFTH"," 25TH");
							address = address.replace(" TWENTYFIFTH"," 25TH");
							address = address.replace(" TWENTY-SIXTH"," 26TH");
							address = address.replace(" TWENTYSIXTH"," 26TH");
							address = address.replace(" TWENTY-SEVENTH"," 27TH");
							address = address.replace(" TWENTYSEVENTH"," 27TH");
							address = address.replace(" TWENTY-EIGHTH"," 28TH");
							address = address.replace(" TWENTYEIGHTH"," 28TH");
							address = address.replace(" TWENTY-NINETH"," 29TH");
							address = address.replace(" TWENTYNINETH"," 29TH");
							address = address.replace(" THIRTIETH"," 30TH");
							address = address.replace(" THIRTY-FIRST"," 31ST");
							address = address.replace(" THIRTYFIRST"," 31ST");
							address = address.replace(" THIRTY-SECOND"," 32ND");
							address = address.replace(" THIRTYSECOND"," 32ND");
							address = address.replace(" THIRTY-THIRD"," 33RD");
							address = address.replace(" THIRTYTHIRD"," 33RD");
							address = address.replace(" THIRTY-FOURTH"," 34TH");
							address = address.replace(" THIRTYFOURTH"," 34TH");
							address = address.replace(" THIRTY-FIFTH"," 35TH");
							address = address.replace(" THIRTYFIFTH"," 35TH");
							address = address.replace(" THIRTY-SIXTH"," 36TH");
							address = address.replace(" THIRTYSIXTH"," 36TH");
							address = address.replace(" THIRTY-SEVENTH"," 37TH");
							address = address.replace(" THIRTYSEVENTH"," 37TH");
							address = address.replace(" THIRTY-EIGHTTH"," 38TH");
							address = address.replace(" THIRTYEITGHTH"," 38TH");
							address = address.replace(" THIRTY-NINETH"," 39TH");
							address = address.replace(" THIRTYNINETH"," 39TH");
							address = address.replace(" FOURTIETH"," 40TH");
							address = address.replace(" FOURTY-FIRST"," 41ST");
							address = address.replace(" FOURTYFIRST"," 41ST");
							address = address.replace(" FOURTY-SECOND"," 42ND");
							address = address.replace(" FOURTYSECOND"," 42ND");
							address = address.replace(" FOURTY-THIRD"," 43RD");
							address = address.replace(" FOURTYTHIRD"," 43RD");
							address = address.replace(" FOURTY-FOURTH"," 44TH");
							address = address.replace(" FOURTYFOURTH"," 44TH");
							address = address.replace(" FOURTY-FIFTH"," 45TH");
							address = address.replace(" FOURTYFIFTH"," 45TH");
							address = address.replace(" FOURTY-SIXTH"," 46TH");
							address = address.replace(" FOURTYSIXTH"," 46TH");
							address = address.replace(" FOURTY-SEVENTH"," 47TH");
							address = address.replace(" FOURTYSEVENTH"," 47TH");
							address = address.replace(" FOURTY-EIGHTH"," 48TH");
							address = address.replace(" FOURTYEIGHTH"," 48TH");
							
							address = address.replace(" STREET"," ST");
							address = address.replace(" PLACE"," PL");
							address = address.replace(" AVENUE"," AVE");
							address = address.replace(" ALLEY"," ALY");
							address = address.replace(" BOULEVARD"," BLVD");
							address = address.replace(" CIRCLE"," CIR");
							address = address.replace(" COURT"," CT");
							address = address.replace(" DRIVE"," DR");
							address = address.replace(" HILL"," HL");
							address = address.replace(" LANE"," LN");
							address = address.replace(" PLAZA","P LZ");
							address = address.replace(" ROAD"," RD");
							address = address.replace(" TERRACE"," TER");
							
							var stTypeExists = "false"
							switch (address.substring(address.length,address.length-3))
							{
							case " ST":
								stTypeExists = "true"
								break;
							case " PL":
								stTypeExists = "true"
								break;
							case " CT":
								stTypeExists = "true"
								break;
							case " DR":
								stTypeExists = "true"
								break;
							case " HL":
								stTypeExists = "true"
								break;
							case " LN":
								stTypeExists = "true"
								break;
							case " RD":
								stTypeExists = "true"
								break;
							}
							
							switch (address.substring(address.length,address.length-4))
							{
							case " AVE":
								stTypeExists = "true"
								break;
							case " ALY":
								stTypeExists = "true"
								break;
							case " CIR":
								stTypeExists = "true"
								break;
							case " PLZ":
								stTypeExists = "true"
								break;
							case " TER":
								stTypeExists = "true"
								break;
							case " WAY":
								stTypeExists = "true"
								break;
							}
							
							switch (address.substring(address.length,address.length-5))
							{
							case " BLVD":
								stTypeExists = "true"
								break;
							}
							//alert(stTypeExists)
							//If the user has not entered a street type switch the search to look though the MAD field that doesn't include street type
							if (stTypeExists=="false") {
								params.searchFields = ["AddressNoTy"];
							}
							//alert(address)
							params.searchText = address ;
							//alert(address)
							//alert(params.searchFields)
							theSearchType = "Address"
							theOrigType="Address"
							//Execute the search - sending the search parameters to ArcGIS Server and firing findCompleteCallback when get a response from the ArcGIS Server
							//alert("About to send to find task")
							findTask.execute(params, findCompleteCallback);
							
							break;
						}
					}
					theSearch="Address="+ address;
				} else {
					var coordArray=address.split(" ")					
					if (coordArray[0].substring(0,3)=="37." && coordArray[1].substring(0,5)=="-122.") {
						searchWithLatLong(coordArray[0],coordArray[1])
					} else {
						theOrigType="Address"
						//alert("using geocoder")
						//Not sure what it is, send it to ESRI to attempt to geocode it. ESRI will return a lat/long, the marker will be placed on the map and the 'identifyClick()' function will be run as if the user clicked on the map.
						//This will only run if it was not identified as a block, lot, case or permit and it didn't find anything in MAD.
						document.getElementById('ImBusy').style.visibility = 'hidden'; 
						address = address + ", San Francisco, CA";
						//address = address + ", San Francisco, CA";
						theSearchType = "Geocode"
						theSearch="geocode="+ address;
						map.graphics.clear();        
						var address2 = {"SingleLine":address};
						locator.outSpatialReference= map.spatialReference;        
						var options = {          
							address:address2,          
							outFields:["Loc_name"]        
							}        
						locator.addressToLocations(options);
					}
					
				}
			}
		}
	}
	}
	}
	}
	//isDistrict=false
	//isNeighborhood=false;
     }
function showGeocodeResults(candidates) {   
//alert("Candidates: " + candidates.length)
	var candidate;
	var bestCandidate;
	var reserveCandidate;
	map.graphics.clear();
	var IDsymbol = new esri.symbol.PictureMarkerSymbol('http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM/images/blue.png', 32, 32).setOffset(0,16);
	var geom;
	for (i=0;i<candidates.length;i++) {
		var candidate = candidates[i]
		//alert(candidates[i].score + "\n" + candidates[i].address + "\n" +candidates[i].attributes.Loc_name)
		if ((candidate.score > 80) && (candidate.attributes.Loc_name=="Gaz.WorldGazetteer.POI1" || candidate.attributes.Loc_name=="USA.StreetAddress")) {   
			bestCandidate = candidate
			break;
		}
		if ((candidate.score > 80) && (candidate.attributes.Loc_name=="Gaz.WorldGazetteer.POI2")) {   
			reserveCandidate = candidate
		}
	}
	if (!bestCandidate) {
		bestCandidate = reserveCandidate
	}
	if (bestCandidate) {
		var attributes = { address: candidate.address, score:candidate.score, locatorName:candidate.attributes.Loc_name };
		geom = candidate.location;
		//var infoTemplate = new esri.InfoTemplate("Location", "Address: ${address}<br />Score: ${score}<br />Source locator: ${locatorName}");
		var infoTemplate = new esri.InfoTemplate();
		infoTemplate.setTitle(candidate.address); 
		content="<table><tr><td>If this isn't the correct location please click the correct location on the map.<br><br>It is important to click inside a property boundary.</td></tr></table>"
		infoTemplate.setContent(content)
		var graphic = new esri.Graphic(geom, IDsymbol, attributes, infoTemplate);
		graphic.setInfoTemplate(infoTemplate);
		theSearchGraphic = graphic
		map.graphics.add(graphic);
		map.centerAndZoom(geom,17);   
		identify(null,geom);
	} else {
		document.getElementById('AssessorReport').innerHTML = instructions
		document.getElementById('ZoningReport').innerHTML = instructions
		document.getElementById('SurveyRatingsReport').innerHTML = instructions
		document.getElementById('CaseTrackingReport').innerHTML = instructions
		document.getElementById('PermitsReport').innerHTML = instructions
		document.getElementById('MiscPermitsReport').innerHTML = instructions
		document.getElementById('EnforcementReport').innerHTML = instructions 
		document.getElementById('AppealsReport').innerHTML = instructions 
		document.getElementById('BBNsReport').innerHTML = instructions 
		alert("Sorry, I can't find '" + theLinkAddress+ "', please check the spelling and try again.")
	}
}
      
function showPermit(address) {
	mapExtension.removeFromMap(gOverlays);
	if (dynamicMap.layerInfos.length > 0) {
		for (i=0; i< dynamicMap.layerInfos.length -1; i++) {
			if (dynamicMap.layerInfos[i].name == "DBI - Building Permits") {
				params.layerIds = [dynamicMap.layerInfos[i].id];
				params.searchFields = ["APPL_NO"];
				params.searchText = address;
				theSearchType = "Permit"
				findTask.execute(params, findCompleteCallback);
				break;
			}
		}
	}
}
function IsNumeric(sText)
{
   var ValidChars = "-0123456789.";
   var IsNumber=true;
   var Char;
   for (i = 0; i < sText.length && IsNumber == true; i++) 
      { 
      Char = sText.charAt(i); 
      if (ValidChars.indexOf(Char) == -1) 
         {
         IsNumber = false;
         }
      }
   return IsNumber;
}

    function doSimplify() {
      geometry.simplify([[ polygon ]], simplifyCallback);
    }

    function simplifyCallback(simplifyResults) {
      //alert("Number of Rings returned by Simplify operation = " + simplifyResults.geometries[0].length);
      //doQuery(simplifyResults.geometries[0]);
    }

    function doQuery(query_geometry) {
      mapExtension.removeFromMap(overlays);
      var query = new esri.arcgis.gmaps.Query();
      query.queryGeometry = query_geometry;
      query.spatialRelationship = esri.arcgis.gmaps.SpatialRelationship.CONTAINS;

      queryTask.execute(query, null, queryCallback);
    }
    function getInternetExplorerVersion()
	// Returns the version of Internet Explorer or a -1
	// (indicating the use of another browser).
	{
	  var rv = -1; // Return value assumes failure.
	  if (navigator.appName == 'Microsoft Internet Explorer')
	  {
	    var ua = navigator.userAgent;
	    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	    if (re.exec(ua) != null)
	      rv = parseFloat( RegExp.$1 );
	  }
	  return rv;
}

function printReports() {
	//var printHTML = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>"
	var printHTML = "<!DOCTYPE html>"
	printHTML +="\n<html lang='en-US'>"
	printHTML +="\n<head>"
	printHTML +="\n<meta charset='UTF-8' />"
	printHTML +='<meta http-equiv="X-UA-Compatible" content="IE=7">'
	printHTML +="\n<LINK REL='SHORTCUT ICON' HREF='http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM/images/bannericonTransSmall.ico'>"
	printHTML +="\n<title>San Francisco Property Information Map - Print Version</title>"
	printHTML +="\n<link rel='stylesheet' href='http://serverapi.arcgisonline.com/jsapi/arcgis/3.3/js/dojo/dijit/themes/claro/claro.css'>"
	printHTML +="\n<link rel='stylesheet' href='http://serverapi.arcgisonline.com/jsapi/arcgis/3.3/js/esri/css/esri.css'>"
	printHTML += "\n<style type='text/css'>"
	printHTML += "\n@media print {"
	printHTML += "\n    .NoPrint {display: none;}"
	printHTML += "\n}"
	printHTML += "\n</style>"
	printHTML +="\n<script>var dojoConfig = {parseOnLoad: true};</script>"
	printHTML +="\n<script src='http://serverapi.arcgisonline.com/jsapi/arcgis/3.3/'></script>"
	printHTML +="\n<script src='js/printable.js'></script>"
	printHTML +="\n\n<script>\n"
	
	MinY = map.extent.ymin 
	MaxY = map.extent.ymax
	MinX = map.extent.xmin 
	MaxX = map.extent.xmax
	centerY = ((MaxY-MinY)/2 )+ MinY
	centerX= ((MaxX-MinX)/2) + MinX
	
	var visLayers = dynamicMap.visibleLayers
	printHTML +="\n    "
	printHTML +="\n    "
	printHTML +="\n    var map;"
	printHTML +="\n    var theArcGISServerName = '" + theArcGISServerName +"';"
	printHTML +="\n    var myGraphic = window.opener.theSearchGraphic";
	printHTML +="\n    var visLayers = [" + visLayers + "]";
	printHTML +="\n    var IEVersion = "+getInternetExplorerVersion()
	var thePointX=null;
	var thePointY=null;
	if (theSearchGraphic.geometry.type=="polygon") {
		var myPolygon = theSearchGraphic.geometry;
		var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), new dojo.Color([100,100,255,0.5]));
		myGraphic = new esri.Graphic(myPolygon, symbol);
		printHTML +="\n    var myGraphic = window.opener.myGraphic";
		theGraphicExtent = myPolygon.getExtent();
		if (navigator.userAgent.indexOf('MSIE')>0) { 
			thePointX = ((theGraphicExtent.xmax - theGraphicExtent.xmin)/2) + theGraphicExtent.xmin
			thePointY = ((theGraphicExtent.ymax - theGraphicExtent.ymin)/2) + theGraphicExtent.ymin
		}
	}
	
	if (theSearchGraphic.geometry.type=="point") {
		var myPoint= theSearchGraphic.geometry;
		var symbol = new esri.symbol.PictureMarkerSymbol('http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM/images/blue.png', 32, 32) 
		myGraphic = new esri.Graphic(myPoint, symbol);
		thePointX = theSearchGraphic.geometry.x
		thePointY = theSearchGraphic.geometry.y
		printHTML +="\n    var myGraphic = window.opener.myGraphic";
	}
	if (theSearchType=="mapClick" || theSearchType=="Geocode") {
		printHTML +="\n    var thePointX = " + theSearchGraphic.geometry.x //theGeom.x
		printHTML +="\n    var thePointX = " + theSearchGraphic.geometry.x //theGeom.y
	}
	printHTML +="\n    var myGeometry = myGraphic.geometry";
	printHTML +="\n    var thelayerIds = ["+params.layerIds+"];"
	printHTML +="\n    var thesearchFields = '" +params.searchFields+"'"
	printHTML +="\n    var thesearchText = '" + params.searchText + "'";
	printHTML +="\n    var thecontains = " +params.contains;
	printHTML +="\n    var theSearchType ='" + theSearchType + "'";
	printHTML +="\n    var graphic";

	var IDsymbol = new esri.symbol.PictureMarkerSymbol('http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM/images/blue.png', 32, 32) //.setOffset(0,16);
	
	printHTML +="\nsetTimeout('init("+centerX +"," + centerY +"," + map.getZoom() + "," + thePointX+"," + thePointY + ");',1250);\n</script>\n"
	
	printHTML +="\n<link href='css/Print.css' type='text/css' rel='stylesheet' media='all' />"
	printHTML +='\n<script type="text/javascript" src="js/printable.js"></script>'
	//printHTML +="\n<script>\nfunction displayPrintReport() {document.getElementById('mapPrintOptions').style.display='none';  document.getElementById('printButton').style.display='inline';}\n</script>"
	printHTML +="\n<script>\nfunction displayPrintReport() {document.getElementById('mapPrintOptions').style.display='none'; }\n</script>"

	printHTML +="\n</head>"
	printHTML +="\n<body class='claro'>"
	printHTML +="\n<table style='width:700px;' id='mapPrintOptions'><tr><td style='width: 15px;'></td><td>"
	printHTML +="\n<span class='NoPrint' style='font-size:20px;' ><p>What do you want to include in your printable report?</p>"
	//printHTML +="\n<table > <tr><td style='font-size:12px;' > Printing works best in Chrome, Firefox or Safari. Some versions of Internet Explorer will not print the map correctly.</td></tr></table><br>"
	printHTML +="\n<table ><tr><td>Map</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'locationmap' + '"' + ")' type='checkbox' checked=true/></td></tr>"
	if (sitename=="SFFIND") {
		printHTML +="<tr><td>Elected Officials Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'property' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="<tr><td>Places & Services Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'zoning' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="<tr><td>Other Information Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'preservation' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		//printHTML +="<tr><td>Info Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'projects' + '"' + ")' type='checkbox' checked=true/></td></tr>"
	} else {
		printHTML +="\n<tr><td>Property Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'property' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="\n<tr><td>Zoning Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'zoning' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="\n<tr><td>Preservation Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'preservation' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="\n<tr><td>Projects Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'projects' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="\n<tr><td>Permits Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'permits' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="\n<tr><td>Other Permits Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'misc' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="\n<tr><td>Complaints Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'complaints' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		printHTML +="\n<tr><td>Appeals Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'appeals' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		if (theLoc=="City") {
			printHTML +="\n<tr><td>BBN Report</td><td> <input onclick='javascript:checkPrintReport(" + '"' +'bbn' + '"' + ")' type='checkbox' checked=true/></td></tr>"
		}
	}	
	printHTML +="\n</table></p></span>"
	printHTML +="\n<button class='NoPrint' onclick='javascript:displayPrintReport()' type='button'>Create Printable Report</button><br><br><br></td></tr>"
	printHTML +="\n"
	printHTML +="\n<tr><td colspan=2 ><span class='NoPrint'><table border=0><tr><td align='middle'> ------------------------ Preview Is Shown Below ------------------------ </td></tr></table><br><br><br><br></td></tr></table>"
	//printHTML +="\n<div class='NoPrint' id='printButton' style='display:none'> <form> <input type='button' value='Print Report' onClick='window.print()'/></form></div>"
	
	
	printHTML +="\n<img src='/PIM/images/LetterHead.png'><br>"
	if (sitename=="SFFIND") {
		printHTML += "\n<span class='printReportTitle' >SF Find - <i>http://propertymap.sfplanning.org?name=sffind</i> </span>"
	} else {
		printHTML += "\n<span class='printReportTitle' >San Francisco Property Information Map - <i>http://propertymap.sfplanning.org</i> </span>"
	}
		
	
	switch(theSearchType)
	{
		case "Address":
			//printHTML += "<p class='reportHeader'>" + theSearchString +"d</p>"
			printHTML += "\n<p class='printReportHeader' >Report for: " + theSearchString + "</p>"
			break;
		case "Geocode":
			printHTML += "\n<p class='printReportHeader' >Report for: " + theReportTitle +"</p>"
			break;
		case "Case":
			printHTML += "\n<p class='printReportHeader' >Report for Planning Department Project: " + theSearchString +"</p>"
			break;
		case "Permit":
			printHTML += "\n<p class='printReportHeader' >Report for Department of Building Inspections Permit: " + theSearchString +"</p>"
			break;
		case "Parcel":
			printHTML += "\n<p class='printReportHeader' >Report for Parcel: " + theSearchString +"</p>"
			break;
		case "Block":
			printHTML += "\n<p class='printReportHeader' >Report for Block: " + theSearchString +"</p>"
			break;
		case "Case Unmapped":
			printHTML += "\n<p class='printReportHeader' >Report for Planning Department Project: " + theSearchString +"</p>"
			break;
		default:
			printHTML += "\n<p class='printReportHeader' >Report for: " + theSearchString +"</p>"
	}
	if (theSearchType!="Case Unmapped") {
		if (lastSearchClick) {
			printHTML +="\n\n<span id='locationmap'><div id='map_canvas' style='width: 650px; height: 400px;BORDER: #b7d8ed 1px solid;'></div><br><br></span>\n"
			printHTML +="\n\n"
		} else {
			printHTML +="\n\n<span id='locationmap'><div id='map_canvas' style='width: 650px; height: 400px;BORDER: #b7d8ed 1px solid;'></div><br><br></span>\n"
			printHTML +="\n\n"
			
		
		}
	}
	//prompt("",printHTML)
	if (sitename=="SFFIND") {
		var theSFFindElectedHtmltoPrint = theSFFindElectedHtml.replace(/class='noprint'/gi,"style='display:none'");
		theSFFindElectedHtmltoPrint = theSFFindElectedHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		//remove the height limitations for the more/less divs
		theSFFindElectedHtmltoPrint = theSFFindElectedHtmltoPrint.replace(/height:110px/gi,"height:''");
		theSFFindElectedHtmltoPrint = theSFFindElectedHtmltoPrint.replace(/height:1365px/gi,"height:''");  //Assessors - internal
		theSFFindElectedHtmltoPrint = theSFFindElectedHtmltoPrint.replace(/height:660px/gi,"height:''");  // Assessors - public
		theSFFindElectedHtmltoPrint = theSFFindElectedHtmltoPrint.replace(/height:275px/gi,"height:''"); //
		theSFFindElectedHtmltoPrint = theSFFindElectedHtmltoPrint.replace(/height:200px/gi,"height:''"); //street sweeping
		//printHTML += "<span id='property'>" + theSFFindElectedHtmltoPrint + "</span>";

		var theSFFindServicesHtmltoPrint = theSFFindServicesHtml.replace(/class='noprint'/gi,"style='display:none'");
		theSFFindServicesHtmltoPrint = theSFFindServicesHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		//remove the height limitations for the more.../less... divs
		theSFFindServicesHtmltoPrint = theSFFindServicesHtmltoPrint.replace(/height:110px/gi,"height:''");
		theSFFindServicesHtmltoPrint = theSFFindServicesHtmltoPrint.replace(/height:1365px/gi,"height:''");
		theSFFindServicesHtmltoPrint = theSFFindServicesHtmltoPrint.replace(/height:660px/gi,"height:''");
		theSFFindServicesHtmltoPrint = theSFFindServicesHtmltoPrint.replace(/height:240px/gi,"height:''");
		theSFFindServicesHtmltoPrint = theSFFindServicesHtmltoPrint.replace(/height:275px/gi,"height:''");
		theSFFindServicesHtmltoPrint = theSFFindServicesHtmltoPrint.replace(/height:200px/gi,"height:''");
		
		//var theSFFindPlacesHtmltoPrint = theSFFindPlacesHtml.replace(/class='noprint'/gi,"style='display:none'");
		//theSFFindPlacesHtmltoPrint = theSFFindPlacesHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		//remove the height limitations for the more.../less... divs
		//theSFFindPlacesHtmltoPrint = theSFFindPlacesHtmltoPrint.replace(/height:110px/gi,"height:''");
		//theSFFindPlacesHtmltoPrint = theSFFindPlacesHtmltoPrint.replace(/height:1365px/gi,"height:''");
		//theSFFindPlacesHtmltoPrint = theSFFindPlacesHtmltoPrint.replace(/height:660px/gi,"height:''");
		//theSFFindPlacesHtmltoPrint = theSFFindPlacesHtmltoPrint.replace(/height:240px/gi,"height:''");
		//theSFFindPlacesHtmltoPrint = theSFFindPlacesHtmltoPrint.replace(/height:275px/gi,"height:''");
		//theSFFindPlacesHtmltoPrint = theSFFindPlacesHtmltoPrint.replace(/height:200px/gi,"height:''");
		
		var theSFFindInfoHtmltoPrint = theSFFindInfoHtml.replace(/class='noprint'/gi,"style='display:none'");
		theSFFindInfoHtmltoPrint = theSFFindInfoHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		//remove the height limitations for the more.../less... divs
		theSFFindInfoHtmltoPrint = theSFFindInfoHtmltoPrint.replace(/height:110px/gi,"height:''");
		theSFFindInfoHtmltoPrint = theSFFindInfoHtmltoPrint.replace(/height:1365px/gi,"height:''");
		theSFFindInfoHtmltoPrint = theSFFindInfoHtmltoPrint.replace(/height:660px/gi,"height:''");
		theSFFindInfoHtmltoPrint = theSFFindInfoHtmltoPrint.replace(/height:240px/gi,"height:''");
		theSFFindInfoHtmltoPrint = theSFFindInfoHtmltoPrint.replace(/height:275px/gi,"height:''");
		theSFFindInfoHtmltoPrint = theSFFindInfoHtmltoPrint.replace(/height:200px/gi,"height:''");
		
		
		printHTML += "<span id='property'>" + theSFFindElectedHtmltoPrint + "</span><span id='zoning'><P>" + theSFFindServicesHtmltoPrint + "</p></span><span id='preservation'><P>"+ theSFFindInfoHtmltoPrint + "</p></span>";
	} else {
		var theAssessorHtmltoPrint = theAssessorHtml.replace(/class='noprint'/gi,"style='display:none'");
		theAssessorHtmltoPrint = theAssessorHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		//remove the height limitations for the more.../less... divs
		theAssessorHtmltoPrint = theAssessorHtmltoPrint.replace(/height:110px/gi,"height:''");
		theAssessorHtmltoPrint = theAssessorHtmltoPrint.replace(/height:1365px/gi,"height:''");
		theAssessorHtmltoPrint = theAssessorHtmltoPrint.replace(/height:660px/gi,"height:''");
		theAssessorHtmltoPrint = theAssessorHtmltoPrint.replace(/height:240px/gi,"height:''");
		theAssessorHtmltoPrint = theAssessorHtmltoPrint.replace(/height:275px/gi,"height:''");
		
		var theZoningHtmltoPrint = theZoningHtml.replace(/class='noprint'/gi,"style='display:none'");
		theZoningHtmltoPrint = theZoningHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var theSurveyRatingsHtmltoPrint = theSurveyRatingsHtml.replace(/class='noprint'/gi,"style='display:none'");
		theSurveyRatingsHtmltoPrint = theSurveyRatingsHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var theMiscPermitsHtmltoPrint = theMiscPermitsHtml.replace(/class='noprint'/gi,"style='display:none'");
		theMiscPermitsHtmltoPrint = theMiscPermitsHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var theCaseTrackingHtmltoPrint = theCaseTrackingHtml.replace(/class='noprint'/gi,"style='display:none'");
		theCaseTrackingHtmltoPrint = theCaseTrackingHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var theEnforcementHtmltoPrint = theEnforcementHtml.replace(/class='noprint'/gi,"style='display:none'");
		theEnforcementHtmltoPrint = theEnforcementHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var thePermitsHtmltoPrint = thePermitsHtml.replace(/class='noprint'/gi,"style='display:none'");
		thePermitsHtmltoPrint = thePermitsHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var theBBNsHtmltoPrint = theBBNsHtml.replace(/class='noprint'/gi,"style='display:none'");
		theBBNsHtmltoPrint = theBBNsHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var theAppealsHtmltoPrint = theAppealsHtml.replace(/class='noprint'/gi,"style='display:none'");
		theAppealsHtmltoPrint = theAppealsHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		var theBBNsHtmltoPrint = theBBNsHtml.replace(/class='noprint'/gi,"style='display:none'");
		theBBNsHtmltoPrint = theBBNsHtmltoPrint.replace(/Step 2. Click the tabs above to view the reports./gi,"");
		
		printHTML += "<span id='property'>" + theAssessorHtmltoPrint + "</span><span id='zoning'><P>" + theZoningHtmltoPrint + "</p></span><span id='preservation'><P>"+ theSurveyRatingsHtmltoPrint + "</p></span><span id='projects'><P>"+ theCaseTrackingHtmltoPrint + "</p></span><span id='permits'><P>"+ thePermitsHtmltoPrint + "</p></span><span id='misc'><P>"+ theMiscPermitsHtmltoPrint + "</p></span><span id='complaints'><P>" + theEnforcementHtmltoPrint + "</p></span><span id='appeals'><P>" + theAppealsHtmltoPrint +"</p></span>";
	}
	printHTML = printHTML.replace(/\*/g, ''); 
	printHTML = printHTML.replace(/Fields marked with an asterisk are only visible to City staff./g,''); 
	printHTML = printHTML.replace(/<br><br>/gi, '<br>'); 

	
	if (theLoc=="City") {
		printHTML += "<span id='bbn'>" +theBBNsHtmltoPrint + "</span>"
	}
	printHTML +="</body>"
	printHTML +="</html>"
	
	OpenWindow=window.open("", "PrintableReport", "height=650, width=750, status=yes, toolbar=yes,scrollbars=yes,menubar=yes,resizable=yes");
	//OpenWindow=window.open("", "newtab", "height=650, width=750,toolbar=yes,scrollbars=yes,menubar=yes, resizable=yes");
	OpenWindow.document.write(printHTML)
	OpenWindow.document.close()
//prompt("",printHTML)
}

function Link() {
	//alert(theLinkAddress)
	var sPath = window.location.pathname;
	var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
	var thedeptparam=""
	var thenameparam=""
	if (dept!="") {
		thedeptparam = "dept=" + dept
	}
	if (sitename!="") {
		thenameparam="&name="+sitename
	}
	//alert(isDistrict)
	//alert(isNeighborhood)
	if (sitename=='SFFIND') {
		if (isDistrict) {
			prompt("Here is your link, you can copy it then paste into a browser or email:","http://propertymap.sfplanning.org/" + sPage + "?"+thedeptparam+thenameparam+"&district="+theLinkAddress)
		} else {
			if (isNeighborhood) {
				prompt("Here is your link, you can copy it then paste into a browser or email:","http://propertymap.sfplanning.org/" + sPage + "?"+thedeptparam+thenameparam+"&neighborhood="+theLinkAddress)
			} else {
				prompt("Here is your link, you can copy it then paste into a browser or email:","http://propertymap.sfplanning.org/" + sPage + "?"+thedeptparam+thenameparam+"&search="+theLinkAddress)
			}
		}
	} else {
		prompt("Here is your link, you can copy it then paste into a browser or email:","http://propertymap.sfplanning.org/" + sPage + "?"+thedeptparam+thenameparam+"&search="+theLinkAddress)
	}
}
     
	

	function addToMap(theLayer) {
		
		for (var i=0; i< theLayer.options.length; i++) {
			if (theLayer.options[i].selected) {
				var theSelectedLayer = theLayer.options[i].value
			}
		}

		var LayerAll = new Array();
		LayerAll  = dynamicMap.layerInfos;
		var theLayerinfostring
		theLayerinfostring = ""
		var theLayerinfostring2
		theLayerinfostring2 = ""
		for (x=0; x < LayerAll.length ;x++){
			theLayerinfostring = theLayerinfostring + x + "  " + LayerAll[x].name + "\n"
			if (x == 65) {
				theLayerinfostring2 = theLayerinfostring
				theLayerinfostring=  ""
			}
			if (LayerAll[x].name == theSelectedLayer) {
				ToggleOnOff(LayerAll[x].name,true)
			}
		}

	}
	function clearMap() {
		//remove all 'Other' layers and switch off the TOC layers
		dynamicMap.setVisibleLayers([9999]);
		map.graphics.clear();
		//if (gOverlays != null) {
		//	mapExtension.removeFromMap(gOverlays);
		//}
		//if (polyline != null) {
		//	gmap.removeOverlay(polyline);
		//}
		//if (polygon !=null) {
		//	gmap.removeOverlay(polygon);
		//}
		//if (addressMarker!=null) {
		//	gmap.removeOverlay(addressMarker)
		//}
		//if (identifyOvs !=null) {
		//	mapExtension.removeFromMap(identifyOvs);
		//}
		//if (buffOvs !=null) {
		//	mapExtension.removeFromMap(buffOvs);
		//}
		//if (marker) {
		//	gmap.removeOverlay(marker);
		//}
		
		//gOverlays = [];
		theSearch = "";
		var arrElements = document.getElementsByTagName("a");
		for (var i=0; i<arrElements.length; i++) {
			//get pointer to current element:
			var element=arrElements[i];
			if (element.innerHTML== "Remove from Map") {
				element.innerHTML="Show on Map"
			}
		}
		//alert("end of clearmap")
	}
	function removeBlue() {
		map.graphics.clear();
		theSearch = "";
	}
	
	function OpenCloseTools() {
		if (document.getElementById('theToolsDIV').style.display == "none") {
			document.getElementById('theToolsDIV').style.display = "inline";
			document.getElementById('lnkTools').innerHTML = "Hide Tools"
		} else {
			document.getElementById('theToolsDIV').style.display = "none";
			document.getElementById('lnkTools').innerHTML = "Tools"
		}
	}
	
	
	
	function roundNumber(num, dec) {
		var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
		return result;
	}

	function enableDrawing() {
		amIMeasuring=true;
		polygon && gmap.removeOverlay(polygon);

		// add a polygon to the map with no vertices
		polygon = new GPolygon([], "#0000FF", 2, 1.0, "#0000FF", 0.5);
		gmap.addOverlay(polygon);

		// register a listener for "endline" event and enable drawing
		GEvent.addListener(polygon, "endline", calculateAreasAndLengths);
		polygon.enableDrawing();
	}
	
	
      
	function calculateAreasAndLengths() {
		var geometryService = new esri.arcgis.gmaps.Geometry("http://" + theServerName + "/arcgis/rest/services/Geometry/GeometryServer");
		
		geometryService.getAreasAndLengths([ [ polygon ] ], displayAreasAndLengths);
		amIMeasuring=false;
	}

	function displayAreasAndLengths(response, error) {
		// Display error message, if any
		if (error) {
			alert("Error " + error.code + ": " + (error.message || (error.details && error.details.join(" ")) || "Unknown error" ));
		return;
		}

		// Display areas and lengths
		theRealArea = (Math.abs(response.areas[0]) / 1.598684333) / 0.09290304
		theRealLength = (response.lengths[0] * 3.2808399) - ((response.lengths[0] * 3.2808399) * 0.21)
		theRealLengthYards = theRealLength/3
		theRealLengthMiles = theRealLength/5280
		theRealAreaAcres = theRealArea / 43560
		theRealAreaMiles = theRealArea / 27878400
		alert("Area: \t\t"+ roundNumber(theRealArea,2)+ " sq ft\n\t\t" + roundNumber(theRealAreaAcres,4) + " acres\n\t\t" + roundNumber(theRealAreaMiles,4) + " miles\n\nPerimeter:\t" + roundNumber(theRealLength,2) + " ft\n\t\t" + roundNumber(theRealLengthYards,3) + " yards\n\t\t" + roundNumber(theRealLengthMiles,3) + " miles");
	}

	function calculateLengths() {
		var geometryServiceLength = new esri.arcgis.gmaps.Geometry("http://" + theServerName + "/arcgis/rest/services/Geometry/GeometryServer");
		geometryServiceLength.getLengths([ [ polyline ] ], displayLengths);
		amIMeasuring=false;
	}

	function displayLengths(response, error) {
		// Display error message, if any
		if (error) {
			alert("Error " + error.code + ": " + (error.message || (error.details && error.details.join(" ")) || "Unknown error" ));
		return;
		}

		// Display lengths
		var thelength
		thelength = (response.lengths[0] * 3.2808399) - ((response.lengths[0] * 3.2808399) * 0.21) 
		thelengthYards = thelength/3
		thelengthMiles = thelength/5280
		alert("Length:\n" + roundNumber(thelength,0)  + " feet\n" + roundNumber(thelengthYards,1) +  " yards\n" + roundNumber(thelengthMiles,3) + " miles" );
	}
	

	function ViewLegend() {
		var LayerVis = new Array();
		LayerVis = dynamicMap.visibleLayers;
		LayerVis.length 
		if (LayerVis.length < 2) {
			alert("The map legend is currently empty.  You need to add something to the map before the legend will display. \n\nDo this by creating a report (Step 1 - Search or Click on a Property) and then clicking a 'MAP' button in the report window.")
		} else {
			LegWin = window.open( "", "thelegend", "width=275,height=325,status,scrollbars,resizable,screenX=20,screenY=40,left=20,top=40");
			LegWin.document.writeln('<html>');
			LegWin.document.writeln('  <head>');
			LegWin.document.writeln('    <title>' + 'The Legend' + '</title>');
			LegWin.document.writeln('  </head>');	
			LegWin.document.writeln('  <BODY onload= "window.focus()">');
			LegWin.document.writeln('    <center>');
			LegWin.document.writeln('      <table>');
			for (i=1; i < LayerVis.length; i++) {
				theLayerID = LayerVis[i]
				LegWin.document.writeln( "        <tr><td><img src='images/Legend/" + dynamicMap.layerInfos[theLayerID].name + ".gif' /></td></tr>")
			}
			LegWin.document.writeln('      </table>')
			LegWin.document.writeln('    </center>')
			LegWin.document.writeln('  </body>')
			LegWin.document.writeln('</html>');
			LegWin.document.close();
		}
	}
	function madeListwider() {
		document.getElementById('items').style.width = 400;
	}
	function bufferCurrentOverlays(theRestmp,theDist) {
		//The results of the Find Task are buffered by 0.95ft before then being sent to the Identify Task (to eliminate neighboring features which share a boundary).  The 
		//  bufferCallback function then deals with the results of the buffer and sends these to the Identify Task
		
		var bufferPolys = [];
		theBufferDist=theDist
		buffParams.distances = [1, theBufferDist];
		var graphic=theRestmp.feature
		bufferPolys.push(graphic.geometry)
		buffParams.geometries = bufferPolys
		
		//should simplify the input polygon here
		//gsvc.simplify([geometry], function(geometries) {          
		//	params.geometries = geometries;          
		//	gsvc.buffer(params, showBuffer);        
		//});
		
		buffParams.unionsResults = true;
		gsvc.buffer(buffParams,buffCallback);
	}

	function buffCallback(results) {
		//alert(imbuffering)
		//Takes the result of the buffer and sends it to the Identify Task
		var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 1), new dojo.Color([100,100,255,0.5]));        
		//check to see if user is running the buffer tool. if not send the result ot the Identify Task
		
		//imbuffering=false;
		if (imbuffering) {
			map.graphics.add(new esri.Graphic(results[1],polygonSymbol));
			imbuffering=false;
		} else {
			imbuffering=false;
			identify("",results[1])    //  [0][0] will return the original polygon
		}
	}
	function simplifyCallback(SimplifyResults) {
		identify("",SimplifyResults.geometries[0]) 
	}
	function clearBuffer() {
		map.graphics.clear()
		map.graphics.add(theSearchGraphic)
	}
	function showHideMap(theID) {
	    //Run when a user clicks on a 'map' button which is used to add or remove a layer form the map
	    //Sets the button to on or off and then calls the ToggleOnOff function which adds or removes the layer from the map
		isLayerVisible(theID)
		if (document.getElementById(theID).alt=="Add to map") {
			ToggleOnOff(theID, true);
			document.getElementById(theID).src = "images/map-icon-on.png"
			document.getElementById(theID).alt = "Remove from map"
			document.getElementById(theID).title = "Remove from map"
		} else {
			ToggleOnOff(theID,false);
			document.getElementById(theID).src="images/map-icon-off.png"
			document.getElementById(theID).alt = "Add to map"
			document.getElementById(theID).title = "Add to map"
		}
	}
	
	function formatCurrency(num) {
		//reformats a number to a currency format
		if (num!=""&& num!="Null" && num!=null && num!="nothing") {
			num = num.toString().replace(/\$|\,/g,'');
			if(isNaN(num))
			num = "0";
			sign = (num == (num = Math.abs(num)));
			num = Math.floor(num*100+0.50000000001);
			cents = num%100;
			num = Math.floor(num/100).toString();
			if(cents<10)
				cents = "0" + cents;
			for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
				num = num.substring(0,num.length-(4*i+3))+','+
				num.substring(num.length-(4*i+3));
			return (((sign)?'':'-') + '$' + num + '.' + cents);
		} else {
			return "-"
		}
	}

	function caseActions(tmpCaseNo, tmpCaseSuffix) {
		//FUNCTION NOT BEING USED
		var tmpID
		for (var i = 0; i < idResults.length; i++) {
			if (idResults[i].layerName=="Case Actions" && idResults[i].feature.attributes["CASENO"]==tmpCaseNo && idResults[i].feature.attributes["SUFFIX"]==tmpCaseSuffix) {
				tmpID = "caseAction"
				document.getElementById("caseAction" + tmpCaseNo + tmpCaseSuffix).innerHTML += "Action: " + idResults[i].feature.attributes["ACTION_DATE"] + ": " + idResults[i].feature.attributes["ACTION"]
			}
		}
	}


function idresultsort(a, b) {
	//sorts the idResults so that they appear in the tabs in the correct order
	//alert(a.layerName+ "\n"+b.layerName)
	//alert("sorting")

	
	if (a.layerName == "Master Address Database" && b.layerName == "Master Address Database") {
		var unitNoA = ""
		unitNoA = a.feature.attributes["UNIT_NUM"];
		switch(unitNoA.length) {
		case 1:
			unitNoA = "000" + unitNoA;
			break;
		case 2:
			unitNoA = "00" + unitNoA;
			break;
		case 3:
			unitNoA = "0" + unitNoA;
			break;			
		}
		var unitNoB = ""
		unitNoB = b.feature.attributes["UNIT_NUM"];
		switch(unitNoB.length) {
		case 1:
			unitNoB = "000" + unitNoB;
			break;
		case 2:
			unitNoB = "00" + unitNoB;
			break;
		case 3:
			unitNoB = "0" + unitNoB;
			break;			
		}
		var d1 = a.feature.attributes["STREETNAME"] + a.feature.attributes["ADD_NUM"] + unitNoA
		var d2 = b.feature.attributes["STREETNAME"] + b.feature.attributes["ADD_NUM"] + unitNoB
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	//if (a.layerName == "Assessor" && b.layerName == "Assessor") {
	//	var d1 = a.feature.attributes["STREET"] + a.feature.attributes["STTYPE"] + a.feature.attributes["LOSTNO"] + a.feature.attributes["UNITNO"];
	//	var d2 = b.feature.attributes["STREET"] + b.feature.attributes["STTYPE"] + b.feature.attributes["LOSTNO"] + b.feature.attributes["UNITNO"] 
	//	if (d1 < d2)
	//	return -1
	//	if (d1 > d2)
	//	return 1
	//	return 0
	//}
	if (a.layerName=="Planning Cases" && 	b.layerName=="Planning Cases") {
		//order cases in descending order of case number and then ascending order of suffix.  Put old style cases starting with letters at bottom (ascending of letter)
		var d1 = a.feature.attributes["CASENO"];
		var d2 = b.feature.attributes["CASENO"];
		if (d1==d2) {
			var s1 = a.feature.attributes["SUFFIX"];
			var s2 = b.feature.attributes["SUFFIX"];
			//alert("d1: " + d1 + "\nd2: "+ d2)
			if (s1<s2)
			return -1
			if (s2<s1)
			return 1
		} else {
			if (IsNumeric(d1.substring(0,1)) && IsNumeric(d2.substring(0,1))==false) {
				return -1
			} else {
				if (IsNumeric(d1.substring(0,1))==false && IsNumeric(d2.substring(0,1))) {
					return 1
				} else {
					if (IsNumeric(d1.substring(0,1))==false && IsNumeric(d2.substring(0,1))==false) {
						if (d1<d2)
						return -1
						if (d2<d1)
						return 1
					} else {
						if (d1>d2)
						return -1
						if (d2>d1)
						return 1
					}
				}
			}
		}
		return 0
	}
	
	if (a.layerName == "Planning Complaints" && b.layerName == "Planning Complaints") {
		var d1 = a.feature.attributes["ID"];
		var d2 = b.feature.attributes["ID"];
		return d2-d1
		
		//if (casenoA > casenoB)
		//return -1
		//if (casenoA < casenoB)
		//return 1
		//return 0
		
		//var complaintFiledA = new Date(a.feature.attributes["DATEFILED"]);
		//var complaintFiledB = new Date(b.feature.attributes["DATEFILED"]);
		
		//if (complaintFiledA > complaintFiledB)
		//return -1
		//if (complaintFiledA < complaintFiledB)
		//return 1
		//return 0
	} 
	if (a.layerName == "Miscellaneous Permits" && b.layerName == "Miscellaneous Permits") {
		var d1 = a.feature.attributes["MPNO"];
		var d2 = b.feature.attributes["MPNO"];
		//return d2-d1
		
		if (d1 > d2)
		return -1
		if (d1 < d2)
		return 1
		return 0
		//var casenoA = new Date(a.feature.attributes["RECEIVED_DATE"] );
		//var casenoB = new Date(b.feature.attributes["RECEIVED_DATE"]);
	
		//if (casenoA > casenoB)
		//return -1
		//if (casenoA < casenoB)
		//return 1
		//return 0
	}
	if (a.layerName=="DBI - Building Permits" && 	b.layerName=="DBI - Building Permits") {
		var d1 = parseInt(a.feature.attributes["APPL_NO"]);
		var d2 = parseInt(b.feature.attributes["APPL_NO"]);
		
		return d2-d1
	}
	if (a.layerName == "Appeals" && b.layerName == "Appeals") {
		var appealFiledA = new Date(a.feature.attributes["HEARING_DATE"]);
		var appealFiledB = new Date(b.feature.attributes["HEARING_DATE"]);
		if (appealFiledA > appealFiledB)
		return -1
		if (appealFiledA < appealFiledB)
		return 1
		return 0
	} 
	if (a.layerName == "Historic Database" && b.layerName == "Historic Database") {
		var d1 = a.feature.attributes["MAPBLKLOT"];
		var d2 = b.feature.attributes["MAPBLKLOT"];
		
		if (d1 < d2) return -1;
		if (d1 > d2) return 1;
		return 0;
	} 
	if (a.layerName == "Survey Ratings" && b.layerName == "Survey Ratings") {
		var d1 = a.feature.attributes["MAPBLKLOT"];
		var d2 = b.feature.attributes["MAPBLKLOT"];

		if (d1 < d2) return -1;
		if (d1 > d2) return 1;

		if (b.feature.attributes["EVAL_DATE"]=='Null') {
			return -1;
		}
		if (a.feature.attributes["EVAL_DATE"]=='Null') {
			return 1;
		}
		var d1 = new Date(a.feature.attributes["EVAL_DATE"]);
		var d2 = new Date(b.feature.attributes["EVAL_DATE"]);

		if (d1 > d2) return -1;
		if (d1 < d2) return 1;
			

		return 0;
	} 

	if (a.layerName == "HRER Decisions" && b.layerName == "HRER Decisions") {
		if (b.feature.attributes["ACTION_DATE"]=='Null') {
			return -1;
		}
		if (a.feature.attributes["ACTION_DATE"]=='Null') {
			return 1;
		}
		var d1 = new Date(a.feature.attributes["ACTION_DATE"]);
		var d2 = new Date(b.feature.attributes["ACTION_DATE"]);
		
		if (d1 > d2) return -1;
		if (d1 < d2) return 1;
		return 0;
	} 
	
	if (a.layerName == "Assessor" && b.layerName == "Assessor") {
		var d1 = a.feature.attributes["STREETNAME"] + a.feature.attributes["LOSTNO"] + a.feature.attributes["UNIT"];
		var d2 = b.feature.attributes["STREETNAME"] + b.feature.attributes["LOSTNO"] + b.feature.attributes["UNIT"] 
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	
	if (a.layerName == "Election Precincts" && b.layerName == "Election Precincts") {
		var d1 = parseInt(a.feature.attributes["PRECNAME"]);
		var d2 = parseInt(b.feature.attributes["PRECNAME"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	if (a.layerName == "Street Sweeping MultiBuffer" && b.layerName == "Street Sweeping MultiBuffer") {
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}

	if (a.layerName == "City Property Multi Buffer - Fire Stations" && b.layerName == "City Property Multi Buffer - Fire Stations") {
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	if (a.layerName == "City Property Multi Buffer - Police Stations" && b.layerName == "City Property Multi Buffer - Police Stations") {
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	if (a.layerName == "City Property Multi Buffer - Libraries" && b.layerName == "City Property Multi Buffer - Libraries") {
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	if (a.layerName == "Open Spaces Quarter Mile Buffer" && b.layerName == "Open Spaces Quarter Mile Buffer") {
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	
	if (a.layerName == "Public Schools 1 Mile Buffer" && b.layerName == "Public Schools 1 Mile Buffer") {
		//alert("here")
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	
	if (a.layerName == "Transit Routes Quarter Mile Buffer" && b.layerName == "Transit Routes Quarter Mile Buffer") {
		//alert("here")
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}
	
	if (a.layerName == "Post Offices 1 Mile Buffer" && b.layerName == "Post Offices 1 Mile Buffer") {
		var d1 = parseInt(a.feature.attributes["BUFF_DIST"]);
		var d2 = parseInt(b.feature.attributes["BUFF_DIST"]);
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}

	if (a.layerName == "Neighborhoods" && b.layerName == "Neighborhoods") {
		var d1 = a.feature.attributes["name"]
		var d2 = b.feature.attributes["name"]
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}

	if (a.layerName == "Off Street Parking MultiRing Buffer" && b.layerName == "Off Street Parking MultiRing Buffer") {

		var d1 = a.feature.attributes["FromBufDst"] //+ a.feature.attributes["address"];
		var d2 = b.feature.attributes["FromBufDst"] //+ b.feature.attributes["address"];
		if (d1 < d2)
		return -1
		if (d1 > d2)
		return 1
		return 0
	}

	return 0
}

function maximizeMap() {
	//expands or contracts the map window
		//alert(theMapSize)
	if (theMapSize=="large") {
		document.getElementById("map_canvas").style.width= "496px";	
		//document.getElementById("mapContainer").style.width= "496px";	
		document.getElementById("dhtmlgoodies_tabView1").style.width= "100%";		
		zoomInDiv.innerHTML = "<img src='http://" + theServerName + "/PIM/images/UpArrow.png' title='Enlarge the Map' alt='Enlarge the Map'>";
		theMapSize="small"
		//var divHeight = document.getElementById("mapContainer").offsetHeight
		//document.getElementById('map_canvas').style.height = divHeight;
		//var divWidth = document.getElementById("mapContainer").offsetWidth;
		//document.getElementById('map_canvas').style.width = divWidth;
		
		window_resize();
	} else {
		if (navigator.userAgent.indexOf('MSIE')>0) { 
			//alert("here")
			document.getElementById("map_canvas").style.width= (viewportwidth - 15) +"px";
			//document.getElementById("mapContainer").style.width= (viewportwidth - 15) +"px";
		} else {
			document.getElementById("map_canvas").style.width= (viewportwidth - 30) +"px";
			//document.getElementById("mapContainer").style.width= (viewportwidth - 30) +"px";
		}
		document.getElementById("dhtmlgoodies_tabView1").style.width= "650px";
		document.getElementById("map_canvas").style.height= (viewportheight - 100) +"px";
		//document.getElementById("mapContainer").style.height= (viewportheight - 100) +"px";

		for (var i = 0; i < (tabNo); i++) {
			document.getElementById("tabViewdhtmlgoodies_tabView1_" + i).style.height= (viewportheight - 5) +"px";
		}
		zoomInDiv.innerHTML = "<img src='http://" + theServerName + "/PIM/images/DownArrow.png' title='Shrink the Map' alt='Shrink the Map'>";
		theMapSize="large"
		window.location.hash="searchbox"; 
		//var divHeight = document.getElementById("mapContainer").offsetHeight
		//document.getElementById('map_canvas').style.height = divHeight;
		//var divWidth = document.getElementById("mapContainer").offsetWidth;
		//document.getElementById('map_canvas').style.width = divWidth;
		//resizeMap(true);
		if (navigator.userAgent.indexOf('MSIE')>0) { 
			setTimeout(resizeMap(true),500);
		} else {
			setTimeout(resizeMap(false),500);
		}
		//window_resize();
	}
	
	//alert("divHeight: "+ divHeight + "divWidth: " + divWidth)
	
}
var tmpZoomLevel=null
function resizeMap(refreshExtent) {
	//alert("resizing map")
	//alert(refreshExtent)
	tmpZoomLevel=map.getLevel()
	map.resize();
	map.reposition();
	if (refreshExtent) {
		//map.graphics.clear()
		setTimeout(refreshMapExtent,500);
	}
	
}
function refreshMapExtent() {
	map.graphics.redraw()
	map.setExtent(map.extent, true);
	map.setLevel(tmpZoomLevel);
	map.graphics.redraw();
	//alert("finished")
}
function googleStreetView(){
	//Opens Google Street View in another window.
	//ArcGIS Server works with Google Mpas API v2 which does not integrate street view into the map, this code adds basic street view functionality (opens a street view window with the view based on the center of the map)
	MinY = map.extent.ymin 
	MaxY = map.extent.ymax
	MinX = map.extent.xmin 
	MaxX = map.extent.xmax
	centerY = ((MaxY-MinY)/2 )+ MinY
	centerX= ((MaxX-MinX)/2) + MinX

	var source = new Proj4js.Proj("EPSG:102113");    //source coordinates will be in Longitude/Latitude
	var dest = new Proj4js.Proj("WGS84");
	var p = new Proj4js.Point(centerX,centerY);   
	Proj4js.transform(source, dest, p); 
	
	if (roundNumber(p.y,3).toString()=='37.779' && roundNumber(p.x,3).toString()=='-122.419') {
		//manual fix for City Hall
		window.open("http://maps.google.com/maps?layer=c&cbll=37.779415,-122.418443&cbp=12,260.19,0,0,0")
	} else {
		window.open("http://maps.google.com/maps?layer=c&cbll=" + p.y+"," + p.x + "&cbp=12,0,0,0,0")
	}
}


function getPDFDoc(url,params) {
	//Ajax code to check whether a document exists on the server.  If it does, return the path.
	var xmlhttp;
	if (window.XMLHttpRequest)
	  {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	  }	else	  {
		// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	 if ((navigator.userAgent.indexOf('Firefox/3.')>0 )) {  
		 //deal with Firefox 3 which has a bug affecting non asynchronous ajax calls
		  xmlhttp.onload=xmlhttp.onerror = xmlhttp.onabort = function() {
			  var value = xmlhttp.responseText
				stringStart=value.indexOf('D:/')
				stringEnd=value.indexOf('</string>')
				if (stringStart!=-1) {
					document.getElementById('Doc1').innerHTML = value.substring(stringStart,stringEnd)

				} else {
					document.getElementById('Doc1').innerHTML = "Not Found"
				}
		  }
	  } else {
		  //deal with all other browsers
		xmlhttp.onreadystatechange= function()
		  {
			// alert(xmlhttp.readyState)
			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				//alert(xmlhttp.responseText)
				var value = xmlhttp.responseText
				stringStart=value.indexOf('D:/')
				stringEnd=value.indexOf('</string>')
				if (stringStart!=-1) {
					document.getElementById('Doc1').innerHTML = value.substring(stringStart,stringEnd)
					//return value.substring(stringStart,stringEnd)
					//alert("found")
				} else {
					document.getElementById('Doc1').innerHTML = "Not Found"
					//alert("not found")
					//return "Not Found"
				}
			}
		  }
	  }
	xmlhttp.open("POST",url,false);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(params);
}

function getLastDBIUpdate() {
	var xmlhttp;
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function()
			{
				if (xmlhttp.readyState==4 && xmlhttp.status==200) {
					var str=xmlhttp.responseText.split(".");//split the string by dot
					//for(var i=0;i<str.length;i++)  {//read the string
						//alert(str[0]);
						LastDBIUpdate = str[0]
						//alert(LastDBIUpdate)
					//}
				}
			}
	xmlhttp.open("GET","http://ec2-50-17-237-182.compute-1.amazonaws.com/LastDBIUpdate/DBI_Last_Update.txt",true);
	xmlhttp.send();
}




function getLocation(url) {
	//alert(url)
	//Ajax code to check where the user is - within the City & County of San Francisco's network, or not.
	//SF City IP addresses are in the range of 208.121.0.0 to 208.121.255.255
	theLoc = "Out of City"
	var city=false;
	var xmlhttp;
		
	if (window.XMLHttpRequest)
	  {// code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
	  }
	else
	  {// code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xmlhttp.onreadystatechange= function()
	  {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			var value = xmlhttp.responseText
			//DPH: 10.83.40.x; 10.83.41.x; 10.83.42.x; 10.83.43.x
			if (value.indexOf('>208.121.')>0 || value.indexOf('>166.137.186.110<')>0 || value.indexOf('>24.7.113.168<')>0 || value.indexOf('>10.83.40.')>0 || value.indexOf('>10.83.41.')>0 || value.indexOf('>10.83.42.')>0 || value.indexOf('>10.83.43.')>0 || value.indexOf('>50.161.67.212<')>0) {
				city=true;
			}
			if (sitename!="SFFIND") {
				if (city && dept=="PLANNING") {
					document.getElementById('mapTitle').innerHTML = "San Francisco Property Information Map - Internal Version"
					theLoc = "City"
					theLocMaster="City"
				} else {
					document.getElementById('mapTitle').innerHTML = "San Francisco Property Information Map"
					theLoc = "Out of City"
					theLocMaster="Out of City"
					//if (value.indexOf('>10.19.53')!=-1) {
					//	document.getElementById('mapTitle').innerHTML = "San Francisco Property Information Map - Internal Version"
					//	theLoc = "City"
					//	theLocMaster="City"
					//}
				}
			}
		}
	  }
	xmlhttp.open("POST",url,false);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(params);
}

function publicVersion() {
	//Allows City worker to view public version of the website
	//alert("theLocMaster: " + theLocMaster + "\n" + "theLoc: " + theLoc)
	if (theLocMaster=="City") {
		if (theLoc=="City" && dept=="PLANNING") {
			theLoc="Out of City"
			document.getElementById('mapTitle').innerHTML = "San Francisco Property Information Map"
			window_resize()

		} else {
			theLoc="City"
			document.getElementById('mapTitle').innerHTML = "San Francisco Property Information Map - Internal Version"	

			window_resize()
			}
	}
}






function in_array(needle, haystack){     
	var found = 0;     
	for (var i=0, len=haystack.length;i<len;i++) {         
		if (haystack[i] == needle) return true;             
			found++;     
	}     
	return false; 
}


	
	
function updatePropertyHtml() {
	
	//Green Connections
	theNum=0
	if (isLayerVisible("Green Connections")) {
		theAssessorHtml += "<br><table width='100%'><tr><td align='left'><span class='reportSectionHead'>GREEN CONNECTIONS: </span><input class='NoPrint' onclick='showHideMap( " + '"Green Connections"' + ");' title = 'Remove from map' alt='Remove from map' style= 'vertical-align: middle;' id='Green Connections' type='image' src = 'images/map-icon-on.png' /></td><td align='right'>&nbsp &nbsp</td></tr></table>"
	} else {
		theAssessorHtml += "<br><table width='100%'><tr><td align='left'><span class='reportSectionHead'>GREEN CONNECTIONS: </span><input class='NoPrint' onclick='showHideMap( " + '"Green Connections"' + ");' title = 'Add to map' alt='Add to map' style= 'vertical-align: middle;' id='Green Connections' type='image' src = 'images/map-icon-off.png' /></td><td align='right'>&nbsp &nbsp</td></tr></table>"
	}
	for (var i = 0; i < idResults.length; i++) {
		var result = idResults[i];		
		if (dynamicMap.layerInfos[result.layerId].name == "Green Connections") {
			if (result.feature.attributes["GC_RT_NUM8"] != null) {
				theNum = theNum + 1
				theAssessorHtml += "<table class='reportData'><tr><td style='width:15px'></td><td>" + result.feature.attributes["GC_RT_NME8"]  + " (No. " +  result.feature.attributes["GC_RT_NUM8"] + ")</td></tr></table>"
			}
		}
	}
	if (theNum==0) {
		theAssessorHtml += "<table class='reportData' style='width:100%;'><tr><td style='width:15px'></td><td style='width:150px'>None </td><td></td></tr></table>"
	}		
		
		
	//Habitats
	theNum=0
	if (isLayerVisible("Habitats Merged")) {
		theAssessorHtml += "<br><table width='100%'><tr><td align='left'><span class='reportSectionHead'>HABITATS: </span><input class='NoPrint' onclick='showHideMap( " + '"Habitats Merged"' + ");' title = 'Remove from map' alt='Remove from map' style= 'vertical-align: middle;' id='Habitats Merged' type='image' src = 'images/map-icon-on.png' /></td><td align='right'>&nbsp &nbsp</td></tr></table>"
	} else {
		theAssessorHtml += "<br><table width='100%'><tr><td align='left'><span class='reportSectionHead'>HABITATS: </span><input class='NoPrint' onclick='showHideMap( " + '"Habitats Merged"' + ");' title = 'Add to map' alt='Add to map' style= 'vertical-align: middle;' id='Habitats Merged' type='image' src = 'images/map-icon-off.png' /></td><td align='right'>&nbsp &nbsp</td></tr></table>"
	}
	var theSQL = "";
	for (var i = 0; i < idResults.length; i++) {
		var result = idResults[i];	
		if (dynamicMap.layerInfos[result.layerId].name == "Habitats Merged") {
			if (result.feature.attributes["Habitat"] != null) {
				//alert("found one")
				theNum = theNum + 1
				theAssessorHtml +="<table class='reportData'><tr><td style='width:15px'></td><td>" + result.feature.attributes["Habitat"] + "</td></tr></table>"
				if (theSQL.length==0) {
					theSQL += '"Plant_Communities"' +  "like '%" + result.feature.attributes["Habitat"] +"%'"
				} else {
					theSQL += " or " + '"Plant_Communities"' +  " like '%" + result.feature.attributes["Habitat"] +"%'"
				}
			}
		}
	}
	if (theNum==0) {
		theAssessorHtml += "<table class='reportData' style='width:100%;'><tr><td style='width:15px'></td><td style='width:150px'>None </td><td></td></tr></table>"
	}
	//alert(theSQL)	
	

	//theAssessorHtml +='<input type="text" id="stateName" value="' + theSQL + '">'
	//theAssessorHtml +='<input id="execute" type="button" value="Get Details">'
	theAssessorHtml +='<br />'
	theAssessorHtml +='<br />'
        theAssessorHtml +='<div id="info" style="padding:5px; margin:5px; background-color:#eee;">'
	theAssessorHtml +='</div>'
	theAssessorHtml +='<div id="info" style="padding:5px; margin:5px; background-color:#eee;"></div>'

	
		
	theAssessorHtml = theAssessorHtml.replace(/Null/gi,"&nbsp");
	theAssessorHtml = theAssessorHtml.replace(/undefined/gi,"&nbsp");
	//add some room to the bottom of the report
	theAssessorHtml += "<p class='NoPrint'><br></p>"
	theAssessorHtml += "<div class='NoPrint'><table class='reportData' style='width:100%;'><tr><td style='width:15px'></td><td style='width:150px'><a href='javascript:void(0);' onclick='javascript:window.location=\"#BookmarkPropertyTop\"; window.location.hash=\"\";'>back to top </a></td><td></td></tr></table></div>"
	theAssessorHtml += "<div class='Noprint'><table style='height: 700px;'><tr><td></td></tr></table></div>"
	
	//publish the HTML to the page
	document.getElementById('AssessorReport').innerHTML = theAssessorHtml
	
	
	var queryTask, query;
	require(["esri/tasks/query", "esri/tasks/QueryTask","dojo/dom", "dojo/on", "dojo/domReady!"], function(Query, QueryTask,dom, on){
		var theTable=theArcGISServerName + "/11"
		//alert(theTable)
		queryTask = new QueryTask(theTable) //new QueryTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5");

		query = new Query();
		query.returnGeometry = false;
		query.outFields = ["Latin_Name","Common_Name","Plant_Communities"];

		//on(dom.byId("execute"), "click", execute);

		function execute() {
		  //query.text = dom.byId("stateName").value;
		//theSQL = '"Plant_Communities"' +  "like '%Dunes%'"
		query.where = theSQL
		//alert(query.text)
		  //execute query
		  queryTask.execute(query, showResultsQuery);
		}

		function showResultsQuery(results) {
		  var s = "";
		  //alert("here")
		  //alert(results.features.length)
		  s = s + "<b>" + results.features.length + "</b> plants found for "+theSearchString+ "<br><br>";
		  for (var i=0, il=results.features.length; i<il; i++) {
		    var featureAttributes = results.features[i].attributes;
		    for (att in featureAttributes) {
		      s = s + "<b>" + att + ":</b>  " + featureAttributes[att] + "<br>";
		    }
		    s = s + "<br>";
		  }
		  dom.byId("info").innerHTML = s;
		}
		execute()
	});
	

	
}


	
	




function expand(id,id2,pixHeight) {
	document.getElementById(id2).innerHTML = "<table class='NoPrint'><tr><td style='width:15px'></td><td><a href='javascript:void(0);' onclick='contract(\"" + id + "\",\"" +id2+"\",\"" + pixHeight +"\");'>less...</a></td></tr></table>"
	document.getElementById(id).style.height=""
}
function contract(id,id2,pixHeight) {
	document.getElementById(id2).innerHTML = "<table class='NoPrint'><tr><td style='width:15px'></td><td><a href='javascript:void(0);' onclick='expand(\"" + id + "\",\"" + id2+"\",\"" + pixHeight+"\");'>more...</a></td></tr></table>"
	document.getElementById(id).style.height=pixHeight
}

function jumpToBookmark(bookMark) {
	//alert(bookMark)
	window.location.hash=bookMark
}