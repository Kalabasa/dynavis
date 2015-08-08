"use strict";
define(["underscore", "d3", "leaflet", "InstanceCache", "view/main/map/ChoroplethLayer"], function(_, d3, L, InstanceCache, ChoroplethLayer) {
	return L.LayerGroup.extend({
		initialize: function(bus) {
			L.LayerGroup.prototype.initialize.call(this);

			this.bus = bus;
			
			this._reset_number = 0;
			this._geojson = [];
			this._dataset = null;

			this._redraw_callback = _.debounce(this.redraw.bind(this), 200);

			this.map = null;
			this.minimum_size = 4;

			this.on_data = this.on_data.bind(this);
			this.on_main_settings = this.on_main_settings.bind(this);

			this.bus.tagcloud_data.on("update", this.on_data);
			this.bus.main_settings.on("update", this.on_main_settings);
		},

		destruct: function() {
			this.bus.tagcloud_data.off("update", this.on_data);
			this.bus.main_settings.off("update", this.on_main_settings);
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

		on_main_settings: function(settings) {
			if(settings.level) this.reset_geojson();
			if(settings.zoom) this.calculate_minimum_size();
			this._redraw_callback();
		},

		on_data: function(data) {
			this._dataset = data;
			this.calculate_minimum_size();
			this.reset_tags();
		},

		calculate_minimum_size: function() {
			this.minimum_size = 10 / this.map.getZoom();
			if(this._dataset) this.minimum_size = Math.max(this.minimum_size, this._dataset.classes[2]);
		},

		reset_geojson: function() {
			this._reset_number++;
			this._geojson = [];
			this.remove_tags();
		},

		add_geojson: function(geojson) {
			this._geojson.push(geojson);

			var t = 0;
			var layers = geojson.getLayers();
			for (var i = 0; i < layers.length; i++) {
				layers[i].tags = [];
				if(this._dataset) {
					setTimeout(this.tag_poly.bind(this), t += 10, layers[i]);
				}
			}
		},

		reset_tags: function() {
			this._reset_number++;
			this.remove_tags();

			if(this._dataset) {
				var t = 0;
				for (var i = this._geojson.length - 1; i >= 0; i--) {
					var layers = this._geojson[i].getLayers();
					for (var j = 0; j < layers.length; j++) {
						setTimeout(this.tag_poly.bind(this), t += 1, layers[j]);
					}
				}
			}else{
				this._redraw_callback();
			}
		},

		remove_tags: function() {
			for (var i = this._geojson.length - 1; i >= 0; i--) {
				var layers = this._geojson[i].getLayers();
				for (var j = 0; j < layers.length; j++) {
					layers[j].tags = [];
				}
			}
		},

		tag_poly: function(poly) {
			loop.call(this, poly, this._reset_number, true);
			function loop(poly, rn, add) {
				var bounds = poly.getBounds();
				var intersects = bounds.pad(10).intersects(this.map.getBounds());
				var datapoints = this._dataset.datapoints;
				if(intersects && this._reset_number == rn) {
					if(add) {
						add = false;

						if(!poly.tags.length) { 
							var top_left = bounds.getNorthWest();
							var bottom_right = bounds.getSouthEast();
							var top = bounds.getNorth();
							var bottom = bounds.getSouth();
							var center = bounds.getCenter();

							var area_code = parseInt(poly.feature.properties.PSGC);
							var datapoints = this.filter_datapoints(datapoints, area_code, this.minimum_size);
							for (var i = 0; i < datapoints.length; i++) {
								var p = datapoints[i];
								var family = InstanceCache.get("Family", p.get("family_id"));
								var lat = top*0.75 + bottom*0.25 + (bottom - top)*0.5 * ((i + 0.5) / datapoints.length);
								var lng = center.lng;
								poly.tags.push({
									poly: poly,
									data: p,
									family: family,
									coords: L.latLng(lat, lng),
								});
							}
							this._redraw_callback();
						}
					}
				}else{
					if(!add) {
						add = true;

						poly.tags = [];
						this._redraw_callback();
					}
				}
				if(this._reset_number == rn) setTimeout(loop.bind(this), 1000, poly, rn, add);
			}
		},

		filter_datapoints: function(datapoints, area_code, minimum_size) {
			area_code = ("0" + area_code);
			var match_start = area_code.substr(2-9,2) === "00" ? 0 : 2;
			var area_code_match = area_code.substr(match_start-9);
			return datapoints.filter(function(p) {
				return p.get("value") >= minimum_size && ("0"+p.get("area_code")).substr(match_start-9) == area_code_match;
			});
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

			var tags = [];
			for (var i = this._geojson.length - 1; i >= 0; i--) {
				var layers = this._geojson[i].getLayers();
				for (var j = 0; j < layers.length; j++) {
					Array.prototype.push.apply(tags, layers[j].tags);
				}
			}

			var filtered_tags = _.chain(tags)
				.filter(function(tag) {
					if(tag.data.get("value") < this.minimum_size) return false;
					return true;
				}, this)
				.map(function(tag) {
					var point = this.map.latLngToLayerPoint(tag.coords);
					if(!tag.family.has("name")) this.family_fetch_enqueue(tag.family);
					return {key: tag.data.cid, x: point.x, y: point.y, size: tag.data.get("value"), family: tag.family};
				}, this)
				.sortBy(function(tag) { return tag.size; })
				.value();

			var text_func = function(tag) {
				if(tag.family.has("name")) return tag.family.get("name");
				return "..."; // TODO: spinner
			};
			var transform_func = function(tag) { return "translate(" + tag.x + "," + tag.y + ")"; };
			var font_size_func = function(tag) { return Math.sqrt(0.8 * tag.size) + "em"; };

			var tags_data = g.selectAll("g").data(filtered_tags, function(tag){ return tag.key; });
			tags_data.selectAll("text") // update tag
				.text(text_func)
				.attr("transform", transform_func)
				.style("font-size", font_size_func);
			tags_data.exit().remove(); // remove exiting tag
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

		family_fetch_enqueue: function(family) {
			this.fetch_queue = this.fetch_queue || [];

			if(family.has("name")) return;
			this.fetch_queue.push({model: family, options: {success: function() {
				this._redraw_callback();
			}.bind(this)}});

			if(this.fetch_queue.length == 1) {
				dequeue(this.fetch_queue);
			}

			function dequeue(queue) {
				if(!queue.length) return;
				var next = queue.shift();
				next.model.fetch({
					success: function(m,r,o) {
						if(next.options.success) next.options.success(m,r,o);
						dequeue(queue);
					},
					error: function(m,r,o) {
						if(next.options.error) next.options.error(m,r,o);
						dequeue(queue);
					}
				});
			}
		},
	});
});