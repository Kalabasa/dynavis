"use strict";
define(["react", "leaflet"], function(React, L) {
	return React.createClass({
		componentDidMount: function() {
			var that = this;

			var tile_layer = L.tileLayer("http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={access_token}", {
				attribution: "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='http://mapbox.com'>Mapbox</a>",
				mapid: "mapbox.streets-basic",
				access_token: "pk.eyJ1Ijoia2FsYWJhc2EiLCJhIjoiZjVhY2RiNmM0MTBlMTU0NjJiOGZlYmVlOWUxYTNjZjcifQ.BIFNQNrabSVgqSgtZZ5VQA",
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

			this.saved_layers = {};
			this.current_layer_name = null;
			this.current_layer = null;
			this.set_layer("json/Regions.json");

			this.map.on("zoomend", this.on_zoom);
		},

		componentWillUnmount: function() {
			this.map = null;
			this.current_layer = null;
		},

		render: function() {
			return (
				<div className="map-panel"></div>
			);
		},

		set_layer: function(layer) {
			var that = this;

			if(this.current_layer_name === layer) return;
			this.current_layer_name = layer;

			if(this.current_layer) {
				this.map.removeLayer(this.current_layer);
				this.current_layer = null;
			}

			var props = {
				smoothFactor: 2.0,
				weight: 3,
				color: "#77cc00",
			};

			if(this.saved_layers[layer]) {
				this.current_layer = this.saved_layers[layer];
				this.map.addLayer(this.current_layer);
			}else{
				$.get(layer).success(function(data) {
					that.saved_layers[layer] = that.current_layer = L.geoJson(data, props)
					that.map.addLayer(that.current_layer);
				});
			}
		},

		on_zoom: function() {
			if(this.map.getZoom() >= 9) {
				this.set_layer("json/Provinces.json");
			}else{
				this.set_layer("json/Regions.json");
			}
		},
	});
});