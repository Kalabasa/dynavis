"use strict";
define(["underscore", "leaflet", "model/Area", "jsx!view/main/ChoroplethLegend"], function(_, L, Area, ChoroplethLegend) {
	return L.LayerGroup.extend({
		initialize: function(bus) {
			L.LayerGroup.prototype.initialize.call(this);
			var that = this;

			this.bus = bus;

			this._style_neutral = {
				weight: 3,
				opacity: 0.1,
				color: "#7f7f7f",
				fillOpacity: 0,
				fillColor: "#c7c7c7",
				className: "map-polygon visible",
			};
			this._style_colored = _.defaults({
				weight: 4,
				opacity: 1,
				color: "#ffffff",
				fillOpacity: 1,
				fillColor: "#dfdfdf",
			}, this._style_neutral);
			this._style_highlight = {
				weight: 6,
				opacity: 1,
			};

			this.geojson_options = {
				smoothFactor: 2.4,
				style: this._style_neutral,
			};

			this._geojson_number = 0;
			this._geojson = [];
			this._dataset_number = 0;
			this._datasets = [];

			this.map = null;
			this.selected_layer = null;

			this.on_data = this.on_data.bind(this);
			this.on_main_settings = this.on_main_settings.bind(this);
			this.on_select = this.on_select.bind(this);

			this.bus.choropleth_data.on("update", this.on_data);
			this.bus.main_settings.on("update", this.on_main_settings);
			this.bus.main_settings.on("select", this.on_select);
		},

		destruct: function() {
			this.bus.choropleth_data.off("update", this.on_data);
			this.bus.main_settings.off("update", this.on_main_settings);
			this.bus.main_settings.off("select", this.on_select);
		},

		onAdd: function (map) {
			this.map = map;
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		on_main_settings: function(settings) {
			if(settings.level) this.reset_geojson();
		},

		on_data: function(data) {
			this._datasets = data;
			this.reset_polygons();
		},

		on_select: function(selected) {
			if(this.selected_layer) {
				this.selected_layer.setStyle(this.compute_polygon_style(this.selected_layer, false));
			}
			if(selected) {
				var layer = selected.layer;
				this.selected_layer = layer;
				layer.setStyle(this.compute_polygon_style(layer, true));
				layer.bringToFront();
			}
		},

		reset_geojson: function() {
			this._geojson_number++;
			this._geojson = [];
		},

		add_geojson: function(geojson) {
			this._geojson.push(geojson);

			var t = 0;
			var layers = geojson.getLayers();
			for (var i = 0; i < layers.length; i++) {
				layers[i].variables = [];
				setTimeout(this.colorize_polygon.bind(this), t += 10, layers[i], this._geojson_number);
			}
		},

		reset_polygons: function() {
			this._dataset_number++;
			var t = 0;
			for (var i = this._geojson.length - 1; i >= 0; i--) {
				var layers = this._geojson[i].getLayers();
				for (var j = 0; j < layers.length; j++) {
					setTimeout(this.colorize_polygon.bind(this), t += 10, layers[j], this._geojson_number);
				}
			}
		},

		// Sets polygon style based on the dataset
		colorize_polygon: function(poly, gn){
			poly.variables = [];
			loop.call(this, poly, gn, 0, true);
			function loop(poly, gn, dn, add) {
				var intersects = poly.getBounds().pad(10).intersects(this.map.getBounds());
				if(intersects && this._geojson_number == gn) {
					if(this._dataset_number != dn) {
						dn = this._dataset_number;
						var area_code = parseInt(poly.feature.properties.PSGC);
						var level = Area.get_level(area_code);
						poly.variables = [];
						_.each(this._datasets, function(dataset) {
							if(dataset) {
								var value = null;
								var filtered = this.filter_datapoints(dataset.datapoints, area_code);
								if(filtered.length) {
									value = filtered[0].get("value");
								}
								poly.variables.push({dataset: dataset, level: level, value: value});
							}else{
								poly.variables.push(null);
							}
						}, this);
						poly.setStyle(this.compute_polygon_style(poly, false));
					}
					if(add) {
						add = false;
						this.addLayer(poly);
					}
				}else{
					if(!add) {
						add = true;
						this.removeLayer(poly);
					}
				}
				if(this._geojson_number == gn) setTimeout(loop.bind(this), 1000, poly, gn, dn, add);
			}
		},

		filter_datapoints: function(datapoints, area_code) {
			area_code = ("0" + area_code);
			var match_start = area_code.substr(2-9,2) === "00" ? 0 : 2;
			var area_code_match = area_code.substr(match_start-9);
			return datapoints.filter(function(p) {
				return ("0"+p.get("area_code")).substr(match_start-9) == area_code_match;
			});
		},

		compute_polygon_style: function(poly, highlight) {
			var style = null;

			var colored = _.some(this._datasets) && _.every(this._datasets, function(d) {
				if(!d) return true;
				return _.some(poly.variables, function(v) {
					return v && d == v.dataset && v.value !== null;
				});
			});

			if(colored) {
				var color = this.get_color(poly.variables);
				var darker = _.mapObject(color, function(v) {
					return Math.max(0, v - 64);
				});
				style = _.defaults({
					color: "rgb("+Math.floor(darker.r)+","+Math.floor(darker.g)+","+Math.floor(darker.b)+")",
					fillColor: "rgb("+Math.floor(color.r)+","+Math.floor(color.g)+","+Math.floor(color.b)+")",
				}, this._style_colored);
			}else{
				style = this._style_neutral;
			}

			if(highlight) {
				style = _.extend(_.clone(style), this._style_highlight);
			}

			return style;
		},

		get_color: function(variables) {
			var black = {r:20, g:20, b:20};
			var color = null;
			_.each(variables, function(variable, i) {
				if(!variable) return;
				var value = variable.value;
				if(!value) return;
				var scale = variable.dataset.color_scale;
				var classes = variable.dataset.classes;
				if(scale.length + 1 !== classes.length) return;

				var class_color = black;
				for (var i = 1; i < classes.length; i++) {
					var min = classes[i - 1];
					var max = classes[i];
					if(min <= value && value <= max) {
						class_color = scale[i - 1];
						break;
					}
				};
				color = color ? ChoroplethLegend.combine_colors(color, class_color) : class_color;
			}, this);
			return color;
		},
	});
});