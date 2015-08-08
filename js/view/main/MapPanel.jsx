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
			this.hash_added = {};

			this.choropleth = new ChoroplethLayer(this.props.bus);
			this.choropleth.addTo(this.map);

			this.tagcloud = new TagCloudLayer(this.props.bus);
			this.tagcloud.addTo(this.map);

			this.labels = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png");
			this.labels.addTo(this.map);
			this.map.getPanes().shadowPane.appendChild(this.labels.getContainer());
			this.labels.getContainer().style.pointerEvents = "none";

			this.map.on("viewreset moveend zoomend", this.update_view);
			this.reset_geojson();
			this.update_view();
			
			this.props.bus.tagcloud_data.on("update", this.on_tagcloud_data);
		},

		render: function() {
			return <div className="map-panel"></div>;
		},

		reset_geojson: function(level) {
			this.props.bus.main_settings.emit("update", {level: level});
			this.hash_added = {};
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
					}x
				}
			}else{
				var options = _.defaults(this.choropleth.geojson_options, {
					onEachFeature: this.on_each_feature
				});
				$.get(geojson_url).success(function(data) {
					if(typeof data === "object") {
						var geojson = this.geojson_cache[geojson_url] = L.geoJson(data, options);
						geojson.hash = this.hash_geojson(data);
						this.add_geojson(geojson_url);
					}else{
						this.geojson_cache[geojson_url] = true;
					}
				}.bind(this));
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

			if(level != this.last_level) this.reset_geojson(level);
			this.last_level = level;

			var target_zoom = { // These zoom levels must match with the server
				"region": 0,
				"province": 8,
				"municipality": 10,
				"barangay": 12,
			}[level];

			var bounds = this.map.getBounds().pad(0.4);
			var nw = bounds.getNorthWest();
			var se = bounds.getSouthEast();

			var nw_tile = {x: this.long2tile(nw.lng, target_zoom), y: this.lat2tile(nw.lat, target_zoom)};
			var se_tile = {x: this.long2tile(se.lng, target_zoom), y: this.lat2tile(se.lat, target_zoom)};

			for (var x = se_tile.x; x >= nw_tile.x; x--) {
				for (var y = se_tile.y; y >= nw_tile.y; y--) {
					var path = target_zoom + "/" + x + "/" + y;
					this.add_geojson("api.php/geojson/" + level + "/" + path);
				}
			}
		},

		long2tile: function(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); },
		lat2tile: function(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); },
	});
});