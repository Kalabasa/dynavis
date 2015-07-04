"use strict";
define(["react", "leaflet"], function(React, L) {
	return React.createClass({
		componentDidMount: function() {
			var tile_layer = L.tileLayer("http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={access_token}", {
				attribution: "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='http://mapbox.com'>Mapbox</a>",
				mapid: "mapbox.streets-basic",
				access_token: "pk.eyJ1Ijoia2FsYWJhc2EiLCJhIjoiRmFCU2ZQdyJ9.VfSUFTi8_MjFMDM5KNvSVg",
			});

			var map = this.map = L.map(this.getDOMNode(), {
				center: [13, 122],
				zoom: 6,
				layers: [tile_layer],
				minZoom: 5,
				maxZoom: 14,
				maxBounds: [
					[4, 114],
					[22, 130]
				],
			});

			$.get("json/Regions.json").success(function(data) {
				L.geoJson(data, {
					smoothFactor: 2.0,
					weight: 3,
					color: "#77cc00",
				}).addTo(map);
			});
		},

		componentWillUnmount: function() {
			this.map = null;
		},

		render: function() {
			return (
				<div className="map-panel"></div>
			);
		},
	});
});