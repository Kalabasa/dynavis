"use strict";
define(["underscore", "leaflet"], function(_, L) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			var that = this;

			this._style_neutral = {
				weight: 2,
				opacity: 0.2,
				color: "#7f7f7f",
				fillOpacity: 0.4,
				fillColor: "#c7c7c7",
				className: "map-polygon visible",
			};
			this._style_colored = _.defaults({
				opacity: 1,
				color: "#ffffff",
				fillOpacity: 0.8,
			}, this._style_neutral);
			this._style_highlight = {
				weight: 3,
				color: "#000000",
				opacity: 1,
			};

			this.geojson_options = {
				smoothFactor: 2.0,
				style: this._style_neutral,
			};

			this._current_geojson = null;
			this._datasets = [];

			this.map = null;
			this.selected = null;
			this.year = new Date().getFullYear();
		},

		onAdd: function (map) {
			this.map = map;
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_dataset: function(datasets) {
			this._datasets = datasets;
			var layers = this.getLayers();
			for (var i = 0; i < layers.length; i++) {
				this.colorize_poly(layers[i]);
			};
		},

		replace_geojson: function(geojson) {
			this._current_geojson = geojson;

			// Remove old polyline layers incrementally
			var old_layers = this.getLayers();
			var n = old_layers.length;
			var c = 0;
			for (var i = 0; i < n; i++) {
				var t = i/n * 2000;
				if(c < 200 && old_layers[i].getBounds().intersects(this.map.getBounds())) {
					t = c++;
				}
				setTimeout(function(i, l) {
					this.removeLayer(l);
				}.bind(this), 1000 + t, i, old_layers[i]);
			}

			// Add new polyline layers when they get on screen
			var new_layers = this._current_geojson.getLayers();
			for (var i = 0; i < new_layers.length; i++) {
				setTimeout(function loop(l, geojson) {
					if(this._current_geojson == geojson) {
						if(l.getBounds().intersects(this.map.getBounds())) {
							this.addLayer(l);
							if(this._datasets.length) {
								this.colorize_poly(l);
							}
						}else{
							setTimeout(loop.bind(this), 100, l, geojson);
						}
					}
				}.bind(this), i % 1000, new_layers[i], this._current_geojson);
			}
		},

		on_feature: function(feature, layer) {
			var that = this;

			layer.values = [];

			layer.on({
				click: function(e) {
					if(that.selected) {
						that.selected.setStyle(that.compute_poly_style(that.selected, false));
					}
					that.selected = layer;
					layer.setStyle(that.compute_poly_style(layer, true));
					layer.bringToFront();

					// TODO: Use React view in the popup
					var area_name = feature.properties.NAME_2 || feature.properties.NAME_1 || feature.properties.PROVINCE || feature.properties.REGION;
					var info = "";
					if(that._datasets.length) {
						var dataset_name = that._datasets[0].get("name");
						info = "<p> " + dataset_name + " (" + that.year + ") = " + (layer.value == null ? "no data" : layer.value.toFixed(2)) + "</p>";
					}
					that.map.openPopup("<div><h3>" + area_name + "</h3>" + info + "</div>", e.latlng);
				},
			});
		},

		// Sets polygon style based on the dataset
		colorize_poly: function(poly){
			loop.call(this, poly, this._datasets, this._current_geojson);
			function loop(poly, datasets, geojson) {
				if(this._current_geojson == geojson) {
					if(poly.getBounds().intersects(this.map.getBounds())) {
						var area_code = parseInt(poly.feature.properties.PSGC);
						poly.values = [];
						_.each(datasets, function(dataset) {
							var datapoints = dataset.get_datapoints();
							var value = datapoints.get_value(area_code, this.year);
							var normalized = null;
							if(value != null) {
								var min = datapoints.get_min_value();
								var max = datapoints.get_max_value();
								normalized = (value-min)/(max-min);
							}
							poly.values.push({value: value, normalized: normalized});
						});
						poly.setStyle(this.compute_poly_style(poly, false));
					}else{
						setTimeout(loop.bind(this), 100, poly, datapoints, geojson);
					}
				}
			}
		},

		compute_poly_style: function(poly, highlight) {
			var style = null;
			if(poly.values.length) {
				style = _.defaults({
					fillColor: this.get_color(poly.values),
				}, this._style_colored);
			}else{
				style = this._style_neutral;
			}

			if(highlight) {
				style = _.extend(_.clone(style), this._style_highlight);
			}

			return style;
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
	});
});