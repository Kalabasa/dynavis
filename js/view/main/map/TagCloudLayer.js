"use strict";
define(["underscore", "d3", "leaflet", "InstanceCache"], function(_, d3, L, InstanceCache) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			
			this._year = new Date().getFullYear();
			this._current_geojson = null;
			this._dataset = null;
			this._tags = [];

			this._redraw_callback = _.debounce(this.redraw.bind(this), 1000);

			this.map = null;
			this.minimum_size = 2;
		},

		onAdd: function (map) {
			this.map = map;
			map.on("viewreset moveend", this.redraw.bind(this));
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_year: function(year) {
			this._year = year;
			this.update_minimum_size();
			this.construct_tags();
		},

		set_dataset: function(dataset) {
			this._dataset = dataset;
			this.update_minimum_size();
			this.construct_tags();
		},

		replace_geojson: function(geojson) {
			this._current_geojson = geojson;
			this.update_minimum_size();
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
						poly.datapoints = datapoints.find_datapoints(area_code, this._year);
						for (var i = 0; i < poly.datapoints.length; i++) {
							var p = poly.datapoints[i];
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
				.attr("transform", function(tag) { return "translate(" + tag.x + "," + tag.y + ")"; })
				.text(function(tag) { return tag.family.get("name"); })
				.style("font-size", function(tag) { return (0.4 * tag.size) + "em"; })
				.style("font-weight", "bold")
				.style("stroke", "white")
				.style("stroke-width", "1px");
		},

		update_minimum_size: function() {
			if(this._dataset && this._current_geojson) {
				this.minimum_size = this.calculate_minimum_size(this._dataset, this._current_geojson, this._year);
			}
		},

		calculate_minimum_size: _.memoize(function(dataset, geojson, year) {
			year = year.toString();
			
			var area_codes = {};
			var layers = geojson.getLayers();
			for (var i = 0; i < layers.length; i++) {
				area_codes[("0"+parseInt(layers[i].feature.properties.PSGC)).slice(-9)] = true;
			}

			var data = dataset.get_datapoints().chain()
				.filter(function(p) {
					return p.get("year") == year
						&& p.get("value") !== null
						&& area_codes[("0"+p.get("area_code")).slice(-9)];
				})
				.map(function(p) { return parseFloat(p.get("value")); })
				.sortBy()
				.value();
			return data[Math.floor(data.length * 0.95)];
		}, function(dataset, geojson, year) {
			return dataset.get("id") + "|" + geojson.url + "|" + year;
		}),
	});
});