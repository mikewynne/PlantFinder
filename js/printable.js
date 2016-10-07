var findTask = null;
var params = null;
function checkPrintReport(theOption) {
	if (document.getElementById(theOption).style.display=='none') {
		document.getElementById(theOption).style.display='inline';  
	} else {
		document.getElementById(theOption).style.display='none';  
	}
}
function init(centerX,centerY,mapZoom,pointX,pointY) {
	//alert(navigator.userAgent)
	//alert(IEVersion)

	var theServerName = window.location.host;
	findTask = new esri.tasks.FindTask(theArcGISServerName);
	params = new esri.tasks.FindParameters();
	params.layerIds = thelayerIds
	params.searchFields = [thesearchFields]
	params.outSpatialReference = {'wkid':102113};
	params.returnGeometry = true;
	params.searchText = thesearchText

	params.contains = thecontains

	map = new esri.Map('map_canvas',
	            {
	                basemap: 'topo',
			center: [-122.4425, 37.754],
	                zoom: mapZoom,
			slider: false
         }	);
        var centerpoint = new esri.geometry.Point([centerX,centerY],new esri.SpatialReference({'wkid':102113}))
	var point = new esri.geometry.Point([pointX,pointY],new esri.SpatialReference({'wkid':102113}))
	map.centerAt(centerpoint)
	
	if ((IEVersion>1) && (IEVersion<9)) {
		//Don't add the dynamic layer if it's an earlier version on IE as this IE cannot print maps with dynamic theme.
	} else {
		var imageParams = new esri.layers.ImageParameters();
		imageParams.layerIds = [9999];
		imageParams.transparent = true;
		dynamicMap = null;
		dynamicMap = new esri.layers.ArcGISDynamicMapServiceLayer(theArcGISServerName, {"opacity":0.75, "imageParameters":imageParams});
		dynamicMap.setVisibleLayers(visLayers);
		map.addLayer(dynamicMap);
	}
	if (pointX) {
		var sms = new esri.symbol.PictureMarkerSymbol('http://ec2-50-17-237-182.compute-1.amazonaws.com/PIM2/images/blue.png', 32, 32).setOffset(0,16);
		graphic = new esri.Graphic(point,sms);
		myGraphic = graphic
	}
	//setTimeout('loadGraphic();',500);
	//if ((navigator.userAgent.indexOf('MSIE')>0) && (theSearchType="Address")) { 
	//findTask.execute(params, findCompleteCallback);
	if (theSearchType=="mapClick") {
		setTimeout('loadGraphic();',500);
	} else {
		findTask.execute(params, findCompleteCallback);
		//setTimeout('startFind();',500)
	}
		//findTask.execute(params, findCompleteCallback);
	//}
}
function loadGraphic() {
	map.graphics.add(myGraphic);
	resizeMap()
}

function resizeMap() {
	tmpZoomLevel=map.getLevel()
	map.resize();
	map.reposition();
	setTimeout(refreshMapExtent,650);
}
function refreshMapExtent() {
	map.setExtent(map.extent, true);
}
function startFind() {
	//alert(theSearchType)
	findTask.execute(params, findCompleteCallback);
}
function findCompleteCallback(findResults){
	//alert("in find complete callback\n" +  findResults.length )
	if (findResults.length > 0 ) {
		var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), new dojo.Color([100,100,255,0.5]));        
		thefindResults = findResults
		theRes = findResults[0]
		var graphic =theRes.feature
		graphic.setSymbol(polygonSymbol);
		map.graphics.add(graphic);
	} else {
		setTimeout('loadGraphic();',500);
	}
	
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
function checkVersion()
{
  var msg = "You're not using Internet Explorer.";
  var ver = getInternetExplorerVersion();

  if ( ver > -1 )
  {
    if ( ver >= 8.0 ) 
      msg = "You're using a recent copy of Internet Explorer."
    else
      msg = "You should upgrade your copy of Internet Explorer.";
  }
  alert( msg );
}
