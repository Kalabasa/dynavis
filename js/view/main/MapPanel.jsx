"use strict";
define(["react", "leaflet", "config.map", "view/main/map/ChoroplethLayer", "view/main/map/TagCloudLayer"], function(React, L, config, ChoroplethLayer, TagCloudLayer) {
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
		},

		componentWillUnmount: function() {
			this.props.bus.main_settings.off("update", this.on_update_settings);
			this.props.bus.choropleth_settings.off("dataset", this.on_area_dataset);
			this.props.bus.tagcloud_settings.off("dataset", this.on_tag_dataset);
			this.map = null;
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

			this.geoJson_cache = {};
			this.current_geoJson = null;

			this.choropleth = new ChoroplethLayer();
			this.choropleth.addTo(this.map);

			this.tagcloud = new TagCloudLayer();
			this.tagcloud.addTo(this.map);

			this.labels = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png");
			this.labels.addTo(this.map);
			this.map.getPanes().shadowPane.appendChild(this.labels.getContainer());
			this.labels.getContainer().style.pointerEvents = "none";

			this.map.on("zoomend", this.on_zoom);
			this.on_zoom();
		},

		render: function() {
			return <div className="map-panel"></div>;
		},

		set_geojson: function(geojson_url) {
			var that = this;

			if(this.geoJson_cache[geojson_url] === this.current_geoJson) {
				return;
			}

			this.selected = null;

			if(this.geoJson_cache[geojson_url]) {
				var geoJson = this.current_geoJson = this.geoJson_cache[geojson_url];
				geoJson.url = geojson_url;
				this.choropleth.replace_geojson(geoJson);
				this.tagcloud.replace_geojson(geoJson);
			}else{
				var options = _.defaults(this.choropleth.geojson_options, {
					onEachFeature: function(feature, layer) {
						that.choropleth.on_feature(feature, layer);
						that.tagcloud.on_feature(feature, layer);
					}
				});
				$.get(geojson_url).success(function(data) {
					var geoJson = that.current_geoJson = that.geoJson_cache[geojson_url] = L.geoJson(data, options);
					geoJson.url = geojson_url;
					that.choropleth.replace_geojson(geoJson);
					that.tagcloud.replace_geojson(geoJson);
				});
			}
		},

		on_update_settings: function(e) {
			this.choropleth.set_year(e.year);
			this.tagcloud.set_year(e.year);
		},

		on_area_dataset: function(e) {
			var datasets = [];
			if(e.dataset1) {
				datasets.push(e.dataset1);
				if(e.dataset2) datasets.push(e.dataset2);
			}
			this.choropleth.set_dataset(datasets);
		},

		on_tag_dataset: function(e) {
			this.tagcloud.set_dataset(e.dataset);

			// TODO: move this to somewhere (tagcloud visibility listener?)
			this.labels.getContainer().style.display = e.dataset ? "none" : "block";
		},

		on_zoom: function() {
			if(this.map.getZoom() >= 12) {
				// this.set_geojson("data/barangay.json");
			}else if(this.map.getZoom() >= 10) {
				this.set_geojson("data/municipality.json");
			}else if(this.map.getZoom() >= 8) {
				this.set_geojson("data/province.json");
			}else{
				this.set_geojson("data/region.json");
			}

			// TODO: move this to somewhere into TagCloudLayer
			this.tagcloud.minimum_size = 20 / this.map.getZoom();
		},
	});
});