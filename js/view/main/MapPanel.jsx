"use strict";
define(["react", "leaflet", "config.map"], function(React, L, config) {
	return React.createClass({
		componentWillMount: function() {
			this.props.bus.choropleth_settings.on("dataset", this.on_dataset);
		},

		componentDidMount: function() {
			var that = this;

			var tile_layer = L.tileLayer(config.url, {
				attribution: config.attribution,
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

			this.map.on("zoomend", this.on_zoom);
			this.on_zoom();
		},

		componentWillUnmount: function() {
			this.props.bus.choropleth_settings.off("dataset", this.on_dataset);
			this.map = null;
			this.current_layer = null;
		},

		render: function() {
			return (
				<div className="map-panel"></div>
			);
		},

		on_dataset: function(e) {
			console.log("MapPanel: ", e);
		},

		set_layer: function(layer) {
			var that = this;

			if(this.current_layer_name === layer) return;
			this.current_layer_name = layer;
			
			var last_layer = this.current_layer;
			this.current_layer = null;


			if(this.saved_layers[layer]) {
				if(last_layer) this.map.removeLayer(last_layer);
				this.current_layer = this.saved_layers[layer];
				this.map.addLayer(this.current_layer);
			}else{
				var options = {
					smoothFactor: 2.0,
					style: {
						weight: 3,
						color: "#77cc00",
					},
					onEachFeature: this.on_feature,
				};
				$.get(layer).success(function(data) {
					if(last_layer) that.map.removeLayer(last_layer);
					that.saved_layers[layer] = that.current_layer = L.geoJson(data, options);
					that.map.addLayer(that.current_layer);
				});
			}
		},

		on_feature: function(feature, layer) {
			var that = this;
			layer.on({
				click: function(e) {
					that.map.fitBounds(e.target.getBounds());
				},
			});
		},

		on_zoom: function() {
			if(this.map.getZoom() >= 11) {
				this.set_layer("json/MuniCities.psgc.json");
			}else if(this.map.getZoom() >= 9) {
				this.set_layer("json/Provinces.psgc.json");
			}else{
				this.set_layer("json/Regions.psgc.json");
			}
		},
	});
});