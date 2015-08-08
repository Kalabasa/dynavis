"use strict";
define(["react", "underscore", "leaflet", "config.map", "view/main/map/ChoroplethLayer", "view/main/map/TagCloudLayer"], function(React, _, L, config, ChoroplethLayer, TagCloudLayer) {
	return React.createClass({
		getInitialState: function() {
			return {
				year: 2013,
			}
		},

		componentWillMount: function() {
			this._interval = setInterval(function() {
				this.geojson_cache = {}; // clear cache once in a while
			}.bind(this), 6 * 60 * 1000); // 6 minutes
		},

		componentWillUnmount: function() {
			clearInterval(this._interval);
			
			this.choropleth.destruct();
			this.tagcloud.destruct();

			this.map.off("viewreset moveend zoomend", this.update_view);
			this.map = null;

			this.props.bus.tagcloud_data.off("update", this.on_tagcloud_data);
			this.props.bus.main_settings.off("update", this.on_main_settings);
		},

		componentDidMount: function() {
			var that = this;

			var tile_layer = L.tileLayer(config.url, {
				attribution: config.attribution,
			});

			this.map = L.map(this.getDOMNode(), {
				center: [13, 122],
				zoom: 6,
				layers: [tile_layer],
				minZoom: 5,
				maxZoom: 16,
				maxBounds: [
					[-1, 109],
					[27, 135]
				],
			});

			this.geojson_cache = {};
			this.url_added = {};
			this.hash_added = {};
			this.ajax_requests = [];

			this.choropleth = new ChoroplethLayer(this.props.bus);
			this.choropleth.addTo(this.map);

			this.tagcloud = new TagCloudLayer(this.props.bus);
			this.tagcloud.addTo(this.map);

			this.labels = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png");
			this.labels.addTo(this.map);
			this.map.getPanes().shadowPane.appendChild(this.labels.getContainer());
			this.labels.getContainer().style.pointerEvents = "none";

			this.last_level = "region";
			this.target_zoom = 0;
			this.update_view();
			
			this.map.on("viewreset moveend zoomend", this.update_view);
			this.props.bus.tagcloud_data.on("update", this.on_tagcloud_data);
			this.props.bus.main_settings.on("update", this.on_main_settings);
		},

		render: function() {
			return <div className="map-panel"></div>;
		},

		reset_geojson: function(level) {
			this.url_added = {};
			this.hash_added = {};
			_.each(this.ajax_requests, function(r){ r.abort(); });
			this.ajax_requests = [];
		},

		add_geojson: function(geojson_url) {
			var geojson = this.geojson_cache[geojson_url];
			if(geojson) {
				if(geojson !== true) {
					var hash = geojson.hash;
					if(!this.hash_added[hash]) {
						this.hash_added[hash] = true;
						this.choropleth.add_geojson(geojson);
						this.tagcloud.add_geojson(geojson);
					}
				}
			}else{
				if(this.url_added[geojson_url]) return;
				this.url_added[geojson_url] = true;
				var request = $.get(geojson_url)
					.success(function(data) {
						this.url_added[geojson_url] = true;
						if(typeof data === "object") {
							var options = _.defaults(this.choropleth.geojson_options, {
								onEachFeature: this.on_each_feature
							});
							var geojson = this.geojson_cache[geojson_url] = L.geoJson(data, options);
							geojson.hash = this.hash_geojson(data);
							this.add_geojson(geojson_url);
						}else{
							this.geojson_cache[geojson_url] = true;
						}
					}.bind(this))
					.fail(function(){
						this.url_added[geojson_url] = false;
					}.bind(this));

				this.ajax_requests.push(request);
			}
		},

		on_each_feature: function(feature, layer) {
			layer.on({
				click: function(e) {
					this.select(feature, layer);
				}.bind(this),
			});
		},

		select: function(feature, layer) {
			if(feature && layer) {
				this.props.bus.main_settings.emit("select", {
					area_code: parseInt(feature.properties.PSGC, 10),
					layer: layer,
					on_close: function() {
						this.select(null, null);
					}.bind(this),
				});
			}else{
				this.props.bus.main_settings.emit("select", null);
			}
		},

		hash_geojson: function(geojson) {
			var sum = 0;
			_.each(geojson.features, function(feature) {
				sum = (sum << 1) ^ (parseInt(feature.properties.PSGC) | 0);
			});
			return sum;
		},

		on_tagcloud_data: function(data) {
			this.labels.getContainer().style.display = data ? "none" : "block";
		},

		update_view: function() {
			var zoom = this.map.getZoom();
			if(zoom != this.last_zoom) this.props.bus.main_settings.emit("update", {zoom: zoom});
			this.last_zoom = zoom;

			var level;
			if(zoom >= 12) {
				level = "barangay";
			}else if(zoom >= 10) {
				level = "municipality";
			}else if(zoom >= 8) {
				level = "province";
			}else{
				level = "region";
			}

			var bounds = this.map.getBounds().pad(0.4);
			var nw = bounds.getNorthWest();
			var se = bounds.getSouthEast();

			var nw_tile = {x: this.long2tile(nw.lng, this.target_zoom), y: this.lat2tile(nw.lat, this.target_zoom)};
			var se_tile = {x: this.long2tile(se.lng, this.target_zoom), y: this.lat2tile(se.lat, this.target_zoom)};

			var t = 0;
			for (var x = se_tile.x; x >= nw_tile.x; x--) {
				for (var y = se_tile.y; y >= nw_tile.y; y--) {
					var path = this.target_zoom + "/" + x + "/" + y;
					setTimeout(this.add_geojson, t += 100, "api.php/geojson/" + this.last_level + "/" + path);
				}
			}
		},

		on_main_settings: function(settings) {
			if(!settings.level) return;

			var level = settings.level;
			if(level != this.last_level) this.reset_geojson(level);
			this.last_level = level;

			this.target_zoom = { // These zoom levels must match with the server
				"region": 0,
				"province": 8,
				"municipality": 10,
				"barangay": 12,
			}[level];

			var visual_zoom = {
				"region": {target: 6, min: 5, max: 7},
				"province": {target: 8, min: 6, max: 10},
				"municipality": {target: 10, min: 8, max: 13},
				"barangay": {target: 12, min: 11, max: 16},
			}[level];

			this.map.options.minZoom = visual_zoom.min;
			this.map.options.maxZoom = visual_zoom.max;

			if(this.map.getZoom() !== visual_zoom.target) {
				this.map.setZoom(visual_zoom.target);
			}else{
				this.update_view();
			}
		},

		long2tile: function(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); },
		lat2tile: function(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); },
	});
});