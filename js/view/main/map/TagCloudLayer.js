"use strict";
define(["underscore", "d3", "leaflet", "InstanceCache"], function(_, d3, L, InstanceCache) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			
			this._current_geojson = null;
			this._dataset = null;
			this._tags = [];

			this.map = null;
			this.year = new Date().getFullYear();
		},

		onAdd: function (map) {
			this.map = map;
			map.on("viewreset moveend", this.redraw.bind(this));
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_dataset: function(dataset) {
			this._dataset = dataset;
			this.construct_tags();
		},

		replace_geojson: function(geojson) {
			this._current_geojson = geojson;
			this.construct_tags();
		},

		on_feature: function(feature, layer) {
			var that = this;

			var area_code = parseInt(feature.properties.PSGC, 10);
			layer.families = null;
		},

		construct_tags: function() {
			// Remove old tags
			this._tags = [];

			// Add new tags
			if(this._dataset) {
				var geojson_layers = this._current_geojson.getLayers();
				for (var i = 0; i < geojson_layers.length; i++) {
					this.tag_poly(geojson_layers[i]);
				}
			}
		},

		tag_poly: function(poly) {
			poly.datapoints = [];
			loop.call(this, poly, this._dataset.get_datapoints(), this._current_geojson);
			function loop(poly, datapoints, geojson) {
				if(this._current_geojson == geojson) {
					if(poly.getBounds().intersects(this.map.getBounds())) {
						var bounds = poly.getBounds();
						var top_left = bounds.getNorthWest();
						var bottom_right = bounds.getSouthEast();

						var area_code = parseInt(poly.feature.properties.PSGC);
						poly.datapoints = datapoints.find_datapoints(area_code, this.year);
						var callback = _.after(poly.datapoints.length, this.redraw.bind(this));
						for (var i = 0; i < poly.datapoints.length; i++) {
							var p = poly.datapoints[i];
							var family = InstanceCache.get("Family", p.get("family_id"));
							family.fetch({
								success: callback,
								error: callback,
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
					}else{
						setTimeout(loop.bind(this), 100, poly, datapoints, geojson);
					}
				}
			}
		},

		redraw: function() {
			var that = this;

    		d3.select("#tag-cloud-overlay").remove();

			var bounds = this.map.getBounds();
			var tags = _.filter(this._tags, function(tag) {
				if(!bounds.contains(tag.coords)) return false;
				if(parseFloat(tag.data.get("value")) <= 1) return false;
				var point = that.map.latLngToLayerPoint(tag.coords);
				tag.x = point.x;
				tag.y = point.y;
				return true;
			});
			
			var top_left = this.map.latLngToLayerPoint(bounds.getNorthWest());
			var svg = d3.select(this.map.getPanes().overlayPane).append("svg")
				.attr("id", "tag-cloud-overlay")
				.style("pointer-events", "none")
				.attr("class", "leaflet-zoom-hide")
				.style("width", this.map.getSize().x + "px")
				.style("height", this.map.getSize().y + "px")
				.style("margin-left", top_left.x + "px")
				.style("margin-top", top_left.y + "px");
			var g = svg.append("g")
				.attr("transform", "translate(" + (-top_left.x) + "," + (-top_left.y) + ")");
			var svg_tags = g.selectAll("g")
				.data(tags)
					.enter().append("g");
			svg_tags.append("text")
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
				.text(function(d) { return d.family.get("name"); })
				.style("font-size", function(d) { return (0.4 * parseFloat(d.data.get("value"))) + "em"; });
		},
	});
});