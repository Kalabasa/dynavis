"use strict";
define(["underscore", "jenks", "leaflet"], function(_, jenks, L) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			var that = this;

			this._style_neutral = {
				weight: 2,
				opacity: 0.4,
				color: "#7f7f7f",
				fillOpacity: 0.2,
				fillColor: "#c7c7c7",
				className: "map-polygon visible",
			};
			this._style_colored = _.defaults({
				weight: 3,
				opacity: 1,
				color: "#ffffff",
				fillOpacity: 0.8,
			}, this._style_neutral);
			this._style_highlight = {
				weight: 4,
				color: "#000000",
				opacity: 1,
			};

			this.geojson_options = {
				smoothFactor: 2.0,
				style: this._style_neutral,
			};

			this._year = new Date().getFullYear();
			this._geojson_number = 0;
			this._datasets = [];
			this._classes = [];

			this.map = null;
			this.selected = null;
		},

		onAdd: function (map) {
			this.map = map;
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_year: function(year) {
			this._year = year;
			if(this._datasets.length) {
				_.each(this.getLayers(), function(layer) {
					this.colorize_poly(layer);
				}, this);
			}
		},

		set_dataset: function(datasets) {
			this._datasets = datasets;
			_.each(this.getLayers(), function(layer) {
				this.colorize_poly(layer);
			}, this);
		},

		reset_geojson: function() {
			this._geojson_number++;

			// Remove old polyline layers incrementally
			var old_layers = this.getLayers();
			var n = old_layers.length;
			var c = 0;
			for (var i = 0; i < n; i++) {
				var t = i/n * 2000;
				if(c < 200 && old_layers[i].getBounds().intersects(this.map.getBounds())) {
					t = c++;
				}
				setTimeout(function(l) {
					this.removeLayer(l);
				}.bind(this), 1000 + t, old_layers[i]);
			}
		},

		add_geojson: function(geojson) {
			// Add new polyline layers when they get on screen
			var new_layers = geojson.getLayers();
			for (var i = 0; i < new_layers.length; i++) {
				setTimeout(function loop(l, gjn, add) {
					if(this._geojson_number == gjn) {
						if(l.getBounds().intersects(this.map.getBounds())) {
							if(add) {
								this.addLayer(l);
								if(this._datasets.length) {
									this.colorize_poly(l);
								}
								add = false;
							}
							setTimeout(loop.bind(this), 1000, l, gjn, add);
						}else{
							if(!add) {
								this.removeLayer(l);
								add = true;
							}
							setTimeout(loop.bind(this), 100, l, gjn, add);
						}
					}
				}.bind(this), i % 1000, new_layers[i], this._geojson_number, true);
			}
		},

		on_feature: function(feature, layer) {
			var that = this;

			layer.variables = [];

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
					_.each(layer.variables, function(variable) {
						info += "<p> " + _.escape(variable.dataset.get("name")) + " (" + that._year + ") = " + (variable.value == null ? "no data" : variable.value.toFixed(2)) + "</p>";
					});
					that.map.openPopup("<div><h3>" + _.escape(area_name) + "</h3>" + info + "</div>", e.latlng);
				},
			});
		},

		// Sets polygon style based on the dataset
		colorize_poly: function(poly){
			poly.variables = [];
			loop.call(this, poly, this._datasets, this._geojson_number);
			function loop(poly, datasets, gjn) {
				if(this._geojson_number == gjn) {
					if(poly.getBounds().intersects(this.map.getBounds())) {
						var area_code = parseInt(poly.feature.properties.PSGC);
						poly.variables = [];
						_.each(datasets, function(dataset) {
							if(!dataset) return;
							var datapoints = dataset.get_datapoints();
							var value = datapoints.get_value(area_code, this._year);
							// FIXME: GET LEVEL
							poly.variables.push({dataset: dataset, level: level, value: value});
						}, this);
						poly.setStyle(this.compute_poly_style(poly, false));
					}else{
						setTimeout(loop.bind(this), 100, poly, datasets, gjn);
					}
				}
			}
		},

		compute_poly_style: function(poly, highlight) {
			var style = null;
			if(poly.variables.length && _.every(poly.variables, function(v) { return v.value !== null; })) {
				style = _.defaults({
					fillColor: this.get_color(poly.variables),
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
			var scales = [
				[{r:254,g:235,b:226},{r:251,g:180,b:185},{r:247,g:104,b:161},{r:174,g:1,b:126}],
				[{r:255,g:255,b:204},{r:194,g:230,b:153},{r:120,g:198,b:121},{r:35,g:132,b:67}],
			];
			var color = {r:255,g:255,b:255};
			_.each(variables, function(variable, i) {
				var scale = scales[i];
				var value = variable.value;
				var classes = this.calculate_breaks(variable.dataset, variable.level, this._year, scale.length);
				var class_color = null;
				for (var i = 1; i < classes.length; i++) {
					var min = classes[i - 1];
					var max = classes[i];
					if(min <= value && value <= max) {
						class_color = scale[i - 1];
						break;
					}
				};
				color = _.mapObject(color, function(v,k) {
					return Math.min(v, class_color[k]);
				});
			}, this);
			return "rgb("+Math.floor(color.r)+","+Math.floor(color.g)+","+Math.floor(color.b)+")";
		},

		calculate_breaks: _.memoize(function(dataset, level, year, n) {
			year = year.toString();
			
			var area_codes = {};
			// FIXME: GET AREA CODES
			// var layers = geojson.getLayers();
			// for (var i = 0; i < layers.length; i++) {
			// 	area_codes[("0"+parseInt(layers[i].feature.properties.PSGC)).slice(-9)] = true;
			// }

			var data = dataset.get_datapoints().chain()
				.filter(function(p) {
					return p.get("year") == year
						&& p.get("value") !== null
						&& area_codes[("0"+p.get("area_code")).slice(-9)];
				})
				.map(function(p) { return parseFloat(p.get("value")); })
				.value();
			return jenks(data, n) || [dataset.get_datapoints().get_min_value(), dataset.get_datapoints().get_max_value()];
		}, function(dataset, level, year, n) {
			return dataset.get("id") + "|" + level + "|" + year + "|" + n;
		}),
	});
});