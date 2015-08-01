"use strict";
define(["react", "underscore", "leaflet", "config.map", "view/main/map/ChoroplethLayer", "view/main/map/TagCloudLayer"], function(React, _, L, config, ChoroplethLayer, TagCloudLayer) {
	return React.createClass({
		getInitialState: function() {
			return {
				selected: null,
				year: 2013,
			}
		},

		componentWillMount: function() {
			this.props.bus.main_settings.on("update", this.on_update_settings);
			this.props.bus.choropleth_settings.on("dataset", this.on_area_dataset);
			this.props.bus.tagcloud_settings.on("dataset", this.on_tag_dataset);

			this._interval = setInterval(function() {
				this.geojson_cache = {}; // clear cache once in a while
			}.bind(this), 2 * 60 * 1000);
		},

		componentWillUnmount: function() {
			this.props.bus.main_settings.off("update", this.on_update_settings);
			this.props.bus.choropleth_settings.off("dataset", this.on_area_dataset);
			this.props.bus.tagcloud_settings.off("dataset", this.on_tag_dataset);
			this.map = null;
			clearInterval(this._interval);
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
				maxZoom: 14,
				maxBounds: [
					[-1, 109],
					[27, 135]
				],
			});

			this.geojson_cache = {};
			this.hash_added = {};

			this.choropleth = new ChoroplethLayer();
			this.choropleth.addTo(this.map);

			this.tagcloud = new TagCloudLayer();
			this.tagcloud.addTo(this.map);

			this.labels = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png");
			this.labels.addTo(this.map);
			this.map.getPanes().shadowPane.appendChild(this.labels.getContainer());
			this.labels.getContainer().style.pointerEvents = "none";

			this.last_level = 0;
			this.map.on("viewreset moveend zoomend", this.update_view);
			this.update_view();
		},

		render: function() {
			return <div className="map-panel"></div>;
		},

		reset_geojson: function() {
			this.choropleth.reset_geojson();
			this.tagcloud.reset_geojson();
			this.hash_added = {};
			this.selected = null;
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
					onEachFeature: function(feature, layer) {
						this.choropleth.on_feature(feature, layer);
						this.tagcloud.on_feature(feature, layer);
					}.bind(this)
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

		hash_geojson: function(geojson) {
			var sum = 0;
			_.each(geojson.features, function(feature) {
				sum = (sum << 1) ^ (parseInt(feature.properties.PSGC) | 0);
			});
			return sum;
		},

		on_update_settings: function(e) {
			this.choropleth.set_year(e.year);
			this.tagcloud.set_year(e.year);
		},

		on_area_dataset: function(e) {
			var datasets = [e.dataset1, e.dataset2];
			this.choropleth.set_dataset(datasets);
		},

		on_tag_dataset: function(e) {
			this.tagcloud.set_dataset(e.dataset);

			// TODO: move this to somewhere (tagcloud visibility listener?)
			this.labels.getContainer().style.display = e.dataset ? "none" : "block";
		},

		update_view: function() {
			// TODO: move this to somewhere into TagCloudLayer
			this.tagcloud.minimum_size = 16 / this.map.getZoom();

			var zoom = this.map.getZoom();

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

			if(level != this.last_level) this.reset_geojson();
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