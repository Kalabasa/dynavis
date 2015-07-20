"use strict";
define(["react", "leaflet", "config.map", "view/main/ChoroplethLayer"], function(React, L, config, ChoroplethLayer) {
	return React.createClass({
		getInitialState: function() {
			return {
				selected: null,
				year: 2013,
			}
		},

		componentWillMount: function() {
			this.props.bus.choropleth_settings.on("dataset", this.on_area_dataset);
		},

		componentWillUnmount: function() {
			this.props.bus.choropleth_settings.off("dataset", this.on_area_dataset);
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

			this.choropleth = new ChoroplethLayer();
			this.choropleth.addTo(this.map);

			this.map.on("zoomend", this.on_zoom);
			this.on_zoom();
		},

		render: function() {
			return (
				<div className="map-panel"></div>
			);
		},

		on_area_dataset: function(e) {
			var datasets = [];
			if(e.dataset1) {
				datasets.push(e.dataset1);
				if(e.dataset2) datasets.push(e.dataset2);
			}
			this.choropleth.set_dataset(datasets);
		},

		on_zoom: function() {
			if(this.map.getZoom() >= 12) {
				// this.choropleth.set_geojson("json/Barangays.psgc.json");
			}else if(this.map.getZoom() >= 10) {
				this.choropleth.set_geojson("json/MuniCities.psgc.json");
			}else if(this.map.getZoom() >= 8) {
				this.choropleth.set_geojson("json/Provinces.psgc.json");
			}else{
				this.choropleth.set_geojson("json/Regions.psgc.json");
			}
		},
	});
});