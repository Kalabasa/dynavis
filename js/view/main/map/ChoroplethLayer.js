"use strict";
define(["underscore", "jenks", "leaflet", "model/Area"], function(_, jenks, L, Area) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			var that = this;

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

			this._year = new Date().getFullYear();
			this._geojson_number = 0;
			this._geojson = [];
			this._dataset_number = 0;
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
			this.reset_polygons();
		},

		set_dataset: function(datasets) {
			this._datasets = datasets;
			this.reset_polygons();
		},

		on_feature: function(feature, layer) {
			var that = this;
			layer.variables = [];
			layer.on({
				click: function(e) {
					if(that.selected) {
						that.selected.setStyle(that.compute_polygon_style(that.selected, false));
					}
					that.selected = layer;
					layer.setStyle(that.compute_polygon_style(layer, true));
					layer.bringToFront();

					// TODO: Use React view in the popup
					var area_name = feature.properties.NAME || feature.properties.NAME_3 || feature.properties.NAME_2 || feature.properties.NAME_1 || feature.properties.NAME_0 || feature.properties.PROVINCE || feature.properties.REGION || feature.properties.PSGC;
					var info = "";
					_.each(layer.variables, function(variable) {
						info += "<p> " + _.escape(variable.dataset.get("name")) + " (" + that._year + ") = " + (variable.value == null ? "no data" : variable.value.toFixed(2)) + "</p>";
					});
					that.map.openPopup("<div><h3>" + _.escape(area_name) + "</h3>" + info + "</div>", e.latlng);
				},
			});
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
				setTimeout(this.colorize_polygon.bind(this), t += 10, layers[i]);
			}
		},

		reset_polygons: function() {
			this._dataset_number++;
			var t = 0;
			for (var i = this._geojson.length - 1; i >= 0; i--) {
				var layers = this._geojson[i].getLayers();
				for (var j = 0; j < layers.length; j++) {
					setTimeout(this.colorize_polygon.bind(this), t += 10, layers[j]);
				}
			}
		},

		// Sets polygon style based on the dataset
		colorize_polygon: function(poly){
			poly.variables = [];
			loop.call(this, poly, this._geojson_number, 0, true);
			function loop(poly, gn, dn, add) {
				var intersects = poly.getBounds().intersects(this.map.getBounds().pad(0.1));
				if(intersects && this._geojson_number == gn) {
					if(this._dataset_number != dn) {
						dn = this._dataset_number;
						if(this._datasets.length) {
							var area_code = parseInt(poly.feature.properties.PSGC);
							var level = Area.get_level(area_code);
							poly.variables = [];
							_.each(this._datasets, function(dataset) {
								if(dataset) {
									var datapoints = dataset.get_datapoints();
									var value = datapoints.get_value(area_code, this._year);
									poly.variables.push({dataset: dataset, level: level, value: value});
								}else{
									poly.variables.push(null);
								}
							}, this);
						}
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

		compute_polygon_style: function(poly, highlight) {
			var style = null;

			var colored = _.some(poly.variables, function(v) {
				return v && v.value !== null;
			})
			&& _.every(this.datasets, function(d) {
				return _.some(poly.variables, function(v) {
					return d == v.dataset;
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
			var scales = [
				[{r:254,g:235,b:226},{r:251,g:180,b:185},{r:247,g:104,b:161},{r:174,g:1,b:126}],
				[{r:255,g:255,b:204},{r:194,g:230,b:153},{r:120,g:198,b:121},{r:35,g:132,b:67}],
			];
			var color = {r:255,g:255,b:255};
			_.each(variables, function(variable, i) {
				if(!variable) return;
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
			return color;
		},

		calculate_breaks: _.memoize(function(dataset, level, year, n) {
			year = year.toString();

			var data = dataset.get_datapoints().chain()
				.filter(function(p) {
					return p.get("year") == year
						&& p.get("value") !== null
						&& Area.get_level(p.get("area_code")) == level;
				})
				.map(function(p) { return parseFloat(p.get("value")); })
				.value();
			return jenks(data, n) || [dataset.get_datapoints().get_min_value(), dataset.get_datapoints().get_max_value()];
		}, function(dataset, level, year, n) {
			return dataset.get("id") + "|" + level + "|" + year + "|" + n;
		}),
	});
});