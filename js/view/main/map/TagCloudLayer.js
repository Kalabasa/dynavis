"use strict";
define(["underscore", "d3", "leaflet", "InstanceCache"], function(_, d3, L, InstanceCache) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			
			this._year = new Date().getFullYear();
			this._reset_number = 0;
			this._geojson = [];
			this._dataset = null;
			this._tags = [];

			this._redraw_callback = _.debounce(this.redraw.bind(this), 200);

			this.map = null;
			this.minimum_size = 4;
		},

		onAdd: function (map) {
			this.map = map;
			map.on("viewreset move", _.throttle(this.redraw.bind(this), 100));

    		d3.select("#tag-cloud-overlay").remove();
			d3.select(this.map.getPanes().shadowPane)
				.append("svg")
					.attr("id", "tag-cloud-overlay")
					.style("pointer-events", "none")
					.style("position", "absolute")
				.append("g")
					.attr("id", "tag-cloud-container")
					.attr("class", "leaflet-zoom-hide");

			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_year: function(year) {
			this._year = year;
			this.reset_tags();
		},

		set_dataset: function(dataset) {
			this._dataset = dataset;
			this.reset_tags();
		},

		on_feature: function(feature, layer) {
		},

		reset_geojson: function() {
			this._reset_number++;
			this._geojson = [];
			this._tags = [];
		},

		add_geojson: function(geojson) {
			this._geojson.push(geojson);

			// Add new tags
			if(this._dataset) {
				var t = 0;
				var layers = geojson.getLayers();
				for (var i = 0; i < layers.length; i++) {
					setTimeout(this.tag_poly.bind(this), t += 10, layers[i]);
				}
			}
		},

		reset_tags: function() {
			this._reset_number++;
			this._tags = [];

			if(this._dataset) {
				var t = 0;
				for (var i = this._geojson.length - 1; i >= 0; i--) {
					var layers = this._geojson[i].getLayers();
					for (var j = 0; j < layers.length; j++) {
						setTimeout(this.tag_poly.bind(this), t += 10, layers[j]);
					}
				}
			}
		},

		tag_poly: function(poly) {
			poly.tags = [];
			loop.call(this, poly, this._reset_number, true);
			function loop(poly, rn, add) {
				var bounds = poly.getBounds();
				var intsersects = bounds.intersects(this.map.getBounds().pad(1));
				var datapoints = this._dataset.get_datapoints();
				if(intsersects && this._reset_number == rn) {
					if(add) {
						add = false;

						if(!poly.tags.length) { 
							var top_left = bounds.getNorthWest();
							var bottom_right = bounds.getSouthEast();

							var area_code = parseInt(poly.feature.properties.PSGC);
							var datapoints = datapoints.find_datapoints(area_code, this._year);
							for (var i = 0; i < datapoints.length; i++) {
								var p = datapoints[i];
								var family = InstanceCache.get("Family", p.get("family_id"));
								var lat = top_left.lat + (bottom_right.lat - top_left.lat) * Math.random();
								var lng = top_left.lng + (bottom_right.lng - top_left.lng) * Math.random();
								poly.tags.push({
									"area": poly,
									"data": p,
									"family": family,
									"coords": bounds.getCenter() || L.latLng(lat, lng),
								});
							}
						}

						_.each(poly.tags, function(tag) {
							this._tags.push(tag);
						}.bind(this));
						this._redraw_callback();
					}
				}else{
					if(!add) {
						add = true;

						this._tags = _.reject(this._tags, function(tag) {
							return tag.area == poly;
						});
						this._redraw_callback();
					}
				}
				if(this._reset_number == rn) setTimeout(loop.bind(this), 1000, poly, datapoints, rn, add);
			}
		},

		redraw: function() {
			var bounds = this.map.getBounds();
			var size = this.map.getSize();
			var top_left = this.map.latLngToLayerPoint(bounds.getNorthWest());
			var svg = d3.select("#tag-cloud-overlay");
			svg.style("width", size.x + "px")
				.style("height", size.y + "px")
				.style("left", top_left.x + "px")
				.style("top", top_left.y + "px");
			var g = d3.select("#tag-cloud-container");
			g.attr("transform", "translate(" + (-top_left.x) + "," + (-top_left.y) + ")");

			var filtered_tags = _.chain(this._tags)
				.filter(function(tag) {
					var size = parseFloat(tag.data.get("value"));
					if(size < this.minimum_size) return false;
					tag.size = size;
					var point = this.map.latLngToLayerPoint(tag.coords);
					tag.x = point.x;
					tag.y = point.y;
					return true;
				}, this)
				.each(function(tag, i) {
					_.delay(function(tag, i) {
						if(!tag.family.has("name")) {
							tag.family.fetch({success: function() {
								this._redraw_callback();
							}.bind(this)});
						}
					}.bind(this), Math.floor(i / 15) * 2000, tag, i);
				}, this)
				.sortBy(function(tag) { return tag.size; })
				.value();

			var text_func = function(tag) {
				if(tag.family.has("name")) return tag.family.get("name");
				return "-"; // TODO: spinner
			};
			var transform_func = function(tag) { return "translate(" + tag.x + "," + tag.y + ")"; };
			var font_size_func = function(tag) { return Math.sqrt(0.8 * tag.size) + "em"; };

			var tags_data = g.selectAll("g").data(filtered_tags);
			tags_data.exit().remove(); // remove exiting tag
			tags_data.selectAll("text") // update tag
				.text(text_func)
				.attr("transform", transform_func)
				.style("font-size", font_size_func);
			var entered_tags = tags_data.enter().append("g"); // add entering tag
			entered_tags.append("text")
					.text(text_func)
					.attr("transform", transform_func)
					.attr("class", "map-tag-stroke")
					.style("font-size", font_size_func);
			entered_tags.append("text")
					.text(text_func)
					.attr("transform", transform_func)
					.attr("class", "map-tag")
					.style("font-size", font_size_func)
		},
	});
});