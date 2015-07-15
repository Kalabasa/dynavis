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
						weight: 2,
						opacity: 0.2,
						color: "#7f7f7f",
						fillOpacity: 0.4,
						fillColor: "#c7c7c7",
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
			return value > 0.7 ? "#800026" :
				value > 0.4  ? "#bd0026" :
				value > 0.2  ? "#e31a1c" :
				value > 0.1  ? "#fc4e2a" :
				value > 0.05  ? "#fd8d3c" :
				value > 0.02  ? "#feb24c" :
				value > 0.01  ? "#fed976" :
					"#ffeda0";
		},

		on_feature: function(feature, layer) {
			var that = this;

			var area_code = parseInt(feature.properties.PSGC, 10);
			var year = 2013;

			layer.on({
				click: function(e) {
					var datapoints = that.datasets.dataset1.get_datapoints();
					if(datapoints) {
						var value = datapoints.get_value(area_code, year);
						console.log(value);
					}
				},
			});

			var datapoints_callback = function(datapoints){
				that.current_layer.resetStyle(layer);
				var value = datapoints.get_value(area_code, year);
				if(value != null) {
					var min = datapoints.get_min_value();
					var max = datapoints.get_max_value();
					var y = (value-min)/(max-min);
					layer.setStyle({
						weight: 3,
						opacity: 1,
						color: "#efefef",
						fillOpacity: 0.7,
						fillColor: that.get_color(y),
					});
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

			if(this.datasets && (this.datasets.dataset1 || this.datasets.dataset2)) {
				dataset_callback(this.datasets);
			}else{
				this.props.bus.choropleth_settings.on("dataset", dataset_callback);
			}
		},

		on_zoom: function() {
			if(this.map.getZoom() >= 10) {
				this.set_layer("json/MuniCities.psgc.json");
			}else if(this.map.getZoom() >= 7) {
				this.set_layer("json/Provinces.psgc.json");
			}else{
				this.set_layer("json/Regions.psgc.json");
			}
		},
	});
});