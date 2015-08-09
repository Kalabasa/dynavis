"use strict";
define(["underscore", "d3", "leaflet", "InstanceCache", "view/main/map/ChoroplethLayer"], function(_, d3, L, InstanceCache, ChoroplethLayer) {
	return L.LayerGroup.extend({
		initialize: function(bus) {
			L.LayerGroup.prototype.initialize.call(this);

			this.bus = bus;
			
			this._geojson_number = 0;
			this._geojson = [];
			this._dataset_number = 0;
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
			map.on("move", _.throttle(this.redraw.bind(this), 100));

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
			this._dataset_number++;
			this._dataset = data;
			this.calculate_minimum_size();
			this.reset_tags();
		},

		calculate_minimum_size: function() {
			this.minimum_size = 10 / this.map.getZoom();
			if(this._dataset) this.minimum_size = Math.max(this.minimum_size, this._dataset.classes[2]);
		},

		reset_geojson: function() {
			this._geojson_number++;
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
					setTimeout(this.tag_poly.bind(this), t += 10, layers[i], this._geojson_number);
				}
			}
		},

		reset_tags: function() {
			var t = 0;
			for (var i = this._geojson.length - 1; i >= 0; i--) {
				var layers = this._geojson[i].getLayers();
				for (var j = 0; j < layers.length; j++) {
					setTimeout(this.tag_poly.bind(this), t += 10, layers[j], this._geojson_number);
				}
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

		tag_poly: function(poly, gn) {
			loop.call(this, poly, gn, 0, true);
			function loop(poly, gn, dn, add) {
				var intersects = poly.getBounds().pad(10).intersects(this.map.getBounds());
				if(intersects && this._geojson_number == gn) {
					if(this._dataset_number != dn) {
						dn = this._dataset_number;

						poly.tags = [];
						if(this._dataset) {
							var area_code = parseInt(poly.feature.properties.PSGC, 10);
							var datapoints = this.filter_datapoints(this._dataset.datapoints, area_code, this.minimum_size);
							for (var i = 0; i < datapoints.length; i++) {
								var p = datapoints[i];
								var family = InstanceCache.get("Family", p.get("family_id"));
								poly.tags.push({
									data: p,
									area_code: area_code,
									family: family,
									poly: poly,
								});
							}
						}
					}
					if(add) {
						add = false;
						poly.tags_visible = true;
						this._redraw_callback();
					}
				}else{
					if(!add) {
						add = true;
						poly.tags_visible = false;
						this._redraw_callback();
					}
				}
				if(this._geojson_number == gn || !add) setTimeout(loop.bind(this), 1000, poly, gn, dn, add);
			}
		},

		filter_datapoints: function(datapoints, area_code, minimum_size) {
			area_code = ("0" + area_code);
			var match_start = area_code.substr(2-9,2) === "00" ? 0 : 2;
			var area_code_match = area_code.substr(match_start-9);
			return datapoints.filter(function(p) {
				return p.get("value") >= minimum_size && ("0"+p.get("area_code")).substr(match_start-9) === area_code_match;
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
					if(layers[j].tags_visible) Array.prototype.push.apply(tags, layers[j].tags);
				}
			}

			var filtered_tags = _.chain(tags)
				.filter(function(tag) {
					if(tag.data.get("value") < this.minimum_size) return false;
					return true;
				}, this)
				.map(function(tag) {
					if(!tag.family.has("name")) this.family_fetch_enqueue(tag.family);

					var bounds = tag.poly.getBounds();
					// var top_left = bounds.getNorthWest();
					// var bottom_right = bounds.getSouthEast();
					var top = bounds.getNorth();
					var bottom = bounds.getSouth();
					var center = bounds.getCenter();

					var lat = top*0.75 + bottom*0.25 + (bottom - top)*0.5 * ((tag.poly.tags.indexOf(tag) + 0.5) / tag.poly.tags.length);
					var lng = center.lng;
					var point = this.map.latLngToLayerPoint([lat, lng]);

					return {
						key: tag.area_code + "|" + tag.family.id,
						x: point.x,
						y: point.y,
						size: tag.data.get("value"),
						family: tag.family,
					};
				}, this)
				.sortBy(function(tag) { return tag.size; })
				.value();

			var text_func = function(tag) {
				if(tag.family.has("name")) return tag.family.get("name");
				return "..."; // TODO: spinner
			};
			var transform_func = function(tag) { return "translate(" + tag.x + "," + tag.y + ")"; };
			var font_size_func = function(tag) { return Math.sqrt(0.8 * tag.size) + "em"; };
			var opacity_func= function(tag) { return tag.family.has("name") ? 1 : 0.5; };

			var tags_data = g.selectAll("g").data(filtered_tags, function(tag){ return tag.key; });

			tags_data.transition().duration(300) // update old tags
				.attr("transform", transform_func)
				.style("opacity", opacity_func);

			var entered_tags = tags_data.enter().append("g"); // add new tags
			entered_tags.append("text").attr("class", "map-tag-stroke");
			entered_tags.append("text").attr("class", "map-tag");
			entered_tags
				.attr("transform", transform_func)
				.style("opacity", 0)
				.transition().duration(300)
					.style("opacity", 0.5);

			tags_data.selectAll("text") // update all tags
				.text(text_func)
				.style("font-size", font_size_func);

			tags_data.exit() // remove old tags
				.transition().duration(300)
				.style("opacity", 0)
				.remove();
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