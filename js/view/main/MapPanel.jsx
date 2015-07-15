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

			this.datasets = null;

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
			this.datasets = e;
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

		get_color: function(value) {
			value *= 1000;
			return
				value > 1000 ? "#800026" :
				value > 500  ? "#BD0026" :
				value > 200  ? "#E31A1C" :
				value > 100  ? "#FC4E2A" :
				value > 50   ? "#FD8D3C" :
				value > 20   ? "#FEB24C" :
				value > 10   ? "#FED976" :
					"#FFEDA0";
		},

		on_feature: function(feature, layer) {
			var that = this;
			layer.on({
				click: function(e) {
					that.map.fitBounds(e.target.getBounds());
					console.log(feature.properties.PSGC);
				},
			});

			var area_code = parseInt(feature.properties.PSGC, 10);
			var year = 2013;

			var datapoints_callback = function(datapoints){
				var value = datapoints.get_value(area_code, year);
				if(value !== null) {
					layer.setStyle(that.get_color(value));
				}
			};

			var dataset_callback = function(datasets){
				if(datasets.dataset1) {
					window.dataset = datasets.dataset1;
					var datapoints = datasets.dataset1.get_datapoints();
					if(datapoints.size()) {
						datapoints_callback(datapoints);
					}else{
						datapoints.once("sync", datapoints_callback);
					}
				}
			};

			if(this.datasets && (this.datasets.datasets1 || this.datasets.datasets2)) {
				dataset_callback(this.datasets);
			}else{
				this.props.bus.choropleth_settings.on("dataset", dataset_callback);
			}
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