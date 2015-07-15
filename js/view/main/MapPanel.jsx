"use strict";
define(["react", "leaflet", "config.map"], function(React, L, config) {
	return React.createClass({
		getInitialState: function() {
			return {
				year: 2013,
			}
		},

		componentWillMount: function() {
			this.props.bus.choropleth_settings.on("dataset", this.on_dataset);
		},

		componentDidMount: function() {
			var that = this;

			var tile_layer = L.tileLayer(config.url, {
				attribution: config.attribution,
			});

			this.map = L.map(this.getDOMNode(), {
				center: [13, 122],
				zoom: 6,
				layers: [tile_layer],
				minZoom: 5,
				maxZoom: 14,
				maxBounds: [
					[-1, 109],
					[27, 135]
				],
			});

			this.neutral_style = {
				weight: 2,
				opacity: 0.2,
				color: "#7f7f7f",
				fillOpacity: 0.4,
				fillColor: "#c7c7c7",
			};

			this.geoJson_cache = {};
			this.current_layer_name = null;
			this.main_layer = L.layerGroup([]).addTo(this.map);

			this.datasets = null;

			this.map.on("zoomend", this.on_zoom);
			this.on_zoom();
		},

		componentWillUnmount: function() {
			this.props.bus.choropleth_settings.off("dataset", this.on_dataset);
			this.map = null;
			this.current_layer_name = null;
		},

		render: function() {
			return (
				<div className="map-panel"></div>
			);
		},

		on_dataset: function(e) {
			this.datasets = e;
			var layers = this.main_layer.getLayers();
			for (var i = 0; i < layers.length; i++) {
				this.colorize_layer(e, layers[i]);
			};
		},

		colorize_layer: function(datasets, layer){
			var callback = function(datapoints, layer){
				function loop(that, l, datapoints) {
					if(l.getBounds().intersects(that.map.getBounds())) {
						var area_code = parseInt(l.feature.properties.PSGC);
						var value = datapoints.get_value(area_code, that.state.year);
						if(value == null) {
							l.setStyle(that.neutral_style);
						}else{
							var min = datapoints.get_min_value();
							var max = datapoints.get_max_value();
							var y = (value-min)/(max-min);
							l.setStyle({
								weight: 2,
								opacity: 1,
								color: "#efefef",
								fillOpacity: 0.8,
								fillColor: that.get_color(y),
							});
						}
					}else{
						setTimeout(loop, 100, l, datapoints);
					}
				}
			};

			if(datasets.dataset1) {
				var datapoints = datasets.dataset1.get_datapoints();
				if(datapoints.size()) {
					callback.call(this, datapoints, layer);
				}else{
					datapoints.once("sync", callback.bind(this, datapoints, layer));
				}
			}
		},

		set_layer: function(layer) {
			var that = this;

			if(this.current_layer_name === layer) return;
			this.current_layer_name = layer;
			
			this.geoJson_cache = {};

			var replaceGeoJSON = function(geoJson) {
				for (var i = 0; i < that.update_timers.length; i++) {
					clearInterval(that.update_timers[i]);
				};
				that.update_timers = [];

				var old_layers = that.main_layer.getLayers();
				var n = old_layers.length;
				var c = 0;
				for (var i = 0; i < n; i++) {
					var t = i/n * 2000;
					if(c < 300 && old_layers[i].getBounds().intersects(that.map.getBounds())) {
						t = c++;
					}
					setTimeout(function(i, l) {
						that.main_layer.removeLayer(l);
					}, t, i, old_layers[i]);
				};

				var new_layers = geoJson.getLayers();
				for (var i = 0; i < new_layers.length; i++) {
					setTimeout(function loop(that, l) {
						if(l.getBounds().intersects(that.map.getBounds())) {
							console.log("ADDED " + l.feature.properties.REGION);
							if(that.datasets && (that.datasets.dataset1 || that.datasets.dataset2)) {
								that.colorize_layer(that.datasets, l);
							}
							that.main_layer.addLayer(l);
						}else{
							setTimeout(loop, 100, that, l);
						}
					}, i % 100, that, new_layers[i]);
				};
			};

			if(this.geoJson_cache[layer]) {
				replaceGeoJSON(this.geoJson_cache[layer]);
			}else{
				var options = {
					smoothFactor: 2.0,
					style: this.neutral_style,
					onEachFeature: this.on_feature,
				};
				$.get(layer).success(function(data) {
					var geoJson = that.geoJson_cache[layer] = L.geoJson(data, options);
					replaceGeoJSON(geoJson);
				});
			}
		},

		get_color: function(t) {
			// Color curve function generated from:
			// https://dl.dropboxusercontent.com/u/44461887/Maker/EquaMaker.swf
			var t2,t3;
			t *= 255;
			t3 = (t2 = t * t) * t;

			var r,g,b;

			if(0 <= t && t < 21) r = 0.0005494505494505475*t^3 + -0.021978021978020568*t^2 + 0.2697802197802144*t + 248.99999999999997;
			else if(21 <= t && t < 240) r = -0.003084126113487308*t^2 + 0.0864649829424563*t + 248.60545727242896;
			else if(240 <= t && t <= 255) r = 0;

			if(0 <= t && t < 8) g = 255;
			else if(8 <= t && t < 247) g = 0.00001680682780934362*t^3 + -0.0033371613483054656*t^2 + -1.2666196934332672*t + 264.3379307779192;
			else if(247 <= t && t <= 255) g = 0;

			if(0 <= t && t <= 255) b = -0.00002480554424041227*t^3 + 0.011311636407086993*t^2 + -1.6743759583352642*t + 170;

			return "rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";
		},

		on_feature: function(feature, layer) {
			var that = this;

			console.log(feature.properties.REGION);
			var area_code = parseInt(feature.properties.PSGC, 10);

			layer.on({
				click: function(e) {
					var value = null;
					if(that.datasets) {
						var dataset = that.datasets.dataset1;
						var datapoints = dataset.get_datapoints();
						if(datapoints) {
							value = datapoints.get_value(area_code, that.state.year);
						}
					}
					that.map.openPopup("<div>name: " + feature.properties + " value: " + value + "</div>", e.latlng);
				},
			});
		},

		on_zoom: function() {
			if(this.map.getZoom() >= 10) {
				this.set_layer("json/MuniCities.psgc.json");
			}else if(this.map.getZoom() >= 8) {
				this.set_layer("json/Provinces.psgc.json");
			}else{
				this.set_layer("json/Regions.psgc.json");
			}
		},
	});
});