"use strict";
define(function() {
	return { // CartoDB
		url: "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
		attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
	};
	return { // MapBox
		url: "http://api.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia2FsYWJhc2EiLCJhIjoiYWMzMTA1MDE4NmE4YzhiN2E1NzkwZDZkYzIxMmM4YzQifQ.XQpLXcvHIRJdxmdgOo9USA",
		atrribution: "<a href='https://www.mapbox.com/about/maps/' target='_blank'>&copy; Mapbox &copy; OpenStreetMap</a> <a class='mapbox-improve-map' href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a>",
	};
	return { // OpenStreetMap
		url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
	};
});