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

			this.style_neutral = {
				weight: 2,
				opacity: 0.2,
				color: "#7f7f7f",
				fillOpacity: 0.4,
				fillColor: "#c7c7c7",
				className: "fadein map-polygon",
			};
			this.style_colored = _.defaults({
				opacity: 1,
				color: "#ffffff",
				fillOpacity: 0.8,
				className: "map-polygon",
			}, this.style_neutral);

			this.geoJson_cache = {};
			this.current_geoJson = null;
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
				this.colorize_layer(e, layers[i], this.current_geoJson);
			};
		},

		colorize_layer: function(datasets, layer, geoJson){
			if(datasets.dataset1) {
				var datapoints = datasets.dataset1.get_datapoints();
				if(datapoints.size()) {
					loop.call(this, layer, datapoints, this.current_geoJson);
				}else{
					datapoints.once("sync", loop.bind(this, layer, datapoints, this.current_geoJson));
				}
			}

			function loop(l, datapoints, geoJson) {
				if(this.current_geoJson == geoJson) {
					if(l.getBounds().intersects(this.map.getBounds())) {
						var area_code = parseInt(l.feature.properties.PSGC);
						var value = datapoints.get_value(area_code, this.state.year);
						if(value == null) {
							l.setStyle(this.style_neutral);
						}else{
							var min = datapoints.get_min_value();
							var max = datapoints.get_max_value();
							var y = (value-min)/(max-min);
							l.setStyle(_.defaults({
								fillColor: this.get_color(y),
							}, this.style_colored));
						}
					}else{
						setTimeout(loop.bind(this), 100, l, datapoints, geoJson);
					}
				}
			}
		},

		set_layer: function(layer) {
			var that = this;

			if(this.geoJson_cache[layer] === this.current_geoJson) {
				return;
			}

			if(this.geoJson_cache[layer]) {
				replaceGeoJSON(this.current_geoJson = this.geoJson_cache[layer]);
			}else{
				var options = {
					smoothFactor: 2.0,
					style: this.style_neutral,
					onEachFeature: this.on_feature,
				};
				$.get(layer).success(function(data) {
					var geoJson = that.current_geoJson = that.geoJson_cache[layer] = L.geoJson(data, options);
					replaceGeoJSON(geoJson);
				});
			}

			function replaceGeoJSON(geoJson) {
				var old_layers = that.main_layer.getLayers();
				var n = old_layers.length;
				var c = 0;
				for (var i = 0; i < n; i++) {
					var t = i/n * 2000;
					if(c < 200 && old_layers[i].getBounds().intersects(that.map.getBounds())) {
						t = c++;
					}
					setTimeout(function(i, l) {
						that.main_layer.removeLayer(l);
					}, 1000 + t, i, old_layers[i]);
				};

				var new_layers = geoJson.getLayers();
				for (var i = 0; i < new_layers.length; i++) {
					setTimeout(function loop(l, geoJson) {
						if(that.current_geoJson == geoJson) {
							if(l.getBounds().intersects(that.map.getBounds())) {
								if(that.datasets && (that.datasets.dataset1 || that.datasets.dataset2)) {
									that.colorize_layer(that.datasets, l, geoJson);
								}
								that.main_layer.addLayer(l);
							}else{
								setTimeout(loop.bind(this), 100, l, geoJson);
							}
						}
					}.bind(that), i % 1000, new_layers[i], geoJson);
				};
			}
		},

		get_color: function(t) {
			// Color curve function generated from:
			// https://dl.dropboxusercontent.com/u/44461887/Maker/EquaMaker.swf
			if (0 <= t && t < 0.5) t = 255 * (0.03219*t*t + 1.29187*t + 0);
			else if (0.5 <= t && t <= 1) t = 255 * (-1.26406*t*t + 2.58813*t + -0.32405);

			var r,g,b;
			var t2,t3;
			t3 = (t2 = t * t) * t;

			if (0 <= t && t < 23) r = 255;
			else if (23 <= t && t <= 255) r = 0.00031706005872770226*t2 + -0.45603993103750085*t + 264.4266608327296;

			if (0 <= t && t < 4) g = 255;
			else if (4 <= t && t < 176) g = -0.000011933735924994102*t3 + 0.0017172534127885939*t2 + -1.4012094005738578*t + 259.57812530678996;
			else if (176 <= t && t <= 255) g = 0;

			if (0 <= t && t <= 255) b = -0.000012434701152857986*t3 + 0.008053975696229959*t2 + -1.7552836708866706*t + 201;

			return "rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";
		},

		on_feature: function(feature, layer) {
			var that = this;

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
					// TODO: Use React view in the popup
					var area_name = feature.properties.NAME_2 || feature.properties.NAME_1 || feature.properties.PROVINCE || feature.properties.REGION;
					var info = "";
					if(that.datasets) {
						var dataset_name = that.datasets.dataset1.get("name");
						info = "<p> " + dataset_name + " (" + that.state.year + ") = " + (value == null ? "no data" : value.toFixed(2)) + "</p>";
					}
					that.map.openPopup("<div><h3>" + area_name + "</h3>" + info + "</div>", e.latlng);
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