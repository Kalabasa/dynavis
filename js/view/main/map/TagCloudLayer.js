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

			this._redraw_callback = _.debounce(this.redraw.bind(this), 2000);

			this.map = null;
			this.minimum_size = 4;
		},

		onAdd: function (map) {
			this.map = map;
			map.on("viewreset moveend", this.redraw.bind(this));

    		d3.select("#tag-cloud-overlay").remove();

			d3.select(this.map.getPanes().overlayPane)
				.append("svg")
					.attr("id", "tag-cloud-overlay")
					.style("pointer-events", "none")
					.attr("class", "leaflet-zoom-hide")
				.append("g")
					.attr("id", "tag-cloud-container");

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
				var layers = geojson.getLayers();
				for (var i = 0; i < layers.length; i++) {
					this.tag_poly(layers[i]);
				}
			}
		},

		reset_tags: function() {
			this._reset_number++;
			this._tags = [];

			if(this._dataset) {
				for (var i = this._geojson.length - 1; i >= 0; i--) {
					var layers = this._geojson[i].getLayers();
					for (var j = 0; j < layers.length; j++) {
						this.tag_poly(layers[j]);
					}
				}
			}
		},

		tag_poly: function(poly) {
			loop.call(this, poly, this._reset_number, true);
			function loop(poly, rn, add) {
				var intsersects = poly.getBounds().intersects(this.map.getBounds().pad(0.1));
				var datapoints = this._dataset.get_datapoints();
				if(intsersects && this._reset_number == rn) {
					if(add) {
						add = false;

						var bounds = poly.getBounds();
						var top_left = bounds.getNorthWest();
						var bottom_right = bounds.getSouthEast();

						var area_code = parseInt(poly.feature.properties.PSGC);
						var datapoints = datapoints.find_datapoints(area_code, this._year);
						for (var i = 0; i < datapoints.length; i++) {
							var p = datapoints[i];
							var family = InstanceCache.get("Family", p.get("family_id"));
							family.fetch({
								success: this._redraw_callback,
								error: this._redraw_callback,
							});
							var lat = top_left.lat + (bottom_right.lat - top_left.lat) * Math.random();
							var lng = top_left.lng + (bottom_right.lng - top_left.lng) * Math.random();
							this._tags.push({
								"data": p,
								"family": family,
								"coords": [lat, lng],
								"area": poly,
							});
						}
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
			var that = this;

			var bounds = this.map.getBounds();
			var tags = _.chain(this._tags)
				.filter(function(tag) {
					if(!bounds.contains(tag.coords)) return false;
					var size = parseFloat(tag.data.get("value"));
					if(size < this.minimum_size) return false;
					tag.size = size;
					var point = that.map.latLngToLayerPoint(tag.coords);
					tag.x = point.x;
					tag.y = point.y;
					return true;
				}, this)
				.sortBy(function(tag) { return tag.size; })
				.value();
			
			var top_left = this.map.latLngToLayerPoint(bounds.getNorthWest());
			var svg = d3.select("#tag-cloud-overlay");
			svg.style("width", this.map.getSize().x + "px")
				.style("height", this.map.getSize().y + "px")
				.style("margin-left", top_left.x + "px")
				.style("margin-top", top_left.y + "px")
			var g = d3.select("#tag-cloud-container");
			g.attr("transform", "translate(" + (-top_left.x) + "," + (-top_left.y) + ")")
			var svg_tags = g.selectAll("g").data(tags);
			svg_tags.exit().remove();
			svg_tags.enter().append("g")
				.append("text")
				.attr("transform", function(tag) { return "translate(" + tag.x + "," + tag.y + ")"; })
				.text(function(tag) { return tag.family.get("name"); })
				.style("font-family", "Roboto")
				.style("font-size", function(tag) { return Math.sqrt(0.9 * tag.size) + "em"; })
				.style("font-weight", 900)
				.style("stroke", "white")
				.style("stroke-width", "1px");
		},
	});
});