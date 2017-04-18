/************************************************************************************************************

Title:		SF Plant Finder
Author: 	Mike Wynne (mike.wynne@sfgov.org)
		City & County of San Francisco Planning Department
Created:	August 2014
Description:	Searches for an address, parcel or place name and returns a list of plants that are suitable to be grown at that location.
		The site is based on the San Francisco Property Informatio Map.
Technology:	
		HTML
		Javascript
		ArcGIS Server Javascript API v3.5
		ArcGIS Server REST API
		.net web services
		Ajax
		IIS 7
		Hosted on Amazon Cloud (Amazon Web Services)
		
************************************************************************************************************/
 
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
var theBufferDist = null;
var imbuffering = false;
var imidentifying = false;
var findResults = [];
var theSearchType = null;
var theSearchString = null;
var qtask = null;
var query = null;
var clicked = null;
var theClickedCoord = null;
var marker = null;
var overlay = null;
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
var theNeighborhood = "";
var isNeighborhood = false;
var isDistrict = false;
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
var theYearBuilt = "";
var theMapSize = "small";
var theServerName = window.location.host;
//var theServerName = "cp-gis-svr3";
//var theArcGISServerName = "http://" + theServerName + ":6080/arcgis/rest/services/PlantSFv3/MapServer";
//var theArcGISServerName = "http://" + theServerName + "/arcgis/rest/services/PlantSFv4/MapServer";
// var theArcGISServerName = "http://cp-gis-svr3:6080/arcgis/rest/services/PlantSFv3/MapServer"
var theArcGISServerName = "http://50.17.237.182/arcgis/rest/services/PlantSFv4/MapServer";
var thefindResults = null;
var theNum;
var theAddressLot = "";
var themapblklot = "";
var theLinkAddress = "";
var tabNo = 0;
var lastSearchClick = false;
var theGeometry = null;
var polygonBounds = null;
var theGeometries = null;
var theReportTitle = null;
var theXWGSAux = null;
var theYWGSAux = null;
var coordProjected = false;
	
//Set up variables to be used to check if the user is within CCSF network or not and which dept
var theLoc = "Out of City";
var theLocMaster = "Out of City";
var dept = "";
var sitename = "";
var theOrigType = "";
var thetempAddress = "";

var projHash = {};
var theRes;
var theSearchGraphic = null;
var theGeom;
var tabsReady = false;
var tb =  null;
var lengthParams = null;
var resizeTimer;
var withlatlong = false;
var theBM = null;
var queryTask;
var query;
var thePlantResults = null;
var theSQL = null;
var theBaseSQL = null;
var theLastSearchHTML = null;
var thegreenConnectionsHtml = null;
var locator = null;
var theLastSummary = null;
var plantToLoad = null;
var address = null;
var theDIVLoc = 0;
var placeToLoad=""

var thePlantListHtmlToPrint = "";
var thePlantDetailHtmlToPrint = "";
var theEnglishFilter=""
var communityToLoad=""
var nurseryToLoad=""
var searchingForNursery=false;

var plantListArray = new Array()

//function getPos(el) { 
    // yay readability 
//    for (var lx=0, ly=0; 
//         el != null; 
//         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent); 
//    return {x: lx,y: ly}; 
//} 

function initialize() {
	//Runs when page initially loads (from the html <body> onLoad event)
	plantToLoad = gup("plant").toUpperCase();
	plantToLoad = plantToLoad.replace(/\+/g, " ");
	placeToLoad = gup("place").toUpperCase();
	placeToLoad = placeToLoad.replace(/\+/g, " ");
	
	communityToLoad = gup("community").toLowerCase();
	communityToLoad = communityToLoad.replace(/\+/g, " ");
	
	nurseryToLoad = gup("nursery")
	nurseryToLoad = nurseryToLoad.replace(/\+/g, " ");
	
	//alert(plantToLoad)
	    
	//Set up the ArcGIS server dynamic map service
	
	var imageParams = new esri.layers.ImageParameters();
	imageParams.layerIds = [9999];
	//imageParams.layerOption = "show"
	imageParams.transparent = true;
	dynamicMap = null;

	dynamicMap = new esri.layers.ArcGISDynamicMapServiceLayer(theArcGISServerName, {"opacity":0.75, "imageParameters":imageParams});
        dynamicMap.setVisibleLayers([9999]);
	map.addLayer(dynamicMap);

	
	findTask = new esri.tasks.FindTask(theArcGISServerName);
	//Set up the ArcGIS Server Identify Task
	identifyTask = new esri.tasks.IdentifyTask(theArcGISServerName);
	
	//identify proxy page to use if the toJson payload to the geometry service is greater than 2000 characters.
	//esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";        
	esri.config.defaults.io.proxyUrl = "/proxy/proxy.ashx";	
	//esri.config.defaults.io.proxyUrl = "../proxy/proxy.ashx";	
	
	esri.config.defaults.io.alwaysUseProxy = false;
	gsvc = new esri.tasks.GeometryService("http://50.17.237.182/arcgis/rest/services/Geometry/GeometryServer");
	//gsvc = new esri.tasks.GeometryService("http://" + theServerName + ":6080/arcgis/rest/services/Geometry/GeometryServer");
	//gsvc = new esri.tasks.GeometryService("http://" + theServerName + "/arcgis/rest/services/Geometry/GeometryServer");
	//prompt("",gsvc)
	//Set up the buffer parameters for later use
	buffParams = new esri.tasks.BufferParameters();
	buffParams.unit = esri.tasks.GeometryService.UNIT_FOOT
	buffParams.unionResults = true;
	
	dojo.connect(map, "onClick", onMapClick)
	locator = new esri.tasks.Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/");        
	//dojo.connect(locator, "onAddressToLocationsComplete", showGeocodeResults);
	//Creates a variable to hold the ArcGIS Server Find Task's parameters
	//params = new esri.arcgis.gmaps.FindParameters();
	params = new esri.tasks.FindParameters();
	if (plantToLoad != "")  {
		dojo.connect(dynamicMap, "onLoad", function(){ 
			whenMapReadyRunSearch(theSearchString);
		});
	}
	if (placeToLoad != "")  {
		dojo.connect(dynamicMap, "onLoad", function(){ 
			whenMapReadyRunPlaceSearch();
		});
	}
	
	if (communityToLoad != "")  {
		dojo.connect(dynamicMap, "onLoad", function(){ 
			whenMapReadyRunCommunitySearch();
		});
	}
	if (nurseryToLoad != "")  {
		dojo.connect(dynamicMap, "onLoad", function(){ 
			whenMapReadyRunNurserySearch();
		});
	}
	
	//dojo.connect(gsvc, "onLengthsComplete", outputDistance)
	//alert("finished init")
	window.onresize = function(event) {
		map.resize();
		map.reposition();
	};
}

function whenMapReadyRunSearch(){
	if (map.loaded && dynamicMap.loaded) {
		loadOnePlant();
	} else {
		setTimeout('whenMapReadyRunSearch();',100)
	}
}

function whenMapReadyRunPlaceSearch(){
	if (map.loaded && dynamicMap.loaded) {
		clicked=false; 
		theSearchType=null; 
		isNeighborhood=false; 
		isDistrict=false; 
		document.getElementById('addressInput').value=placeToLoad
		showAddress(placeToLoad);
		placeToLoad=""
	} else {
		setTimeout('whenMapReadyRunPlaceSearch();',100)
	}
}

function whenMapReadyRunNurserySearch(){
	
	if (map.loaded && dynamicMap.loaded) {
		searchingForNursery=true
		queryPlant(nurseryToLoad)
	} else {
		setTimeout('whenMapReadyRunNurserySearch();',100)
	}
}

function whenMapReadyRunCommunitySearch(){
	
	if (map.loaded && dynamicMap.loaded) {
		switch (communityToLoad.toUpperCase()) {
			case "HABITAT":
				showAddress('HABITAT')
				break;
			case "SHADYCLAY":
				showAddress('SHADYCLAY')
				break;
			case "SANDYSOIL":
				showAddress('SANDYSOIL')
				break;
			case "POLLINATOR":
				showAddress('POLLINATOR')
				break;
			case "URBANFORESTCOUNCILSTREETTREELIST":
				showAddress('URBANFORESTCOUNCILSTREETTREELIST')
				break;
			case "SIDEWALKLANDSCAPING":
				showAddress('SIDEWALKLANDSCAPING')
				break;
			case "STORMWATER":
				showAddress('STORMWATER')
				break;
			case "SUPER60":
				showAddress('SUPER60')
				break;
			case "THRIFTY150":
				showAddress('THRIFTY150')
					break;
			case "TOP20":
				showAddress('TOP20')
					break;
			case "CHAPARRAL":
				queryPlant('chaparral');
					break;
			case "COASTALSCRUB":
				queryPlant('coastalScrub');
					break;
			case "DUNES":
				queryPlant('dunes');
					break;
			case "GRASSLANDPRAIRIE":
				queryPlant('grasslandPrairie');
					break;
			case "RIPARIAN":
				queryPlant('riparian');
					break;
			case "WETLAND":
				queryPlant('wetland');
					break;
			case "WOODLAND":
				queryPlant('woodland');
					break;
			case "ALL":
				showAddress('ALL')
					break;
			case "":
				showAddress("ALL")
				break;
			default:
				queryPlant(communityToLoad)
		}
	} else {
		setTimeout('whenMapReadyRunCommunitySearch();',100)
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
	amIMeasuring = false;
	lastResult = result.lengths[0]
}

function onMapClick(evt) { 
	map.infoWindow.hide();
        //$("#plantInfo").slideUp("slow");
	$("#plantInfo").slideUp(1000);
	theSearchType = "mapClick"
	theOrigType = "mapClick"
	theSearchString = ""
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
			theSearchString = "Latitude: " + roundNumber(p.y,4) + " Longitude: " + roundNumber(p.x,4)
			theLinkAddress = roundNumber(p.y,5)  + " " + roundNumber(p.x,5)
		}
		//clearMap();
		map.graphics.clear();
		var IDsymbol = new esri.symbol.PictureMarkerSymbol('images/greenMarker.png', 32, 32).setOffset(0,16);
		var graphic = new esri.Graphic(theGeom, IDsymbol);
		theSearchGraphic = graphic
		map.graphics.add(graphic);
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		//document.getElementById('info').innerHTML = "<table  border=0 align=middle width=100%><tr><td align=middle width=100%><big><big><br><br><b>Please wait, generating report </b></big></big> <img src='http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM/images/loader_Dots.gif'></td></tr></table>"
	}
	clearCheckboxes(); 
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
		//alert(latLng.x)
		if (clicked &&(latLng.x < -13638091 || latLng.x > -13620761 || latLng.y > 4556181 || latLng.y < 4538163)){
			//document.getElementById('AssessorReport').innerHTML = instructions 
			//alert("You clicked outside San Francisco.\n\nPlease search for properties in San Francisco.")
			var theTitle="You Clicked Outside San Francisco"
			var theMessage = "This is a plant database for San Francisco microclimates and plant communities. Please click on a location within San Francisco."
			
			new Messi(theMessage, {title: theTitle, modal: true, titleClass: 'info', buttons: [{id: 0, label: 'OK'}]});
			return;
		}
		
		//if (clicked &&(latLng.x < -13638091 || latLng.x > -13620761 || latLng.y > 4556181 || latLng.y < 4538163)){
			
			
		//	return;
		//}
		
		
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
			case "Habitat_Labels":
				break;
			
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

	identifyTask.execute(identifyParameters, function(response) {
		
			//fill the idResults array with the results
			idResults = response;
			//alert("No. of results: " + idResults.length)
			 //order the results so that they display in correct order in the tabs (orders by case number, address, misc permit number, etc)
			//Chrome bug results in the sort failing in Chrome - Chrome uses a different sort algorithm which is "unstable" 
			 //idResults.sort(idresultsort)
			 iPadText=""
			 if (iPadUser || iPhoneUser || iPodUser) {
				if ((navigator.userAgent.indexOf('OS_4') >0) || (navigator.userAgent.indexOf('OS_3') >0) || (navigator.userAgent.indexOf('OS_2') >0)) {
					iPadText="<font class='NoPrint'>Use 2 fingers to scroll down reports.<br><br></font>"
				}
			}
			 printLink = "" //" <a class='NoPrint' style='float:right; font-size: 14px; font-family:Arial, Helvetica, sans-serif; color: #33b5ff; text-decoration: underline;' href='javascript: printReports();'> Printable Version of Reports</a>"
			
			//start to populate the variables with the HTML that will later be used to populate the report tabs
			//the iPadText is instructions for iPhone, iPod and iPad users to help them scroll through the reports.   Other users will not see this text.
				
			//theAssessorHtml = printLink + "<a name='BookmarkPropertyTop'/><div class='searchPaneSectionHeader'> " + iPadText +"</div><div class='reportHeader'><span style='color: #0099ff;'>Plant List For:  </span><span style='color: #000000;'>" + theSearchString + "</span></div><br>"
			document.getElementById('Intro').style.display='none';
			document.getElementById('floatingDivForFilter').style.display='inline';
			document.getElementById('printResultsLink').style.visibility="visible"
			
			updatePlantListHtml();
			//$("#plantInfo").slideUp("slow");
			$("#plantInfo").slideUp(1000);
		//},taskError);
		});
	
}

function idresultsort(a, b) {
	//sorts the query task results array so that they appear in the tabs in the correct order
	var d1 = a.attributes["Latin_Name"];
	var d2 = b.attributes["Latin_Name"];
	if (d1 < d2)
	return -1
	if (d1 > d2)
	return 1
	return 0
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
	//console.log("findCompleteCallback")
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
				alert("Sorry, I can't find '" + theSearchString + "'" + ", please try again.");     
				
			}
	} else {
		
		//Get the bounds of the geometry of the find result.  We will then zoom the map to those bounds.  Get the first geometry object then loop through others if its a multipart polygon.
		theGeometries=theRes.feature.geometry
		theGeometry = theRes.feature.geometry; 
		//var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), new dojo.Color([100,100,255,0.5]));        
		var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([105,159,55]), 5), new dojo.Color([159,180,103,0.65]));        

		//Set up a very basic info window that will open if they click on the result on the map

		if (theSearchType=="Parcel") {
			
			imbuffering=false; 
			map.graphics.clear();
			var graphic =theRes.feature
			graphic.setSymbol(polygonSymbol);
			theSearchGraphic = graphic
			var infoTemplate = new esri.InfoTemplate();	
			
			infoTemplate.setTitle("${blklot}"); 
			
			//content = "<div overflow='auto' >Buffer by:<table border=0 ><tr></td><td style='width:40px'> <a id='lnkBuffer150' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,190.5);' title= 'Buffer this area by 150ft'> 150ft;</a>&nbsp </td>"
			//content += "<td style='width:40px'> <a id='lnkBuffer300' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,381);' title= 'Buffer this area by 300ft'> 300ft;</a>&nbsp</td>  "
			//content += "<td style='width:50px'> <a id='lnkBuffer1000' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1270);' title= 'Buffer this area by 1,000ft'> 1000ft;</a>&nbsp</td>"
			//content += "<td style='width:70px'> <a id='lnkBuffer1320' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1676.4);' title= 'Buffer this area by 1/4 of a mile'> 1/4 mile</a>&nbsp</td></tr>"
			//content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; clearBuffer();' title= 'Clear Buffer'>Clear buffers</a></td></tr>"
			//content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; removeBlue();' title= 'Clear Buffer'>Remove boundary from map</a></td></tr></table></div>"
			content="&nbsp;"
			infoTemplate.setContent(content)
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
			//content = "<div style='BORDER: #b7d8ed 0px solid;' overflow='auto' >Buffer by:<table border=0 ><tr></td><td style='width:40px'> <a id='lnkBuffer150' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,190.5);' title= 'Buffer this area by 150ft'> 150ft;</a>&nbsp </td>"
			//content += "<td style='width:40px'> <a id='lnkBuffer300' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,381);' title= 'Buffer this area by 300ft'> 300ft;</a>&nbsp</td>  "
			//content += "<td style='width:50px'> <a id='lnkBuffer1000' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1270);' title= 'Buffer this area by 1,000ft'> 1000ft;</a>&nbsp</td>"
			//content += "<td style='width:70px'> <a id='lnkBuffer1320' href ='#Buffer' onclick='imbuffering=true; bufferCurrentOverlays(theRes,1676.4);' title= 'Buffer this area by 1/4 of a mile'> 1/4 mile</a>&nbsp</td></tr>"
			//content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; clearBuffer();' title= 'Clear Buffer'>Clear buffers</a></td></tr>"
			//content += "<tr><td colspan=4><a id='lnkClearBuffer' href ='#Buffer' onclick='imbuffering=true; removeBlue();' title= 'Clear Buffer'>Remove boundary from map</a></td></tr></table></div>"
			
			content="&nbsp;"
			infoTemplate.setContent(content)
			graphic.setInfoTemplate(infoTemplate);
			map.graphics.add(graphic);
			zoomExtent = graphic.geometry.getExtent().expand(3);
			map.setExtent(zoomExtent); 
			map.infoWindow.resize(235,230);
			

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
		//identify("",bufferPolys)
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
   
   function showAddress(addresstmp) {
	   //alert(document.getElementById("mapContainer").offsetHeight)
	
	address = addresstmp.replace("e.g. ","");
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
	$("input:checkbox").attr('checked', false);
	//clearFilters();
	
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
//alert(address)
	
	if (address.toUpperCase()=="ALL" || address.toUpperCase()=="WHERE ARE YOU PLANTING?" || address.toUpperCase()=="EVERYTHING" || address.toUpperCase()=="ENTIRE DATABASE" || address.toUpperCase()=="" || address.toUpperCase()=="THE LOT" ) {
		address="Entire Plant Database"
		theSearchString="ENTIRE DATABASE"
		searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		return;
	}
	if (address.toUpperCase()=="STORMWATER") {
		theSearchString="SF PUC STORMWATER"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="SF PUC STORMWATER"
		queryPlant("STORMWATER");
		return;
	}
	if (address.toUpperCase()=="SIDEWALKLANDSCAPING") {
		theSearchString="SF DPW SIDEWALK LANDSCAPING"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="SF DPW SIDEWALK LANDSCAPING"
		queryPlant("SIDEWALKLANDSCAPING");
		return;
	}
	if (address.toUpperCase()=="URBANFORESTCOUNCILSTREETTREELIST") {
		theSearchString="SF URBAN FOREST COUNCIL STREET TREE LIST"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="SF URBAN FOREST COUNCIL STREET TREE LIST"
		queryPlant("URBANFORESTCOUNCILSTREETTREELIST");
		return;
	}
	if (address.toUpperCase()=="POLLINATOR") {
		theSearchString="POLLINATOR"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="POLLINATOR"
		queryPlant("POLLINATOR");
		return;
	}
	if (address.toUpperCase()=="SUPER60") {
		theSearchString="SUPER 60"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="SUPER 60"
		queryPlant("SUPER60");
		return;
	}
	if (address.toUpperCase()=="SANDYSOIL") {
		theSearchString="SANDY SOIL"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="SANDY SOIL"
		queryPlant("SANDYSOIL");
		return;
	}
	if (address.toUpperCase()=="SHADYCLAY") {
		theSearchString="SHADY CLAY"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="SHADY CLAY"
		queryPlant("SHADYCLAY");
		return;
	}
	if (address.toUpperCase()=="HABITAT") {
		theSearchString="HABITAT"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="HABITAT"
		queryPlant("HABITAT");
		return;
	}
	if (address.toUpperCase()=="THRIFTY150") {
		theSearchString="THRIFTY 150"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="THRIFTY 150"
		queryPlant("THRIFTY150");
		return;
	}
	if (address.toUpperCase()=="TOP20") {
		theSearchString="TOP 20"
		//searchAll();
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		theBaseSQL="(1=1)"
		theQueryType="TOP 20"
		queryPlant("TOP20");
		return;
	}
	//alert("here")
	if ( (address.substr(4,1)!=".") && (parseInt(address.length) > 6) && (parseInt(address.length) < 10) && (IsNumeric(address.substr(0,4) ) )  && (IsNumeric(address.substr(5,2) ) ) )  {
		//Searching for a PARCEL
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
				findTask.execute(params, findCompleteCallback);
				break;
			}
		}
		theSearch="parcel="+ address;
	} else {
				//Searching for an address
				//alert(theSearchType)
				if (theSearchType!="Address") {
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
							console.log("About to send to find task")
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
						document.getElementById('ImBusy').style.visibility = 'hidden'; 
						//new Messi('Are you searching for a Place or a Plant?', {title: 'Title', modal: true, buttons: [{id:0, label:'Place', val: 'Place'},{id:0, label:'Plant', val: 'Plant'}]});
						
						//new Messi('Are you searching for a Place or a Plant?', {title: 'Buttons', buttons: [{id: 0, label: 'Place', val: 'Y'}, {id: 1, label: 'Plant', val: 'N'}], callback: whatLookingFor(val)});
						//new Messi('Are you searching for a Place or a Plant?', {title: 'Buttons', buttons: [{id: 0, label: 'Yes', val: 'Y'}, {id: 1, label: 'No', val: 'N'}], callback: whatLookingFor(val) });
						
						//new Messi('Are you searching for a Place or a Plant?', {title: 'Place or Plant', titleClass: 'info', buttons: [{id: 0, label: 'Place', val: 'Place'}, {id: 1, label: 'Plant', val: 'Plant'}], callback: function(val) { whatLookingFor(val); }});
						//alert("address: " + address)
						new Messi('', {title: 'Are you searching for a Place or a Plant?', modal: true, titleClass: 'info', buttons: [{id: 0, label: 'Place', val: 'Place'}, {id: 1, label: 'Plant', val: 'Plant'}], callback: function(val) { whatLookingFor(val); }});
						//alert("address: " + address)
						//whatLookingFor("ddd")
							//new Messi('This is a message with Messi with custom buttons.', {title: 'Buttons', buttons: [{id: 0, label: 'Yes', val: 'Y'}, {id: 1, label: 'No', val: 'N'}], callback: function(val) { alert('Your selection: ' + val); }});
							
						//queryPlant('plantname');
						
						//theOrigType="Address"
						//alert("using geocoder")
						//Not sure what it is, send it to ESRI to attempt to geocode it. ESRI will return a lat/long, the marker will be placed on the map and the 'identifyClick()' function will be run as if the user clicked on the map.
						//This will only run if it was not identified as a block, lot, case or permit and it didn't find anything in MAD.
						//document.getElementById('ImBusy').style.visibility = 'hidden'; 
						//address = address + ", San Francisco, CA";
						//theSearchType = "Geocode"
						//theSearch="geocode="+ address;
						//map.graphics.clear();        
						//var address2 = {"SingleLine":address};
						//locator.outSpatialReference= map.spatialReference;     
					
						//var options = {          
						//	address:address2,          
						//	outFields:["Loc_name"]        
						//	}   
						//locator.addressToLocations(options,showGeocodeResults,geocodeError);

					}
					
				}
	}
}
     
function whatLookingFor(val) {
	//alert(address )
	if (val=='Plant') {
		queryPlant('plantname');
	} else {
		theOrigType="Address"
		//alert("using geocoder")
		//Not sure what it is, send it to ESRI to attempt to geocode it. ESRI will return a lat/long, the marker will be placed on the map and the 'identifyClick()' function will be run as if the user clicked on the map.
		//This will only run if it was not identified as a block, lot, case or permit and it didn't find anything in MAD.
		document.getElementById('ImBusy').style.visibility = 'hidden'; 
		address = address + ", San Francisco, CA";
		//address="mission st and van ness ave"
		
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
		locator.addressToLocations(options,showGeocodeResults,geocodeError);
	}
}

function geocodeError(error) {
	//alert(error.name + "\n\n" + error.message)
	alert("You entered a non-official address.  The service that deals with non-official address searching is presently not available, you can continue by either entering an official address or by clicking on the map. This error is most likely to affect Firefox, using another browser may solve the problem." )
}

function showGeocodeResults(candidates) {   
//alert("Candidates: " + candidates.length)
    //$("#plantInfo").slideUp("slow");
	var candidate;
	var bestCandidate;
	var reserveCandidate;
	map.graphics.clear();
	var IDsymbol = new esri.symbol.PictureMarkerSymbol('images/greenMarker.png', 32, 32).setOffset(0,16);
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
		var theTitle = "Sorry, I can't find a place called '" + theLinkAddress + "'."
		var theMessage = "Please check the spelling and try again."
		new Messi(theMessage, {title: theTitle, modal: true, titleClass: 'info', buttons: [{id: 0, label: 'OK'}]});
	}
}
      
function searchPlantName(thename) {

	
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
		// var geometryService = new esri.arcgis.gmaps.Geometry("http://50.17.237.182/arcgis/rest/services/Geometry/GeometryServer");
		//var geometryService = new esri.arcgis.gmaps.Geometry("http://" + theServerName + ":6080/arcgis/rest/services/Geometry/GeometryServer");
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
		// var geometryServiceLength = new esri.arcgis.gmaps.Geometry("http://50.17.237.182/arcgis/rest/services/Geometry/GeometryServer");
		//var geometryServiceLength = new esri.arcgis.gmaps.Geometry("http://" + theServerName + ":6080/arcgis/rest/services/Geometry/GeometryServer");
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
		buffParams.unionsResults = true;
		
		//should simplify the input polygon here
		//gsvc.simplify([geometry], function(geometries) {          
		//	params.geometries = geometries;          
		//	gsvc.buffer(params, showBuffer);        
		//});
		
		//no need to buffer for PlantFinder, go straight to the identify
		
		identify("",bufferPolys[0])
		//gsvc.buffer(buffParams,buffCallback,taskError);
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
			//alert("imbuffering")
		} else {
			imbuffering=false;
			//alert("about to ident")
			identify("",results[1])    //  [0][0] will return the original polygon
		}
	}
	
	function taskError(theError) {
		
		var txt=""
		for (x in theError) {
			txt=txt + theError[x] + "\n\n";
			theObj = theError[x];
			//for (xx in theObj) {
			//	txt=txt + theObj[xx] + "\n\n";
			//}

		}
		//prompt("",txt)  //use this to get more detailed errors
		 
		alert("I'm sorry, there has been an error in this process, if this continues please contact the system administrator.  Further details:\n\n" + theError.code + ": " + (theError.message || (theError.details && theError.details.join(" ")) || "Unknown error" ))
		//prompt("Error in Buffer",txt)
		document.getElementById('AssessorReport').innerHTML = instructions
		document.getElementById('ZoningReport').innerHTML = instructions
		document.getElementById('SurveyRatingsReport').innerHTML = instructions
		document.getElementById('CaseTrackingReport').innerHTML = instructions
		document.getElementById('PermitsReport').innerHTML = instructions
		document.getElementById('MiscPermitsReport').innerHTML = instructions
		document.getElementById('EnforcementReport').innerHTML = instructions 
		document.getElementById('AppealsReport').innerHTML = instructions 
		document.getElementById('BBNsReport').innerHTML = instructions 
		
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

var tmpZoomLevel=null

function refreshMapExtent() {
	map.graphics.redraw()
	map.setExtent(map.extent, true);
	map.setLevel(tmpZoomLevel);
	map.graphics.redraw();
	//alert("finished")
}


function in_array(needle, haystack){     
	var found = 0;     
	for (var i=0, len=haystack.length;i<len;i++) {         
		if (haystack[i] == needle) return true;             
			found++;     
	}     
	return false; 
}
	
function updatePlantListHtml() {
//alert("in updatePlantListHtml")
	//Green Connections
	thegreenConnectionsHtml=""
	theNum=0
	plantListArray = []
	//if (isLayerVisible("Green Connections")) {
	//	theAssessorHtml += "<br><table width='100%'><tr><td align='left'><span class='reportSectionHead'>GREEN CONNECTIONS: </span><input class='NoPrint' onclick='showHideMap( " + '"Green Connections"' + ");' title = 'Remove from map' alt='Remove from map' style= 'vertical-align: middle;' id='Green Connections' type='image' src = 'images/map-icon-on.png' /></td><td align='right'>&nbsp &nbsp</td></tr></table>"
	//} else {
	//	theAssessorHtml += "<br><table width='100%'><tr><td align='left'><span class='reportSectionHead'>GREEN CONNECTIONS: </span><input class='NoPrint' onclick='showHideMap( " + '"Green Connections"' + ");' title = 'Add to map' alt='Add to map' style= 'vertical-align: middle;' id='Green Connections' type='image' src = 'images/map-icon-off.png' /></td><td align='right'>&nbsp &nbsp</td></tr></table>"
	//}
	
	//if (idResults.length==0) { 
	//	return
	//}

	for (var i = 0; i < idResults.length; i++) {
		//check for TI click or address
		var result = idResults[i];		
		if (result.layerName == "Master Address Database") {
			if (result.feature.attributes["MAPBLKLOT"] =="1939001" || result.feature.attributes["MAPBLKLOT"] =="1939002") {
				clearCheckboxes(); 
				//if (result.feature.attributes["MAPBLKLOT"] =="1939001" ) {
				//	theSearchString = "TREASURE ISLAND"
				//	theSearchString2 = "TREASURE ISLAND"
				//} else {
				//	theSearchString = "YERBA BUENA ISLAND"
				//}
				showAddress('SUPER60');
				
				return;
			}
			else {
				//console.log(theSearchString)
				
				if (theSearchString.substring(0,8)=="Latitude" && result.feature.attributes["ADDRESSSIMPLE"] != null) {
					//theSearchString += " ("+result.feature.attributes["ADDRESSSIMPLE"]+")"
					theSearchString = result.feature.attributes["ADDRESSSIMPLE"]
					break;
				//alert("theSearchString: " +theSearchString + "\ntheSearchString2: " + theSearchString2)
				}
				
			}
			
		}
	}
	//alert("here")
	for (var i = 0; i < idResults.length; i++) {
		var result = idResults[i];		
		if (result.layerName == "Green Connections") {
			if (thegreenConnectionsHtml=="") {
				//thegreenConnectionsHtml +=' <div class="gclogo"><a href="about.html#greenConnections"><img src="images/green-connections-logo.png" width="75" height="75" alt="Green Connections" style="-webkit-filter: grayscale(100%); opacity: 0.85;" /></a></div>'
				thegreenConnectionsHtml +='<h2>This location is near a <strong>Green Connections</strong> route: <a href="green-connections.html" target="_blank"><img src="images/question-mark.png" alt="What is a Green Connection? Learn more..." width="12" height="12" border="0" /></a></h2>'
				thegreenConnectionsHtml +='<p >&nbsp;</p>'	
			}
			if (result.feature.attributes["GC_RT_NMBR"] != null) {
				var theGCNums = result.feature.attributes["GC_RT_NMBR"].split("/");
				thegreenConnectionsHtml +="<p style='padding:0px 0px 5px 0px;'>"
				for (var x = 0; x < theGCNums.length; x++) {
					theRouteNum = theGCNums[x];
					thegreenConnectionsHtml +='<a target="_blank" href="docs/EcologyGuides_Route_' +theRouteNum+ '.pdf"><img src="images/gc-route' + theRouteNum + '-marker.png" height="32" align="absmiddle" /></a>&nbsp; '
				}
				theNum = theNum + 1
				theRouteNum = result.feature.attributes["GC_RT_NMBR"] 
				theRouteNum = theRouteNum.replace("/","-");
				thegreenConnectionsHtml += result.feature.attributes["GC_RT_NAME"] +  '</p>'
			}
			
		}
	}

	if (theNum==0) {
		//thegreenConnectionsHtml +=' <div class="gclogo"><a href="about.html#greenConnections"><img src="images/green-connections-logo.png" width="75" height="75" alt="Green Connections" style="-webkit-filter: grayscale(100%); opacity: 0.85;" /></a></div>'
		thegreenConnectionsHtml +='<h2>This location is not near a <strong>Green Connections</strong> route. <a href="green-connections.html"><img src="images/question-mark.png" alt="What is a Green Connection? Learn more..." width="12" height="12" border="0" /></a></h2>'
		thegreenConnectionsHtml +='<p>&nbsp;</p>'
	}
	document.getElementById('greenConnectionsList').style.visibility="hidden"
	document.getElementById('greenConnectionsList').innerHTML = thegreenConnectionsHtml


	theSQL =  '"Plant_Communities"' +  " like '%All%'";
	for (var i = 0; i < idResults.length; i++) {
		var result = idResults[i];	
		if (result.layerName == "Habitats Merged") {
			if (result.feature.attributes["Habitat"] != null) {
					theSQL += " or " + ' UPPER("Plant_Communities")' +  " like '%" + result.feature.attributes["Habitat"].toUpperCase() +"%'"
			}
		}
	}

	//alert(theSQL)
	
	//alert(theArcGISServerName)
	require(["esri/tasks/query", "esri/tasks/QueryTask","dojo/dom", "dojo/on", "dojo/domReady!"], function(Query, QueryTask,dom, on){
	
		// var theTable=theArcGISServerName + "/12"
		var theTable=theArcGISServerName + "/13"
		//prompt("",theTable)
		queryTask = new QueryTask(theTable) //new QueryTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5");

		query = new Query();
		query.returnGeometry = false;
		//query.outFields = ["Common_Name","Latin_Name","Plant_Communities","Bloom_Time","Attractive_Features","Size_at_Maturity","Climate_Appropriate_Plants","Suitable_Site_Conditions","Soil_Type","Pruning_Needs","Water_Needs","Habitat_Value","Associated_Wildlife","Additional_Characteristics"];
		query.outFields = ["Common_Name","Latin_Name","Family_Name","Former_Latin_Name","Plant_Type","Plant_Communities","Bloom_Time","Appropriate_Location","Flower_Color","Size_at_Maturity","Climate_Appropriate_Plants","Suitable_Site_Conditions","Soil_Type","Pruning_Needs","Water_Needs","Habitat_Value","Associated_Wildlife","Additional_Characteristices_Notes","Street_Tree_List","Suggested_Green_Connection_Routes","Stormwater_Benefit","Nurseries","Super60","Super60_int","Thrifty150_int","Top20_int"];
		//alert("here")
		
		
		//on(dom.byId("execute"), "click", execute);
		theSQL = "( " + theSQL + " )";
		theBaseSQL=theSQL
		theSQL = theSQL //+ ' order by "Common_Name"'
		//theSQL="1=1"
		//prompt("",theSQL)
		

		if (theSQL=="(  )") {
			theSQL="1=0"
		}
		
		query.where ="( " +  theSQL + " ) or " + " (  \"Plant_Type\" in ('Tree (evergreen)'  , 'Tree (deciduous)' )  and ( \"Appropriate_Location\" like '%Sidewalk%' )  ) "
		//prompt("in the update","about to execute queryTask with SQL: " + query.where )
		function execute() {
			//alert("in execute")
			queryTask.execute(query, showResultsQuery,taskError);
			//queryTask.execute(query, showResultsQuery);
			//alert("sent query execute")
		}

		function showResultsQuery(results) {
			var s = "";
			
			//alert(results.features.length)
			//alert("in showResultsQuery")
			//theSQl= ' 1=1 order by "Common_Name"'
			thePlantResults=results
			//document.getElementById('toggleFilter').style.visibility='visible'; 
			//theLastSummarytmp=""
			//alert(theLastSummary)
			if (theEnglishFilter.length>2) {
				theLastSummary="We found <strong>" + results.features.length + "</strong> plants for " + theSearchString + ". The following filters were applied: " + theEnglishFilter + ". <br> Give this list to your landscaper or take it down to your local nursery." 
			} else {
				theLastSummary = "We found <strong>" + results.features.length + "</strong> plants for " + theSearchString + ".<br> Give this list to your landscaper or take it down to your local nursery."
			}
			document.getElementById('searchResultsSummary').innerHTML = theLastSummary
			//s +='<table border="0" cellpadding="0" cellspacing="0" id="PlantList" style="width:540px">'
			s +='<table border="0" cellpadding="0" cellspacing="0" id="PlantList" style="width:790px">'
			results.features.sort(idresultsort)
			
			
			
			var counter=0
			for (var i=0, il=results.features.length; i<il; i++) {
				var featureAttributes = results.features[i].attributes;
				var theLatinName = featureAttributes["Latin_Name"]

				if (theLatinName==null) {theLatinName=""};
				theLatinName=trim11(theLatinName);
				var theCommonName = featureAttributes["Common_Name"] 
				if (theCommonName==null) {theCommonName=theLatinName};
				
				var tmpprintplant="" + theCommonName + "<br><h2>" + theLatinName + "</h2>"
				plantListArray.push(tmpprintplant)
				
				if(counter==0) {
					s+="<tr>"
				}
				counter=counter+1;
				
				imgURL = "images/plants/medium/" + theLatinName + "01.jpg"
				var theicon=""
				var theNative=featureAttributes["Climate_Appropriate_Plants"]
				if(theNative) {
					theNative=theNative.trim()
				}
				
				switch(theNative) {
				    case 'CA Native':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ca.png' title='California Native' alt='California Native'>"
					break;
				    case 'SF Native':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-sf.png' title='San Francisco Native' alt='San Francisco Native'>" + "<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ca.png' title='California Native' alt='California Native'>"
					break;
				     case 'Exotic':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ex.png' title='Non-native; exotic' alt='Non-native; exotic'>"
					break;
				    default:
					
				}
				s+='<td align="middle" valign="top" ><img height="90px" width="90px" onClick="plantDetail(' + "'" + i + "'" +');" src="' + imgURL + '" alt="' + theLatinName+ '"></td><td valign="top" width="162"><a href="javascript:void(0);" onClick="plantDetail(' + "'" + i + "'" +');">'  +  theCommonName +'</a><br><h2>' + theLatinName +'</h2>'+ theicon +'</td>';
				
				if (counter==3) {
					s+="</tr>"
					counter=0;
				}
			}
			if (counter!=3) {
				s+="</tr>"
			}

			s+="</table><br>"

			theLastSearchHTML =s
			dom.byId("plantlist").innerHTML=s;

			var myDiv = document.getElementById('searchResults');
			myDiv.scrollTop = 0;
			document.getElementById('greenConnectionsList').style.visibility="visible"
  
			
			thePlantListHtmlToPrint = s

		}
		execute()
		grasslandPrairie=false;
		saltMarsh=false;
		wetland=false;
		coastalScrub=false;
		riparian=false;
		woodland=false;
		dunes=false;

	});
	
}

function searchAll() {
	//alert("searching all")
	theSQL="";
	//plantListArray = []
	queryPlant("");
}

function queryPlant(theQueryType) {
	//theEnglishFilter=""
	//alert("theQueryType: " + theQueryType)
	//$("#plantInfo").slideUp("slow");
	plantListArray = []
	$("#plantInfo").slideUp(1000);
	require(["esri/tasks/query", "esri/tasks/QueryTask","dojo/dom", "dojo/on", "dojo/domReady!"], function(Query, QueryTask,dom, on) {
		// var theTable=theArcGISServerName + "/12"
		var theTable = theArcGISServerName + "/13"
		//prompt("",theTable)
		queryTask = new QueryTask(theTable)
		query = new Query();
		var theSQL2=""
		var theSearchString2 = ""
		//alert(theQueryType)
		
		query.returnGeometry = false;
		//query.outFields = ["Common_Name","Latin_Name","Plant_Communities"];
		query.outFields = ["Common_Name","Latin_Name","Family_Name","Former_Latin_Name","Plant_Type","Plant_Communities","Bloom_Time","Appropriate_Location","Flower_Color","Size_at_Maturity","Climate_Appropriate_Plants","Suitable_Site_Conditions","Soil_Type","Pruning_Needs","Water_Needs","Habitat_Value","Associated_Wildlife","Additional_Characteristices_Notes","Street_Tree_List","Suggested_Green_Connection_Routes","PhotoCredit01","PhotoCredit02","PhotoCredit03","PhotoCredit04","Stormwater_Benefit","Nurseries","Additional_Species_Cultivars_Varieties"];
		//alert("here")
		//alert(theQueryType)
		if (!theQueryType) {
			if (theSQL=="") {
				theSQL = "1=1"
			}

			//theSearchString2 = "plants found for <i>'" + theLinkAddress + "'</i>"
			//theSearchString= "plants found for '" + theSearchString + "'"
		} else {
			theSQL=""
			theSearchString=""
			
			//alert(searchingForNursery)
			if (searchingForNursery) {
				
				theSQL2=" (Upper(Nurseries) like '%" + nurseryToLoad.toUpperCase() + "%') "
				theSQL = "1=1"
				theSearchString2=  nurseryToLoad + " nursery"
				theSearchString=theSearchString2
				//theSearchString2 = "TOP 20 (check for nursery availability by clicking on a plant)"
				//theSearchString2 = nurseryToLoad
				clearMap();
				searchingForNursery=false;
				//alert(theSQL2)
				
			} else {
			
				switch(theQueryType)
				{
					case 'SUPER60':
						// theSQL2=" (Super60 = 'Y') "
						theSQL2=" (Super60_int = 1) "
						theSQL = "1=1"
						theSearchString2 = "SUPER 60"
						clearMap();
						
						break;
					
					case 'STORMWATER':
						// theSQL2=" (Super60 = 'Y') "
						theSQL2=" (Stormwater_int = 1) "
						theSQL = "1=1"
						theSearchString2 = "SF PUC STORMWATER"
						clearMap();
						
						break;
					
					case 'SANDYSOIL':
						// theSQL2=" (Super60 = 'Y') "
						theSQL2=" (Sandy_Soil_int = 1) "
						theSQL = "1=1"
						theSearchString2 = "SANDY SOIL"
						clearMap();
						
						break;
						
					case 'SHADYCLAY':
						// theSQL2=" (Super60 = 'Y') "
						theSQL2=" (Shady_Clay_int = 1) "
						theSQL = "1=1"
						theSearchString2 = "SHADY CLAY"
						clearMap();
						
						break;
					
					case 'SIDEWALKLANDSCAPING':
						// theSQL2=" (Super60 = 'Y') "
						theSQL2=" (Sidewalk_Landscaping_Plants_int = 1) "
						theSQL = "1=1"
						theSearchString2 = "SF DPW SIDEWALK LANDSCAPING"
						clearMap();
						
						break;
						
					case 'POLLINATOR':
						//theSQL2="(1=1) and (  (\"Habitat_Value\" like \'%Pollinator%\' )  ) "
						theSQL2="(1=1) and (  (\"Habitat_Value\" like \'%Pollinator%\' )  or  (\"Habitat_Value\" like \'%;%\' )  ) "
						theSQL = "1=1"
						theSearchString2 = "POLLINATOR"
						clearMap();
						
						break;
						
					case 'URBANFORESTCOUNCILSTREETTREELIST':
						theSQL2=" (1=1) and (  \"Plant_Type\" in (\'Tree (evergreen)\'  , \'Tree (deciduous)\' )  and (  (\"Appropriate_Location\" like \'%Sidewalk%\' ) )  ) "
						theSQL = "1=1"
						theSearchString2= "SF URBAN FOREST COUNCIL STREET TREE LIST"
						clearMap();
						
						break;
						
					case 'HABITAT':
						theSQL2=" (Habitat_int = 1) "
						theSQL = "1=1"
						theSearchString2= "HABITAT PLANTS"
						clearMap();
						
						break;

					case 'THRIFTY150':
						theSQL2=" (Thrifty150_int = 1) "
						theSQL = "1=1"
						theSearchString2= "THRIFTY 150"
						clearMap();
						
						break;

					case 'TOP20':
						theSQL2=" (Top20_int = 1) "
						theSQL = "1=1"
						theSearchString2= "TOP 20"
						clearMap();
						
						break;
						
						
					case 'grasslandPrairie':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%GRASSLAND/PRAIRIE%' "
						theSearchString2= "plants for Grassland/Prairie"
						if (grasslandPrairie) {
							grasslandPrairie=false;
						}  else {
							grasslandPrairie=true;
						}
						clearMap();
						ToggleOnOff("Grassland/Prairie",true);
						break;
					case 'coastalScrub':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%COASTAL SCRUB%' "
						theSearchString2= "plants for Coastal Scrub"
						if (coastalScrub) {
							coastalScrub=false;
						}  else {
							coastalScrub=true;
						}
						clearMap();
						ToggleOnOff("Coastal Scrub",true);
						break;
					case 'chaparral':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%CHAPARRAL%' "
						theSearchString2= "plants for Chaparral"
						if (chaparral) {
							chaparral=false;
						}  else {
							chaparral=true;
						}
						clearMap();
						ToggleOnOff("Chaparral",true);
						break;
					case 'dunes':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%DUNES%' "
						theSearchString2= "plants for Dunes"
						if (dunes) {
							dunes=false;
						}  else {
							dunes=true;
						}
						clearMap();
						ToggleOnOff("Dunes",true);
						break;
					case 'wetland':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%WETLAND%' "
						theSearchString2= "plants for Wetland"
						if (wetland) {
							wetland=false;
						}  else {
							wetland=true;
						}
						clearMap();
						ToggleOnOff("Wetland",true);
						break;
					case 'riparian':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%RIPARIAN%' "
						theSearchString2= "plants for Riparian"
						if (riparian) {
							riparian=false;
						}  else {
							riparian=true;
						}
						clearMap();
						ToggleOnOff("Riparian",true);
						break;
					case 'woodland':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%WOODLAND%' "
						theSearchString2= "plants for Woodland"
						if (woodland) {
							woodland=false;
						}  else {
							woodland=true;
						}
						clearMap();
						ToggleOnOff("Woodland",true);
						break;
					case 'saltMarsh':
						theSQL2 = ' UPPER("Plant_Communities") like ' + "'%SALT MARSH%' "
						theSearchString2= "plants for Salt Marsh"
						if (saltMarsh) {
							saltMarsh=false;
						}  else {
							saltMarsh=true;
						}
						clearMap();
						ToggleOnOff("Salt Marsh",true);
						break;
					case 'plantname':
						var theSQLplant= theLinkAddress.toUpperCase()
						if (theSQLplant.substr(theSQLplant.length-1)=='S') {
							theSQLplant = theSQLplant.substr(0,theSQLplant.length-1)
						}
						if (theSQLplant=='GRASSES') {
							theSQLplant='GRASS'	
						}
						theSQL2= ' Upper("Latin_Name") like ' + "'%"+theSQLplant+ "%'"
						theSQL2+= ' OR Upper("Common_Name") like ' + "'%"+theSQLplant + "%'"
						theSQL2+= ' OR Upper("Plant_Type") like ' + "'%"+theSQLplant + "%'"
						theSearchString = theLinkAddress
						theSearchString2 = "plants matching <i>'" + theLinkAddress + "'</i>"
						//alert("theLinkAddress: " + theLinkAddress)
						//alert(theSQL2)
					default:
						theSearchString2 = "plants matching <i>'" + theLinkAddress + "'</i> (check for nursery availability )" //by clicking on a plant
						theSearchString=theSearchString2
						break;
				}
				
				if (grasslandPrairie) { 
					theSQL += ' UPPER("Plant_Communities") like ' + "'%GRASSLAND/PRAIRIE%' "
					theSearchString+= "Grassland/Prairie"
				}
				if (saltMarsh) { 
					if (theSQL!="") {
						theSQL+=" or "
						theSearchString+=" / "
					}
					theSQL += ' UPPER("Plant_Communities") like ' + "'%SALT MARSH%' "
					theSearchString+= "Salt Marsh"
				}
				//alert(chaparral)
				if (chaparral) { 
					if (theSQL!="") {
						theSQL+=" or "
						theSearchString+=" / "
					}
					theSQL += ' UPPER("Plant_Communities") like ' + "'%CHAPARRAL%' "
					theSearchString+= "Chaparral"
				}
				if (wetland) {
					if (theSQL!="") {
						theSQL+=" or "
						theSearchString+=" / "
					}
					theSQL += ' UPPER("Plant_Communities") like ' + "'%WETLAND%' "
					theSearchString+= "Wetland"
				}
				//alert(coastalScrub)
				if (coastalScrub) {
					if (theSQL!="") {
						theSQL+=" or "
						theSearchString+=" / "
					}
					theSQL += ' UPPER("Plant_Communities") like ' + "'%COASTAL SCRUB%' "
					theSearchString+= "Coastal Scrub"
				}
				if (riparian) {
					if (theSQL!="") {
						theSQL+=" or "
						theSearchString+=" / "
					}
					theSQL += ' UPPER("Plant_Communities") like ' + "'%RIPARIAN%' "
					theSearchString+= "Riparian"
				}
				if (woodland) {
					if (theSQL!="") {
						theSQL+=" or "
						theSearchString+=" / "
					}
					theSQL += ' UPPER("Plant_Communities") like ' + "'%WOODLAND%' "
					theSearchString+= "Woodland"
				}
				if (dunes) {
					if (theSQL!="") {
						theSQL+=" or "
						theSearchString+=" / "
					}
					theSQL += ' UPPER("Plant_Communities") like ' + "'%DUNES%' "
					theSearchString+= "Dunes"
				}
				if (theSQL!="") {
					theSQL += ' or UPPER("Plant_Communities") = ' + "'ALL' "
				}
				
				//if (theSQL2!=" (Nurseries is not null) " && theSQL2!="" && theQueryType!="plantname") {
				// if (theSQL2!=" (Super60 = 'Y') " && theSQL2!="" && theQueryType!="plantname") {
				if (theSQL2!=" (Super60_int = 1) " && theSQL2!="" && theQueryType!="plantname") {
					
					theSQL2 += ' or UPPER("Plant_Communities") = ' + "'ALL' "
					
				}

				if (theSQL2!=" (Thrifty150_int = 1) " && theSQL2!="" && theQueryType!="plantname") {
					
					theSQL2 += ' or UPPER("Plant_Communities") = ' + "'ALL' "
					
				}

				if (theSQL2!=" (Top20_int = 1) " && theSQL2!="" && theQueryType!="plantname") {
					
					theSQL2 += ' or UPPER("Plant_Communities") = ' + "'ALL' "
					
				}

				//alert(theSearchString)
				//alert(theSearchString2)
				//theSQL= "( " + theSQL + " ) "
				//theBaseSQL = theSQL
				//theSQL += ' order by "Common_Name"'
				
				theSQL2= "( " + theSQL2 + " ) "
				theBaseSQL = theSQL2
				//theSQL2 += ' order by "Common_Name"'
				
				//alert(theSearchString)
				theSearchString = theSearchString2
				//alert(theSearchString)
				
				//alert(theSQL)
				//if (theSQL==' order by "Common_Name"') {
					//none selected, clear the div
				//	dom.byId("plantinfo").innerHTML = ""
				//	theSQL=""
				//	return
				//}
				if (theSQL2==' ') {
					//none selected, clear the div
					dom.byId("plantlist").innerHTML = ""
					theSQL2=""
					return
				}
			}
		}
		//alert("theSQL2: " + theSQL2)
		//alert(	"\ntheSQL: " + theSQL)
		if (theSQL2=="") {
			theSQL2=theSQL
		}
		theSearchType="communities"
		//alert(theSearchString)
		//query.where = theSQL
		query.where = theSQL2
		//alert("about to send")
		//prompt("",theSQL2)
		queryTask.execute(query, showCustomResultsQuery,theErr);
		function theErr(myErr) {
			//alert(myErr)
		}

		function showCustomResultsQuery(results) {
			//alert("here")
			document.getElementById('Intro').style.display='none';
			document.getElementById('floatingDivForFilter').style.display='inline';
			document.getElementById('printResultsLink').style.visibility="visible"
			
			plantListArray=[]
			
			//alert("in result")
			//alert(results.features.length)
			
			//document.getElementById('toggleFilter').innerHTML="<a>Filter Results</a>"
			//alert("1")
			//document.getElementById('toggleFilter').onclick= function () {setFilterLink();};
			thePlantResults=results
			var s = "";
			//document.getElementById('toggleFilter').style.visibility='visible';  
			//alert("2")
			//theLastSummarytmp=""
			
			// alert(theEnglishFilter)
			// alert("theSearchString2", theSearchString2)
			if (theSearchString.toUpperCase()=="ALL") {
				theSearchString = " plants found (entire database)"
			}
			if (theEnglishFilter.length>2) {
				theLastSummary = "We found <strong>" + results.features.length + "</strong> results with the following filters: " + theSearchString + " and " + theEnglishFilter + ". <br> Give this list to your landscaper or take it down to your local nursery.";
			} else {
				theLastSummary = "We found <strong>" + results.features.length + "</strong> plants for " + theSearchString + "."
			}
			
			// The "Check for nursery availability..." statement should only for lists that include plants from the SUPER 60
			if (theSearchString.includes("SUPER 60")) {
				theLastSummary += "<br> Check for nursery availability by clicking on a plant.";
			}

			//theLastSummary = "We found <strong> " + results.features.length + "</strong> " + theSearchString + ":"
			document.getElementById('searchResultsSummary').innerHTML = theLastSummary
			//alert("3")
			//s +='<table border="1" cellpadding="0" cellspacing="0" id="PlantList" style="width:540px">'
			s +='<table border="0" cellpadding="0" cellspacing="0" id="PlantList" style="width:790px">'
			results.features.sort(idresultsort)
			var counter=0
			for (var i=0, il=results.features.length; i<il; i++) {
				var featureAttributes = results.features[i].attributes;
				var theLatinName = featureAttributes["Latin_Name"]
				//theLatinName=theLatinName.replace(/^\s+|\s+$/g, '');
				//theLatinName = theLatinName.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				
				if (theLatinName==null) {theLatinName=""};
				theLatinName=trim11(theLatinName);
				var theCommonName = featureAttributes["Common_Name"] 
				if (theCommonName==null) {theCommonName=theLatinName};
				
				var tmpprintplant="" + theCommonName + "<br><h2>" + theLatinName + "</h2>"
				plantListArray.push(tmpprintplant)
				
				//if(!isThree(i)) {
				if(counter==0) {
					//alert(i)
					s+="<tr>"
				}
				counter=counter+1;
				
				imgURL = "images/plants/medium/" + theLatinName + "01.jpg"
				var theicon=""
				var theNative=featureAttributes["Climate_Appropriate_Plants"]
				if(theNative) {
					theNative=theNative.trim()
				}
				
				switch(theNative) {
				    case 'CA Native':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ca.png' title='California Native' alt='California Native'>"
					break;
				    case 'SF Native':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-sf.png' title='San Francisco Native' alt='San Francisco Native'>" + "<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ca.png' title='California Native' alt='California Native'>"
					break;
				     case 'Exotic':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ex.png' title='Non-native; exotic' alt='Non-native; exotic'>"
					break;
				    default:
					
				}	
				s+='<td align="middle" valign="top" ><img height="90px" width="90px" onClick="plantDetail(' + "'" + i + "'" +');" src="' + imgURL + '" alt="' + theLatinName+ '"></td><td valign="top" width="162"><a href="javascript:void(0);" onClick="plantDetail(' + "'" + i + "'" +');">'  +  theCommonName +'</a><br><h2>' + theLatinName +'</h2>' + theicon +'</td>';
				
                //if(isThree(i)) {
				if (counter==3) {
					s+="</tr>"
					counter=0;
				}
			}
			if (i==0) {
				s+='<tr>';
				s+='<td align="middle" valign="top" ></td><td valign="top" width="162"></td>';
				s+='<td align="middle" valign="top" ></td><td valign="top" width="162"></td>';
				s+='<td align="middle" valign="top" ></td><td valign="top" width="162"></td>';
			}
			if (i==1) {
				s+='<td align="middle" valign="top" ></td><td valign="top" width="162"></td>';
				s+='<td align="middle" valign="top" ></td><td valign="top" width="162"></td>';
			}
			if (i==2) {
				s+='<td align="middle" valign="top" ></td><td valign="top" width="162"></td>';
			}
			if (counter!=3) {
				s+="</tr>"
			}
			//alert("4")
			s+="</table><br>"
			//alert("1")
			dom.byId("plantlist").innerHTML=s;
			//alert("2")
			var myDiv = document.getElementById('searchResults');
			//alert("3")
			myDiv.scrollTop = 0;
			theLastSearchHTML=s
			document.getElementById('greenConnectionsList').innerHTML =""
			thePlantListHtmlToPrint = s
		}
		//thePlantListHtmlToPrint = s
	});
}

function trim11 (str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

function plantDetail(thePlantID) {
    //$("#plantInfo").slideDown("slow");
	$("#plantInfo").slideDown(1000);
    $('html,body').animate({'scrollTop' : 500},1000);
	var myDiv = document.getElementById('searchResults');
	theDIVLoc = myDiv.scrollTop
    
	//alert(theDIVLoc)
	var theDetailHtml = ""
	//MM_showHideLayers("hide")
	//MM_showHideLayers('floatingDivForFilter','','hide');
	//document.getElementById('floatingDivForFilter').style.visibility='hidden';
	//document.getElementById('toggleFilter2').style.visibility='hidden';
	
	var theWikiLink = "http://en.wikipedia.org/wiki/" + thePlantResults.features[thePlantID].attributes["Latin_Name"].replace(/ /gi,"_");
	var commonName = thePlantResults.features[thePlantID].attributes["Common_Name"] 
	var latinName = thePlantResults.features[thePlantID].attributes["Latin_Name"].trim(); 
	
	var nurseryList = thePlantResults.features[thePlantID].attributes["Nurseries"]
    
	if (nurseryList==null) {
		nurseryList=""
	} else {
		nurseryList=nurseryList.trim();
		if (nurseryList) {
			
			nurseryList=nurseryList.replace(/;/g,", ")
		}
		if (nurseryList.slice(-2)==", ") {
			nurseryList=nurseryList.substring(0,nurseryList.length-2)
			nurseryArray=nurseryList.split(", ")
			var nurseryListFormatted=""
			for (var i=0, il=nurseryArray.length; i<il; i++) {
				nurserytmp=nurseryArray[i].replace(/\s/g, '');
				nurserytmp=nurserytmp.replace(/-/g, ' ');
				nurseryListFormatted+="<a target='_blank' href='resources.html#" + nurserytmp + "'>" + nurseryArray[i] + "</a>, "
			}
			if (nurseryListFormatted.slice(-2)==", ") {
				nurseryListFormatted=nurseryListFormatted.substring(0,nurseryListFormatted.length-2)
			}
			nurseryList=nurseryListFormatted
			//nurseryList="<a target='_blank' href='http://sfplantfinder.org/resources.html#plant-nurseries'>" + nurseryList +"</a>"
		}
	}
	//var nurseryList= thePlantResults.features[thePlantID].attributes["Nurseries"].trim(); 

	var FLN=thePlantResults.features[thePlantID].attributes["Former_Latin_Name"] 
	if (FLN==null) {FLN=""};
	if (FLN=="") {
		FLN="N/A"
	}
	var additionalCharacteristics = thePlantResults.features[thePlantID].attributes["Additional_Characteristices_Notes"] 
	if (additionalCharacteristics==null) {
		additionalCharacteristics=""		
	}
	var plantType = thePlantResults.features[thePlantID].attributes["Plant_Type"] 
	var bloomTime = thePlantResults.features[thePlantID].attributes["Bloom_Time"]
	var familyName = thePlantResults.features[thePlantID].attributes["Family_Name"] 
	if (bloomTime) {bloomTime=bloomTime.replace(/;/g,", ")};
	var attractiveFeatures = thePlantResults.features[thePlantID].attributes["Flower_Color"]
	if (attractiveFeatures) {attractiveFeatures=attractiveFeatures.replace(/;/g,", ")};
	var climateAppropriate = thePlantResults.features[thePlantID].attributes["Climate_Appropriate_Plants"] 
	var plantCommunities = thePlantResults.features[thePlantID].attributes["Plant_Communities"]
	if (plantCommunities) {plantCommunities=plantCommunities.replace(/;/g,", ")};
	var plantSize = thePlantResults.features[thePlantID].attributes["Size_at_Maturity"]
	var appropriateLocation = thePlantResults.features[thePlantID].attributes["Appropriate_Location"]
	if (appropriateLocation) {appropriateLocation=appropriateLocation.replace(/;/g,", ")};
	var wateringNeeds = thePlantResults.features[thePlantID].attributes["Water_Needs"] 
	//var pruningNeeds = thePlantResults.features[thePlantID].attributes["Pruning_Needs"] 
	var siteConditions = thePlantResults.features[thePlantID].attributes["Suitable_Site_Conditions"]
	if (siteConditions) {siteConditions=siteConditions.replace(/;/g,", ")};
	var soil = thePlantResults.features[thePlantID].attributes["Soil_Type"]
	if (soil) {soil=soil.replace(/;/g,", ")};
	var habitatValue = thePlantResults.features[thePlantID].attributes["Habitat_Value"]
	if (habitatValue) {habitatValue=habitatValue.replace(/;/g,", ")};
	var associatedWildlife = thePlantResults.features[thePlantID].attributes["Associated_Wildlife"]
	if (associatedWildlife) {associatedWildlife=associatedWildlife.replace(/;/g,", ")};
    
	var stormwaterInfrastructure  = thePlantResults.features[thePlantID].attributes["Stormwater_Benefit"]
	//alert(stormwaterInfrastructure)
	var streetTreeList = thePlantResults.features[thePlantID].attributes["Street_Tree_List"] 
	var photoCredit1 = thePlantResults.features[thePlantID].attributes["PhotoCredit01"]
	var photoCredit2 = thePlantResults.features[thePlantID].attributes["PhotoCredit02"]
	var photoCredit3 = thePlantResults.features[thePlantID].attributes["PhotoCredit03"]
	var photoCredit4 = thePlantResults.features[thePlantID].attributes["PhotoCredit04"]
	var GC = thePlantResults.features[thePlantID].attributes["Suggested_Green_Connection_Routes"]
	
	var additionalSpecies=thePlantResults.features[thePlantID].attributes["Additional_Species_Cultivars_Varieties"]
	if (additionalSpecies==null) {
		additionalSpecies=""		
	}
	
	//alert(photoCredit1)
	//alert(streetTreeList)
	
	if (commonName==null) {commonName=""};
	if (latinName==null) {latinName=""};
	if (familyName==null) {familyName=""};
	if (familyName=="") {familyName="N/A"};
	if (additionalCharacteristics==null) {additionalCharacteristics=""};
	if (plantType==null) {plantType=""};
	if (bloomTime==null) {bloomTime=""};
	if (attractiveFeatures==null) {attractiveFeatures=""};
	if (climateAppropriate==null) {climateAppropriate=""};
	if (plantCommunities==null) {plantCommunities=""};
	if (plantSize==null) {plantSize=""};
	if (appropriateLocation==null) {appropriateLocation=""};
	if (wateringNeeds==null) {wateringNeeds=""};
	//if (pruningNeeds==null) {pruningNeeds=""};
	if (siteConditions==null) {siteConditions=""};
	if (soil==null) {soil=""};
	if (habitatValue==null) {habitatValue=""};
	if (associatedWildlife==null) {associatedWildlife=""};
	if (stormwaterInfrastructure==null) {stormwaterInfrastructure=""};
	if (streetTreeList==null) {streetTreeList=""};
	if (photoCredit1==null) {photoCredit1="unknown"};
	if (photoCredit2==null) {photoCredit2="unknown"};
	if (photoCredit3==null) {photoCredit3="unknown"};
	if (photoCredit4==null) {photoCredit4="unknown"};
	
	if (nurseryList==null) {nurseryList=""};
	
	//alert(isthere)
	
	//alert(photoCredit1)
	//theDetailHtml+='<div id="searchResultsDetails">'
	//theDetailHtml+='<div id="info" style="visibility: visible;">'
	theDetailHtml+='<h2>Plant Info</h2><br><div class="images"><table id="imagesTable" border="0" cellspacing="0" cellpadding="0">'
	theDetailHtml+='<tr>'
	theDetailHtml+='<td width="285" height="280" rowspan="3" valign="top"><a title = "Photo credit: ' + photoCredit1 + '" href="images/plants/full/' + latinName+ '01.jpg"' + 'data-lightbox="plantDetail"><img src="images/plants/large/'+ latinName+ '01.jpg" width="280" height="280" /></a></td>'
    
    
	theDetailHtml+='<td width="90" height="95" valign="top"><a title = "Photo credit: ' + photoCredit2 + '" href="images/plants/full/' + latinName+ '02.jpg"' + 'data-lightbox="plantDetail"><img src="images/plants/medium/' + latinName+ '02.jpg" width="90" height="90" /></a></td>'
	theDetailHtml+='</tr>'
    
	theDetailHtml+='<tr>'
	theDetailHtml+='<td id="photo3" width="90" height="95" valign="top"><a title = "Photo credit: ' + photoCredit3 + '" href="images/plants/full/' + latinName+ '03.jpg"' + 'data-lightbox="plantDetail"><img src="images/plants/medium/'+ latinName+ '03.jpg" width="90" height="90" /></a></td>'
	theDetailHtml+='</tr>'
	
	theDetailHtml+='<tr>'
	theDetailHtml+='<td id="photo4" width="90" height="95" valign="top"><a title = "Photo credit: ' + photoCredit4 + '" href="images/plants/full/' + latinName+ '04.jpg"' + 'data-lightbox="plantDetail"><img src="images/plants/medium/'+ latinName+ '04.jpg" width="90" height="90" /></a></td>'
	theDetailHtml+='</tr>'
	
	theDetailHtml+='</table>'
	theDetailHtml+='</div>'
	
	theDetailHtml+='<h1>' + commonName + '</h1>'
	theDetailHtml+='<h2>Latin Name:</h2>'
	theDetailHtml+='<p><em>'+ latinName+ '</em></p>'
	
	theDetailHtml+='<p>&nbsp;</p>'
	theDetailHtml+='<h2>Former Latin Name:</h2>'
	theDetailHtml+='<p><em>' + FLN + '</em></p>'
	theDetailHtml+='<p>&nbsp;</p>'
	
	theDetailHtml+='<h2>Family:</h2>'
	theDetailHtml+='<p><em>' + familyName + '</em></p>'
	theDetailHtml+='<p>&nbsp;</p>'

	// theDetailHtml+='<h2>Additional Species</h2>'
	// theDetailHtml+='<p><em>' + additionalSpecies + '</em></p>'
	// theDetailHtml+='<p>&nbsp;</p>'
	
	theDetailHtml+='<p>&nbsp;</p>'
	theDetailHtml+='<p>&nbsp;</p>'
	theDetailHtml+='<p><a href="' + theWikiLink+'" target="_blank">Link to Wikipedia Entry</a></p>'
	theDetailHtml+='<p>&nbsp;</p>'
	
	//theDetailHtml+='<h2>Plant Type:</h2>'
	//theDetailHtml+='<p>' + plantType+ '</p>'
	//theDetailHtml+='<p>&nbsp;</p>'
	
	theDetailHtml+='<table class="plantDetails" border="0" cellspacing="0" cellpadding="0" width="100%">'
	theDetailHtml+='  <tr>'
	theDetailHtml+='    <td width="150"><h2>Additional Species, Cultivars and varieties:</h2></td>'
    theDetailHtml+='    <td><p>' + additionalSpecies + '</p></td>'
    theDetailHtml+='   </tr>'
	theDetailHtml+='  <tr>'
	theDetailHtml+='    <td width="150"><h2>Plant Type:</h2></td>'
    theDetailHtml+='    <td><p>' + plantType + '</p></td>'
    theDetailHtml+='   </tr>'
	//theDetailHtml+='<table class="plantDetails" border="0" cellspacing="0" cellpadding="0" width="100%">'
	theDetailHtml+='  <tr>'
	theDetailHtml+='    <td width="150"><h2>Bloom Time:</h2></td>'
    theDetailHtml+='    <td><p>' + bloomTime + '</p></td>'
    theDetailHtml+='   </tr>'
    theDetailHtml+='   <tr>'
    theDetailHtml+='     <td width="150"><h2>Flower Color:</h2></td>'
    theDetailHtml+='     <td><p>' + attractiveFeatures + '</p></td>'
    theDetailHtml+='   </tr>'
	theDetailHtml+='  <tr>'
    theDetailHtml+='    <td width="150"><h2>Size at Maturity:</h2></td>'
    theDetailHtml+='    <td><p>' + plantSize + '</p></td>'
    theDetailHtml+='   </tr>'
	theDetailHtml+='  <tr>'
    theDetailHtml+='    <td width="150"><h2>Appropriate Location:</h2></td>'
    theDetailHtml+='    <td><p>' + appropriateLocation + '</p></td>'
    theDetailHtml+='  </tr>'
    theDetailHtml+='  <tr>'
	theDetailHtml+='    <td width="150"><h2>Watering Needs:</h2></td>'
    theDetailHtml+='    <td><p>' + wateringNeeds + '</p></td>'
    theDetailHtml+='  </tr>'
    theDetailHtml+='  <tr>'
    theDetailHtml+='    <td width="150"><h2>Site Conditions:</h2></td>'
    theDetailHtml+='    <td><p>' + siteConditions + '</p></td>'
    theDetailHtml+='  </tr>'
    theDetailHtml+='   <tr>'
    theDetailHtml+='     <td width="150"><h2>Soil:</h2></td>'
    theDetailHtml+='    <td><p>' + soil + '</p></td>'
    theDetailHtml+='   </tr>'
	//theDetailHtml+='  <tr>'
    //theDetailHtml+='    <td width="150"><h2>Pruning Needs:</h2></td>'
    //theDetailHtml+='    <td><p>' + pruningNeeds + '</p></td>'
    //theDetailHtml+='  </tr>'
	
    theDetailHtml+='    <tr>'
    theDetailHtml+='     <td width="150"><h2>Climate Appropriate:</h2></td>'
    theDetailHtml+='     <td><p>' + climateAppropriate + '</p></td>'
    theDetailHtml+='   </tr>'
    theDetailHtml+='   <tr>'
    theDetailHtml+='     <td width="150"><h2>Plant Communities:</h2></td>'
    theDetailHtml+='    <td><p>' + plantCommunities+ '</p></td>'
    theDetailHtml+='  </tr>'
	theDetailHtml+='   <tr>'
    theDetailHtml+='     <td><h2>Habitat Value:</h2></td>'
    theDetailHtml+='     <td><p>' + habitatValue + '</p></td>'
    theDetailHtml+='   </tr>'
    theDetailHtml+='  <tr>'
	theDetailHtml+='  <tr>'
    theDetailHtml+='    <td><h2>Associated Wildlife:</h2></td>'
    theDetailHtml+='    <td><p>' + associatedWildlife+ '</p></td>'
    theDetailHtml+=' </tr>'
       
	//theDetailHtml+='   <tr>'
    //theDetailHtml+='     <td width="150"><h2>Good for Stormwater Planter:</h2></td>'
    //theDetailHtml+='    <td><p>' + stormwaterInfrastructure + '</p></td>'
    //theDetailHtml+='   </tr>'
    //theDetailHtml+='   <tr>'
	
	
	theDetailHtml+='   <tr>'
    theDetailHtml+='     <td width="150"><h2>Nurseries:</h2></td>'
    theDetailHtml+='    <td><p>' + nurseryList + '</p></td>'
    theDetailHtml+='   </tr>'
    theDetailHtml+='   <tr>'
	//alert(streetTreeList)
	//if (streetTreeList!="" && streetTreeList!="N/A") {
	
	//theDetailHtml+='   <tr>'
    //theDetailHtml+='     <td><h2>Additional Characteristics:</h2></td>'
    //theDetailHtml+='     <td><p>' + additionalCharacteristics + '</p></td>'
    //theDetailHtml+='   </tr>'
   
    theDetailHtml+='  <tr>'
    theDetailHtml+='    <td><h2>Suggested for Green Connections Routes:</h2></td>'
    theDetailHtml+='    <td><p>'	

	var AnyRoutes="No"
	var GCArray = new Array();
	GCArray = GC.split(";");
	if (GCArray.length==0) {
		GCArray[0]=GC
	}
	for (var i=0, il=GC.length; i<il; i++) {
		if (GCArray[i]=="1") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_1.pdf">'
			theDetailHtml+='      <img src="images/gc-route1-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="2") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_2.pdf">'
			theDetailHtml+='      <img src="images/gc-route2-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="3") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_3.pdf">'
			theDetailHtml+='      <img src="images/gc-route3-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="4") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_4.pdf">'
			theDetailHtml+='      <img src="images/gc-route4-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="5") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_5.pdf">'
			theDetailHtml+='      <img src="images/gc-route5-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="6") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_6.pdf">'
			theDetailHtml+='      <img src="images/gc-route6-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="7") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_7.pdf">'
			theDetailHtml+='      <img src="images/gc-route7-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="8") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_8.pdf">'
			theDetailHtml+='      <img src="images/gc-route8-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="9") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_9.pdf">'
			theDetailHtml+='      <img src="images/gc-route9-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="10") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_10.pdf">'
			theDetailHtml+='      <img src="images/gc-route10-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="11") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_11.pdf">'
			theDetailHtml+='      <img src="images/gc-route11-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="12") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_12.pdf">'
			theDetailHtml+='      <img src="images/gc-route12-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="13") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_13.pdf">'
			theDetailHtml+='      <img src="images/gc-route13-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="14") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_14.pdf">'
			theDetailHtml+='      <img src="images/gc-route14-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="15") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_15.pdf">'
			theDetailHtml+='      <img src="images/gc-route15-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="16") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_16.pdf">'
			theDetailHtml+='      <img src="images/gc-route16-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="17") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_17.pdf">'
			theDetailHtml+='      <img src="images/gc-route17-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="18") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_18.pdf">'
			theDetailHtml+='      <img src="images/gc-route18-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="19") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_19.pdf">'
			theDetailHtml+='      <img src="images/gc-route19-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
		}
		if (GCArray[i]=="20") {  
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_20.pdf">'
			theDetailHtml+='      <img src="images/gc-route20-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="21") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_21.pdf">'
			theDetailHtml+='      <img src="images/gc-route21-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="22") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_22.pdf">'
			theDetailHtml+='      <img src="images/gc-route22-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="23") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_23.pdf">'
			theDetailHtml+='      <img src="images/gc-route23-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
		if (GCArray[i]=="24") { 
			theDetailHtml+='      <a target="_blank" href="docs/EcologyGuides_Route_24.pdf">'
			theDetailHtml+='      <img src="images/gc-route24-marker.png" width="32" height="32" />'
			theDetailHtml+='      </a>'
			AnyRoutes="Y"
		}
	}
	
	if (AnyRoutes!="Y") {
		theDetailHtml+='N/A';
	}
	theDetailHtml+=' </p></td>'
    theDetailHtml+='  </tr>'
	if (streetTreeList=='NA'||streetTreeList=='') {streetTreeList="N/A"} 
	theDetailHtml+='   <tr>'
	theDetailHtml+='     <td width="150"><h2>Approved Street Tree List:</h2></td>'
	if (streetTreeList=='1 (A)') {streetTreeList="<a target='_blank' href='http://www.sfdpw.org/index.aspx?page=1302'>A - Species that perform well in many locations in San Francisco</a>" };
	if (streetTreeList=='2 (B)') {streetTreeList="<a target='_blank' href='http://www.sfdpw.org/index.aspx?page=1302'>B - Species that perform well in certain locations, with special considerations</a>" };
	if (streetTreeList=='C') {streetTreeList="<a target='_blank' href='http://www.sfdpw.org/index.aspx?page=1302'>C - Species that need further evaluation </a>" };
	theDetailHtml+='    <td><p>' + streetTreeList + '</p></td>'
	theDetailHtml+='   <tr>'
    theDetailHtml+='     <td width="150"><h2>Additional Characteristics:</h2></td>'
    theDetailHtml+='    <td><p>' + additionalCharacteristics + '</p></td>'
    theDetailHtml+='   </tr>'
    theDetailHtml+='   <tr>'
	theDetailHtml+='   </tr>'
    theDetailHtml+='</table>'
	theDetailHtml+='</div>'
	theDetailHtml+='</div>'
	
	//theDetailHtml=theDetailHtml.replace("undefined","-")
	theDetailHtml = theDetailHtml.replace(/undefined/gi,"&nbsp");
	//alert(theDetailHtml)
    //prompt("",theDetailHtml)
	//document.getElementById('floatingDivForDetail').innerHTML = theDetailHtml
	//document.getElementById('floatingDivForDetail').style.visibility='visible';
	
	//document.getElementById('plantinfo').style.visibility='hidden';
	//document.getElementById('searchResultsDetails').style.visibility='visible';
	
	//document.getElementById('searchResultsSummary').innerHTML = "<span style='color: #85BF3F; font-style: italic; font-size: 12px; line-height: 1.15em; font-weight: normal; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;'>Plant Info</span>"
	document.getElementById('info').innerHTML = theDetailHtml;
	//document.getElementById('floatingDivForFilter').style.visibility='hidden';
	//document.getElementById('toggleFilter').innerHTML="<a>&laquo; Search Results</a>"
	//document.getElementById('toggleFilter').onclick= function () {reloadSearchResults();};
	//document.getElementById('plantlist').style.visibility='visible';

	theURLtmp = 'http://' + theServerName +'/php/fileExists.php?filename=C:/inetpub/wwwroot/PlantSF/images/Plants/Medium/' + latinName + "03.jpg"
	getJPGDoc(theURLtmp,3)
	theURLtmp = 'http://' + theServerName +'/php/fileExists.php?filename=C:/inetpub/wwwroot/PlantSF/images/Plants/Medium/' + latinName + "04.jpg"
	getJPGDoc(theURLtmp,4)

	if (theSearchType != "communities") {
		document.getElementById('greenConnectionsList').innerHTML = thegreenConnectionsHtml
		
	}
	
	thePlantDetailHtmlToPrint = theDetailHtml
	//myDiv.scrollTop = 0;
	//alert(theSearchType)
    
    //$("#plantInfo").slideDown("slow");
    //$("#plantInfo").animate({ scrollTop: 0 }, "slow");
    //$("#contentPointer").animate({ scrollTop: 0 }, "slow");

}	

function reloadSearchResults() {
	//document.getElementById('filterLink').onclick=MM_showHideLayers('floatingDivForFilter','','hide');
	document.getElementById('toggleFilter').innerHTML="<a>Filter Results</a>"
	document.getElementById('searchResultsSummary').innerHTML = theLastSummary
	document.getElementById('plantlist').innerHTML = theLastSearchHTML;
	//document.getElementById('toggleFilter2').style.visibility='hidden'; 
	document.getElementById('toggleFilter').onclick= function () {setFilterLink();};
	
	var myDiv = document.getElementById('searchResults');
	myDiv.scrollTop = theDIVLoc;
}

function setFilterLink () {
	MM_showHideLayers('floatingDivForFilter','','show');
}

function isOdd(num) { return num % 2;}	

function isThree(num) { return num % 3;}	

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

function filterResults() {
	//alert(document.getElementById('type1').checked)
	//alert(theSQL)
	var theSQLtmp=""
	var theTypetmp=""
	var theBloomtmp=""
	var theSizetmp=""
	var theWateringtmp=""
	var theApproptmp=""
	var theHabitattmp=""
	var theNativetmp=""
	var theSoiltmp=""
	var theSiteCondtmp=""
	theEnglishFilter=""
	//MM_showHideLayers("hide")
	//document.getElementById('floatingDivForFilter').style.visibility='hidden';
	// alert("1")
	
	if (theSQL!="") {
		//Plant Types
		if (document.getElementById('type1').checked || document.getElementById('type2').checked || document.getElementById('type3').checked || document.getElementById('type4').checked || document.getElementById('type5').checked || document.getElementById('type6').checked || document.getElementById('type7').checked || document.getElementById('type8').checked || document.getElementById('type9').checked || document.getElementById('type10').checked) {
			
			theEnglishFilter= "Plant Type - "

			if (document.getElementById('type1').checked) {
				theTypetmp+= "'Annual' "
				theEnglishFilter +="Annual, "
			}
			if (document.getElementById('type2').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+= "'Grass' "
				theEnglishFilter +="Grass, "
			}
			if (document.getElementById('type3').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+= "'Perennial' "
				theEnglishFilter +="Perennial, "
			}
			if (document.getElementById('type4').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+="'Shrub (evergreen)' "
				theEnglishFilter +="Shrub (evergreen), "
			}
			if (document.getElementById('type5').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+= "'Shrub (deciduous)' "
				theEnglishFilter +="Shrub (deciduous), "
			}
			if (document.getElementById('type6').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+="'Tree (evergreen)' "
				theEnglishFilter +="Tree (evergreen), "
			}
			if (document.getElementById('type7').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+= "'Tree (deciduous)' "
				theEnglishFilter +="Tree (deciduous), "
			}
			if (document.getElementById('type8').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+= "'Vine' "
				theEnglishFilter +="Vine, "
			}
			if (document.getElementById('type9').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+= "'Fern' "
				theEnglishFilter +="Fern, "
			}
			if (document.getElementById('type10').checked) {
				if (theTypetmp!="") {
					theTypetmp+=" , "
				}
				theTypetmp+= "'Succulent' "
				theEnglishFilter +="Succulent, "
			}

			theSQLtmp=' "Plant_Type" in (' + theTypetmp + ') '
			
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)
			}
			//prompt('',theSQLtmp)
			// alert(theSQLtmp)
			// alert(theEnglishFilter)
		}
			
		//Bloom Times
		if (document.getElementById('bloom1').checked || document.getElementById('bloom2').checked || document.getElementById('bloom3').checked || document.getElementById('bloom4').checked) {
			// alert("bloom")
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Bloom Time - "
			if (document.getElementById('bloom1').checked) {
				theBloomtmp+=' (Bloom_Time like ' + "'%Winter%')"
				//theSQLtmp+=' ("Bloom_Time" like ' + "'%December%' or " + ' "Bloom_Time" like ' + "'%January%' or " + ' "Bloom_Time" like ' + "'%February%' or "+ ' "Bloom_Time" like ' + "%Winter%' )"
				theEnglishFilter +="Winter, "
			}
			if (document.getElementById('bloom2').checked) {
				if (theBloomtmp!="") {
					theBloomtmp+=" or "
				}
				theBloomtmp+=' (Bloom_Time like ' + "'%Spring%')"
				//theSQLtmp+=' ("Bloom_Time" like ' + "'%March%' or " + ' "Bloom_Time" like ' + "'%April%' or " + ' "Bloom_Time" like ' + "'%May%' or "+ ' "Bloom_Time" like ' + "%Spring%' )"
				theEnglishFilter +="Spring, "
			}
			if (document.getElementById('bloom3').checked) {
				if (theBloomtmp!="") {
					theBloomtmp+=" or "
				}
				theBloomtmp+=' (Bloom_Time like ' + "'%Summer%')"
				//theSQLtmp+=' ("Bloom_Time" like ' + "'%June%' or " + ' "Bloom_Time" like ' + "'%July%' or " + ' "Bloom_Time" like ' + "'%August%' or "+ ' "Bloom_Time" like ' + "%Summer%' )"
				theEnglishFilter +="Summer, "
			}
			if (document.getElementById('bloom4').checked) {
				if (theBloomtmp!="") {
					theBloomtmp+=" or "
				}
				theBloomtmp+=' (Bloom_Time like ' + "'%Fall%')"
				//theSQLtmp+=' ("Bloom_Time" like ' + "'%September%' or " + ' "Bloom_Time" like ' + "'%October%' or " + ' "Bloom_Time" like ' + "'%November%' or "+ ' "Bloom_Time" like ' + "%Fall%' )"
				theEnglishFilter +="Fall, "
			}
			if (theSQLtmp=="") {
				theSQLtmp=theBloomtmp
			} else {
				theSQLtmp+=" and ( " + theBloomtmp + ") "
			}
			//prompt('',theSQLtmp)
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)
			}
			//alert(theSQLtmp)
			// alert(theEnglishFilter)
		}
		
		//Size At Maturity
		if (document.getElementById('size1').checked || document.getElementById('size2').checked || document.getElementById('size3').checked || document.getElementById('size4').checked || document.getElementById('size5').checked || document.getElementById('size6').checked) {
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Size at Maturity - "
			if (document.getElementById('size1').checked) {
				theSizetmp+=' (Size_At_Maturity like ' + "'%< 1 ft%')"
				//theSQLtmp+=' "Bloom_Time" = ' + "'Year Round'" 
				theEnglishFilter +="1ft, "
			}
			if (document.getElementById('size2').checked) {
				if (theSizetmp!="") {
					theSizetmp+=" or "
				}
				theSizetmp+=' (Size_At_Maturity like ' + "'%1-3 ft%')"
				theEnglishFilter +="1-3ft, "
			}
			if (document.getElementById('size3').checked) {
				if (theSizetmp!="") {
					theSizetmp+=" or "
				}
				theSizetmp+=' (Size_At_Maturity like ' + "'%4-6 ft%')"
				theEnglishFilter +="4-6ft, "
			}
			if (document.getElementById('size4').checked) {
				if (theSizetmp!="") {
					theSizetmp+=" or "
				}
				theSizetmp+=' (Size_At_Maturity like ' + "'%7-12 ft%')"
				theEnglishFilter +="7-12ft, "
			}
			if (document.getElementById('size5').checked) {
				if (theSizetmp!="") {
					theSizetmp+=" or "
				}
				theSizetmp+=' (Size_At_Maturity like ' + "'%13-24 ft%')"
				theEnglishFilter +="13-24ft, "
			}
			if (document.getElementById('size6').checked) {
				if (theSizetmp!="") {
					theSizetmp+=" or "
				}
				theSizetmp+=' (Size_At_Maturity like ' + "'%> 24 ft%')"
				theEnglishFilter +="Above 24ft, "
			}
			if (theSQLtmp=="") {
				theSQLtmp=theSizetmp
			} else {
				theSQLtmp+=" and ( " + theSizetmp + ") "
			}
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)
			}
		}
		
		//Watering Needs
		if (document.getElementById('watering1').checked || document.getElementById('watering2').checked || document.getElementById('watering3').checked) {
			// alert("ff")
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Watering Needs - "
			if (document.getElementById('watering1').checked) {
				theWateringtmp+=' "Water_Needs" like ' + "'%None%'" 
				theEnglishFilter +="None, "
			}
			if (document.getElementById('watering2').checked) {
				if (theWateringtmp!="") {
					theWateringtmp+=" or "
				}
				theWateringtmp+=' "Water_Needs" like ' + "'%Low%'" 
				theEnglishFilter +="Low, "
			}
			if (document.getElementById('watering3').checked) {
				if (theWateringtmp!="") {
					theWateringtmp+=" or "
				}
				theWateringtmp+=' "Water_Needs like " ' + "'%Moderate%'" 
				theEnglishFilter +="Moderate, "
			}
			if (theSQLtmp=="") {
				theSQLtmp=theWateringtmp
			} else {
				theSQLtmp+=" and ( " + theWateringtmp + ") "
			}
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)
			}
			//prompt('',theSQLtmp)
		}
		
		//Appropriate Location
		if (document.getElementById('approp1').checked || document.getElementById('approp2').checked || document.getElementById('approp4').checked || document.getElementById('approp5').checked || document.getElementById('approp6').checked) {
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Appropriate Location - "
			if (document.getElementById('approp1').checked) {
				theApproptmp+=' ("Appropriate_Location" like ' + "'%Garden%' ) "
				theEnglishFilter +="Garden, "
			}
			if (document.getElementById('approp2').checked) {
				if (theApproptmp!="") {
					theApproptmp+=" or "
				}
				theApproptmp+=' ("Appropriate_Location" like ' + "'%Sidewalk%' ) "
				theEnglishFilter +="Sidewalk, "
			}
			//if (document.getElementById('approp3').checked) {
			//	if (theSQLtmp!="") {
			//		theSQLtmp+=" and "
			//	}
				//theSQLtmp+=' "Appropriate_Location" = ' + "'Streetscape / Public'" 
			//	theSQLtmp+=' ("Appropriate_Location" like ' + "'%Street Tree%' ) "
			//}
			if (document.getElementById('approp4').checked) {
				if (theApproptmp!="") {
					theApproptmp+=" or "
				}
				theApproptmp+=' ("Appropriate_Location" like ' + "'%Roof%' ) "
				theEnglishFilter +="Roof, "
			}
			if (document.getElementById('approp5').checked) {
				if (theApproptmp!="") {
					theApproptmp+=" or "
				}
				theApproptmp+=' ("Stormwater_Benefit" like ' + "'%Yes%' ) "
				theEnglishFilter +="Stormwater, "
			}
			if (document.getElementById('approp6').checked) {
				if (theApproptmp!="") {
					theApproptmp+=" or "
				}
				//theApproptmp+=' ("Appropriate_Location" like ' + "'%;%' ) "
				//theApproptmp+=' ("Appropriate_Location" is not null ) '
				//theApproptmp+=' (Size_At_Maturity like ' + "'%< 1 ft%') or " + ' (Size_At_Maturity like ' + "'%1-3 ft%') or "  +' "Plant_Type" in (\'Perennial\',\'Grass\',\'Vine\',\'Annual\') and  ' + ' "Water_Needs" = ' + "'None'"
				theApproptmp+=' ((Size_At_Maturity like ' + "'%< 1 ft%') or " + ' (Size_At_Maturity like ' + "'%1-3 ft%') or " + ' (Size_At_Maturity like ' + "'%4-6 ft%')) and Water_Needs like '%None%'"
				theEnglishFilter +="Potted Plants, "
			}
			if (theSQLtmp=="") {
				theSQLtmp=theApproptmp
			} else {
				theSQLtmp+=" and ( " + theApproptmp + ") "
			}
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)
			}
			//prompt('',theSQLtmp)
		}
		
		//Habitat Value
		if (document.getElementById('habitat1').checked || document.getElementById('habitat2').checked || document.getElementById('habitat3').checked || document.getElementById('habitat4').checked || document.getElementById('habitat5').checked || document.getElementById('habitat6').checked) {
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Habitat Value - "
			if (document.getElementById('habitat1').checked) {
				
				theHabitattmp+=' ("Habitat_Value" like ' + "'%Buds/Greens%' ) "
				theEnglishFilter +="Buds/Greens, "
			}
			if (document.getElementById('habitat2').checked) {
				if (theHabitattmp!="") {
					theHabitattmp+=" or "
				}
				theHabitattmp+=' ("Habitat_Value" like ' + "'%Cover%' ) "
				theEnglishFilter +="Cover, "
			}
			if (document.getElementById('habitat3').checked) {
				if (theHabitattmp!="") {
					theHabitattmp+=" or "
				}
				theHabitattmp+=' ("Habitat_Value" like ' + "'%Fruit%' ) "
				theEnglishFilter +="Fruit, "
			}
			if (document.getElementById('habitat4').checked) {
				if (theHabitattmp!="") {
					theHabitattmp+=" or "
				}
				theHabitattmp+=' ("Habitat_Value" like ' + "'%Pollinator%' ) "
				theEnglishFilter +="Pollinator, "
			}
			if (document.getElementById('habitat5').checked) {
				if (theHabitattmp!="") {
					theHabitattmp+=" or "
				}
				theHabitattmp+=' ("Habitat_Value" like ' + "'%Nesting%' ) "
				theEnglishFilter +="Nesting, "
			}
			if (document.getElementById('habitat6').checked) {
				if (theHabitattmp!="") {
					theHabitattmp+=" or "
				}
				theHabitattmp+=' ("Habitat_Value" like ' + "'%;%' ) "
				theEnglishFilter +="Multiple, "
			}
			if (theSQLtmp=="") {
				theSQLtmp=theHabitattmp
			} else {
				theSQLtmp+=" and ( " + theHabitattmp + ") "
			}
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)	
			}
			//prompt('',theSQLtmp)
		}
		//prompt('',theSQLtmp)
		
		//Natives
		if (document.getElementById('native1').checked || document.getElementById('native2').checked ) {
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Native - "
			if (document.getElementById('native1').checked) {
				theNativetmp+=' "Climate_Appropriate_Plants" = ' + "'SF Native'" 
				theEnglishFilter +="San Francisco, "
			}
			if (document.getElementById('native2').checked) {
				theNativetmp=' "Climate_Appropriate_Plants" = ' + "'CA Native'"  + " or " + ' "Climate_Appropriate_Plants" = ' + "'SF Native'" 
				theEnglishFilter +="California, "
			}
			if (theSQLtmp=="") {
				theSQLtmp=theNativetmp
			} else {
				theSQLtmp+=" and ( " + theNativetmp + ") "
			}
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)
			}
			//prompt('',theSQLtmp)
		}

		if (document.getElementById('soil1').checked || document.getElementById('soil2').checked || document.getElementById('soil3').checked || document.getElementById('soil4').checked ) {
			//alert("Soil checked")
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Soil - "
			if (document.getElementById('soil1').checked) {				
				theSoiltmp+=' ("Soil_Type" like ' + "'%Clay%'  or " + '"Soil_Type" like ' + "'%All%')"
				theEnglishFilter +="Clay, "
			}
			if (document.getElementById('soil2').checked) {
				if (theSoiltmp!="") {
					theSoiltmp+=" or "
				}
				theSoiltmp+=' ("Soil_type" like ' + "'%Loam%'  or " + '"Soil_Type" like ' + "'%All%')"
				theEnglishFilter +="Loam, "
			}
			if (document.getElementById('soil3').checked) {
				if (theSoiltmp!="") {
					theSoiltmp+=" or "
				}
				theSoiltmp+=' ("Soil_Type" like ' + "'%Sand%'  or " + '"Soil_Type" like ' + "'%All%')"
				theEnglishFilter +="Sand, "
			}
			if (document.getElementById('soil4').checked) {
				if (theSoiltmp!="") {
					theSoiltmp+=" or "
				}
				theSoiltmp+=' ("Soil_Type" like ' + "'%Rock%'  or " + '"Soil_Type" like ' + "'%All%')"
				theEnglishFilter +="Rock, "
			}
			
			if (theSQLtmp=="") {
				theSQLtmp=theSoiltmp
			} else {
				theSQLtmp+=" and ( " + theSoiltmp + ") "
			}
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)	
			}
			//prompt('',theSQLtmp)
		}
		
		if (document.getElementById('sitecond1').checked || document.getElementById('sitecond2').checked || document.getElementById('sitecond3').checked  ) {
			// alert("Site condistions checked")
			if (theEnglishFilter!="") {
				theEnglishFilter+="; "
			}
			theEnglishFilter+= " Site Conditions - "
			if (document.getElementById('sitecond1').checked) {
				theSiteCondtmp+=' ("Suitable_Site_Conditions" like ' + "'%Sun%'  )"
				theEnglishFilter +="Sun, "
			}
			if (document.getElementById('sitecond2').checked) {
				if (theSiteCondtmp!="") {
					theSiteCondtmp+=" or "
				}
				theSiteCondtmp+=' ("Suitable_Site_Conditions" like ' + "'%Part Shade%'  )"
				theEnglishFilter +="Part Shade, "
			}
			if (document.getElementById('sitecond3').checked) {
				if (theSiteCondtmp!="") {
					theSiteCondtmp+=" or "
				}
				theSiteCondtmp+=' ("Suitable_Site_Conditions" like ' + "'%Shade%'  )"
				theEnglishFilter +="Shade, "
			}
			if (theSQLtmp=="") {
				theSQLtmp=theSiteCondtmp
			} else {
				theSQLtmp+=" and ( " + theSiteCondtmp + ") "
			}
			if (theEnglishFilter.substring(theEnglishFilter.length -2,theEnglishFilter.length) ==", ") {
				theEnglishFilter=theEnglishFilter.substring(0,theEnglishFilter.length-2)
			}
			//alert(theSQLtmp) 
		}	
	}
	theEnglishFilter=theEnglishFilter.trim();
	if (theSQLtmp!="") {
		theSQL= theBaseSQL +' and ( '+ theSQLtmp + ' ) ';
	} else {
		theSQL= theBaseSQL + ' ';
	}
	//theSQL=theSQL.replace('order by "Common_Name"',' ' );
	//theSQL+=' order by "Common_Name"';
	//prompt("",theSQL)
	//prompt("",theEnglishFilter)
	// alert(theSearchString)// = " plants found for "

	queryPlant();
	// }
}

function clearFilters(thename) {
	//alert("clear the filter radio boxes, reset the SQL and resend base SQL")
	
	$("input:checkbox").attr('checked', false);
	
    //clearRadios('plantType');
    //clearRadios('bloomTime');
    //clearRadios('sizeAtMaturity');
    //clearRadios('wateringNeeds');
    //clearRadios('appropriateLocation');
    //clearRadios('habitatValue');
    theSQL = theBaseSQL;
	theEnglishFilter=""
    queryPlant(); 
}

function clearCheckboxes() {
	$("input:checkbox").attr('checked', false);
	theEnglishFilter=""
}


function clearRadios(thename) {
    var ele = document.getElementsByName(thename);
    for(var i=0;i<ele.length;i++) {
        ele[i].checked = false;
    }    
}

function showFilter() {
	document.getElementById('floatingDivForFilter').style.visibility='visible';
}

function executeAll() {
	theSQL=' ( 1=1 ) '
	theBaseSQL=' ( 1=1 ) '
	queryPlant();
}

function hideDetail() {
	document.getElementById('floatingDivForDetail').style.visibility='hidden';
}

function gup( thename ){  
	//Returns paramters from the URL
	thename = thename.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
	var regexS = "[\\?&]"+thename+"=([^&#]*)";  
	var regex = new RegExp( regexS );  
	var results = regex.exec( unescape(window.location.href) );  
	if( results == null )    return "";  else    return results[1];
}

function loadOnePlant() {
	if (plantToLoad=="") {
		return;
	}
	if (plantToLoad.toUpperCase()=="ALL" || plantToLoad.toUpperCase()=="EVERYTHING" || plantToLoad.toUpperCase()=="ENTIRE DATABASE" ||  plantToLoad.toUpperCase()=="THE LOT" ) {
		showAddress(plantToLoad);
		return
	}
	thegreenConnectionsHtml=""
	
	require(["esri/tasks/query", "esri/tasks/QueryTask","dojo/dom", "dojo/on", "dojo/domReady!"], function(Query, QueryTask,dom, on){
		// var theTable=theArcGISServerName + "/12"
		var theTable=theArcGISServerName + "/13"
		queryTask = new QueryTask(theTable)
		query = new Query();
		var theSQL3=""
		
		query.returnGeometry = false;
		//query.outFields = ["Common_Name","Latin_Name","Former_Latin_Name","Plant_Type","Plant_Communities","Bloom_Time","Appropriate_Location","Flower_Color","Size_at_Maturity","Climate_Appropriate_Plants","Suitable_Site_Conditions","Soil_Type","Pruning_Needs","Water_Needs","Habitat_Value","Associated_Wildlife","Additional_Characteristices___Notes","AtoC","GCRoute1","GCRoute2","GCRoute3","GCRoute4","GCRoute5","GCRoute6","GCRoute7","GCRoute8","GCRoute9","GCRoute10","GCRoute11","GCRoute12","GCRoute13","GCRoute14","GCRoute15","GCRoute16","GCRoute17","GCRoute18","GCRoute19","GCRoute20","GCRoute21","GCRoute22","GCRoute23","GCRoute24","PhotoCredit01","PhotoCredit02","PhotoCredit03","PhotoCredit04" ];
		query.outFields = ["Common_Name","Latin_Name","Family_Name","Former_Latin_Name","Plant_Type","Plant_Communities","Bloom_Time","Appropriate_Location","Flower_Color","Size_at_Maturity","Climate_Appropriate_Plants","Suitable_Site_Conditions","Soil_Type","Pruning_Needs","Water_Needs","Habitat_Value","Associated_Wildlife","Additional_Characteristices_Notes","Street_Tree_List","Suggested_Green_Connection_Routes","Stormwater_Benefit","Nurseries","Super60","Super60_int","Thrifty150_int","Top20_int"];
		theSQL3 = "Upper(Latin_Name) ='" + plantToLoad + "'" ;	
		//alert(plantToLoad)
		if (plantToLoad=="ALL") {
			theSQL3="1=1"
		}
		
		query.where = theSQL3
		queryTask.execute(query, showCustomResultsQuery);
		theBaseSQL = theSQL3
		//alert(query.where )
		function showCustomResultsQuery(results) {
			
			thePlantResults=results

			var s = "";
			
			theSearchString = " plants found for " + plantToLoad 
			
			if (theEnglishFilter.length>2) {
				theLastSummary="We found <strong>" + results.features.length + "</strong> plants for " + theSearchString + ". The following filters were applied: " + theEnglishFilter + ". <br> Give this list to your landscaper or take it down to your local nursery.";
			} else {
				theLastSummary = "We found <strong>" + results.features.length + "</strong> plants for " + theSearchString + "."
			}

			document.getElementById('searchResultsSummary').innerHTML = theLastSummary
			
			
            s +='<table border="0" cellpadding="0" cellspacing="0" id="PlantList" style="width:790px">'

            var counter=0
			for (var i=0, il=results.features.length; i<il; i++) {
				
				var featureAttributes = results.features[i].attributes;
				var theLatinName = featureAttributes["Latin_Name"]

				if (theLatinName==null) {theLatinName=""};
				theLatinName=trim11(theLatinName);
				var theCommonName = featureAttributes["Common_Name"] 
				if (theCommonName==null) {theCommonName=theLatinName};
				if(counter==0) {
					s+="<tr>"
				}
				counter=counter+1;
				
				imgURL = "images/plants/medium/" + theLatinName + "01.jpg"
				var theicon=""
				var theNative=featureAttributes["Climate_Appropriate_Plants"]

				if(theNative) {
					theNative=theNative.trim()
				}

				switch(theNative) {
				    case 'CA Native':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ca.png' title='California Native' alt='California Native'>"
					break;
				    case 'SF Native':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-sf.png' title='San Francisco Native' alt='San Francisco Native'>" + "<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ca.png' title='California Native' alt='California Native'>"
					break;
				     case 'Exotic':
					theicon="<img style='PADDING-TOP: 5px; PADDING-RIGHT:3px' src='images/native-ex.png' title='Non-native; exotic' alt='Non-native; exotic'>"
					break;
				    default:
				}
				s+='<td width="95px" align="middle" valign="top" ><img height="90px" width="90px" onClick="plantDetail(' + "'" + i + "'" +');" src="' + imgURL + '" alt="' + theLatinName+ '"></td><td valign="top" width="162"><a href="javascript:void(0);" onClick="plantDetail(' + "'" + i + "'" +');">'  +  theCommonName +'</a><br><h2>' + theLatinName +'</h2>'+ theicon +'</td>';

				if (counter==3) {
					s+="</tr>"
					counter=0;
				}
				}
				if (i==0) {
					s+='<tr>';
					s+='<td width="95px" align="middle" valign="top" ></td><td valign="top" width="162"></td>';
					s+='<td width="95px" align="middle" valign="top" ></td><td valign="top" width="162"></td>';
					s+='<td width="95px" align="middle" valign="top" ></td><td valign="top" width="162"></td>';
				}
				if (i==1) {
					s+='<td width="95px" align="middle" valign="top" ></td><td valign="top" width="162"></td>';
					s+='<td width="95px" align="middle" valign="top" ></td><td valign="top" width="162"></td>';
				}
				if (i==2) {
					s+='<td width="95px" align="middle" valign="top" ></td><td valign="top" width="162"></td>';
				}
				if (counter!=3) {
					s+="</tr>"
				}
					
				s+="</table><br>"
						
				dom.byId("plantlist").innerHTML=s;
				theLastSearchHTML=s
				document.getElementById('greenConnectionsList').innerHTML =""
				plantDetail(0);
			}	
	});	
}

function printResults() {
	//alert(theEnglishFilter)
	//alert(theLastSummary)
	//prompt("",thePlantListHtmlToPrint)
	//prompt("",plantListArray.length)
	var printHTML = "<!DOCTYPE html>"
	printHTML +="\n<html lang='en-US'>"
	printHTML +="\n<head>"
	printHTML +="\n<meta charset='UTF-8' />"
	printHTML +='<meta http-equiv="X-UA-Compatible" content="IE=7">'
	// printHTML +="\n<LINK REL='SHORTCUT ICON' HREF='http://50.17.237.182/PIM/images/bannericonTransSmall.ico'>"
	printHTML +="\n<LINK REL='SHORTCUT ICON' HREF='http://" + theServerName + ":6080/PIM/images/bannericonTransSmall.ico'>"
	printHTML +="\n<title>SF Plant Finder - Printable Page</title>"

	printHTML +="\n<link rel='stylesheet' href='css/style.css'>"
	//printHTML +="\n<link rel='stylesheet' href='http://" + theServerName + "/plantsf/css/print.css'>"
	printHTML += "\n<style type='text/css'>"
	printHTML += "\n@media print {"
	printHTML += "\n    .NoPrint {display: none;}"
	printHTML += "\n}"
	printHTML += "\n</style>"
	printHTML +="\n<script>var dojoConfig = {parseOnLoad: true};</script>"
	
	printHTML +="\n<script src='js/printable.js'></script>"
	printHTML +="\n</head>"
	printHTML +="\n<body class='claro' >"
	
	printHTML +="<div class='no-print-borders' id='mainContentShell' >"
	printHTML +="<div class='no-print-borders' id='mainContent' >"
	printHTML +="<div class='no-print-borders' id='mainContent-SearchResults' >"

	printHTML +="<div class='no-print-borders' id='info' style='min-height: 1000px;'>"
	printHTML += "<div class='no-print-borders' id='searchResults' >"
	
	printHTML +="\n<span id='searchResultsSummary'>" + theLastSummary.replace(" (check for nursery availability by clicking on a plant):",". Give this list to your landscaper or take it to your local nursery.")+"</span><br><br>"
	//alert(plantListArray[1])
	
	for (var i=0, il=plantListArray.length; i<il; i++) {
		printHTML +="<div style=' width: 230px; height: 70px; float:left'>" + plantListArray[i] + "</div>"
		
	}

	//printHTML +=thePlantListHtmlToPrint;
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</body>"
	printHTML +="</html>"
	OpenWindow=window.open("", "PrintPlantList", "height=650, width=1050, status=yes, toolbar=yes,scrollbars=yes,menubar=yes,resizable=yes");
	OpenWindow.document.write(printHTML)
	OpenWindow.document.close()
	OpenWindow.focus(); 
}

function printInfo() {
	var printHTML = "<!DOCTYPE html>"
	printHTML +="\n<html lang='en-US'>"
	printHTML +="\n<head>"
	printHTML +="\n<meta charset='UTF-8' />"
	printHTML +='<meta http-equiv="X-UA-Compatible" content="IE=7">'
	// printHTML +="\n<LINK REL='SHORTCUT ICON' HREF='http://50.17.237.182/PIM/images/bannericonTransSmall.ico'>"
	printHTML +="\n<LINK REL='SHORTCUT ICON' HREF='http://" + theServerName + ":6080/PIM/images/bannericonTransSmall.ico'>"
	printHTML +="\n<title>SF Plant Finder - Printable Page</title>"

	// printHTML +="\n<link rel='stylesheet' href='http://50.17.237.182/plantsf/css/style.css'>"
	printHTML +="\n<link rel='stylesheet' href='http://" + theServerName + ":6080/plantsf/css/style.css'>"
	//printHTML +="\n<link rel='stylesheet' href='http://" + theServerName + "/plantsf/css/print.css'>"
	printHTML += "\n<style type='text/css'>"
	printHTML += "\n@media print {"
	printHTML += "\n    .NoPrint {display: none;}"
	printHTML += "\n}"
	printHTML += "\n</style>"
	printHTML +="\n<script>var dojoConfig = {parseOnLoad: true};</script>"
	
	printHTML +="\n<script src='js/printable.js'></script>"
	printHTML +="\n</head>"
	printHTML +="\n<body class='claro'>"
	
	printHTML +="<div id='mainContentShell'>"
	printHTML +="<div id='mainContent'>"
	printHTML +="<div id='mainContent-SearchResults'>"

	printHTML +="<div id='info'>"
	printHTML += "<div id=plantInfo' style='display: block;'>"

	printHTML +=thePlantDetailHtmlToPrint;
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</div>"
	printHTML +="</body>"
	printHTML +="</html>"
	OpenWindow=window.open("", "PrintPlantDetails", "height=650, width=1050, status=yes, toolbar=yes,scrollbars=yes,menubar=yes,resizable=yes");
	OpenWindow.document.write(printHTML)
	OpenWindow.document.close()
	OpenWindow.focus(); 
}

function getJPGDoc(url,thePhotoNum) {
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
		 //alert("this place2")
		 //deal with Firefox 3 which has a bug affecting non asynchronous ajax calls
		  xmlhttp.onload=xmlhttp.onerror = xmlhttp.onabort = function() {
			var value = xmlhttp.responseText
			//alert(value)
			  //alert(value);
			theid="#photo"+thePhotoNum
			if (value=="true") {
				//$(theid).show();
			} else {
				$(theid).hide();
				$(theid).closest('tr').remove();
			}
		}
	} else {
		  //deal with all other browsers
		  //alert("this place")
		xmlhttp.onreadystatechange= function()
		    {
			//alert(xmlhttp.readyState)
			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				//alert(xmlhttp.responseText)
				var value = xmlhttp.responseText
				//console.log(url + ": " +value)
				//alert(thePhotoNum + "" + value);
				
				theid="#photo"+thePhotoNum
				if (value=="true") {
					//$(theid).show();
				} else {
					$(theid).hide();
					$(theid).closest('tr').remove();
				}
			}
		  }
	  }
	xmlhttp.open("GET",url,true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(params);
}


$('#start-tour').click(function(){
    // Start the tour
    if(!tour.start()){
        tour.restart();
    }
});