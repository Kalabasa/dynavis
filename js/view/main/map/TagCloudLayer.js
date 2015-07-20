"use strict";
define(["underscore", "leaflet"], function(_, L) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);

			this._current_geoJson = null;

			this._dataset = null;

			this.year = new Date().getFullYear();
		},

		onAdd: function (map) {
			this.map = map;
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_dataset: function(dataset) {
			this._dataset = dataset;
			window.dataset = dataset;
			this.redraw();
		},

		replace_geojson: function(geoJson) {
			this._current_geoJson = geoJson;
			this.redraw();
		},

		on_feature: function(feature, layer) {
			var that = this;

			var area_code = parseInt(feature.properties.PSGC, 10);
			layer.families = null;
		},

		redraw: function() {
		},
	});
});